import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paymentsEnabled } from "@/lib/payments";

const APP_URL = "https://adam.andykgroup.com";

// All amounts in pence (GBP × 100)
const PLANS = {
  starter_monthly: { amount: 34900,  description: "A.D.A.M. Starter — Monthly" },
  growth_monthly:  { amount: 69900,  description: "A.D.A.M. Growth — Monthly"  },
  scale_monthly:   { amount: 129900, description: "A.D.A.M. Scale — Monthly"   },
  starter_annual:  { amount: 251280, description: "A.D.A.M. Starter — Annual (40% off)" },
  growth_annual:   { amount: 503280, description: "A.D.A.M. Growth — Annual (40% off)"  },
  scale_annual:    { amount: 935280, description: "A.D.A.M. Scale — Annual (40% off)"   },
} as const;

type PlanKey = keyof typeof PLANS;

async function validateAndRedeemCode(
  code: string,
  billing: string
): Promise<{ discount: number; error?: string }> {
  if (billing === "annual") return { discount: 0 };

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("founding_codes")
    .select("id, discount_percent, used_count, max_uses, active")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!data || !data.active || data.used_count >= data.max_uses) {
    return { discount: 0, error: "Invalid or already-used founding code" };
  }

  // Mark used
  await supabase
    .from("founding_codes")
    .update({
      used_count: data.used_count + 1,
      used_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  return { discount: data.discount_percent };
}

export async function POST(req: NextRequest) {
  // TEMPORARY — internal test bypass. Removed after internal payment test phase.
  const testToken = req.headers.get("X-Internal-Test");
  const cronSecret = process.env.CRON_SECRET;
  const isInternalTest = !!(testToken && cronSecret && testToken === cronSecret);

  if (!paymentsEnabled && !isInternalTest) {
    return NextResponse.json(
      { error: "Payments are not yet active. Please apply for access." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { plan, billing, founding_code, company, terms_version, terms_accepted_at } = body as {
    plan?: string;
    billing?: "monthly" | "annual";
    founding_code?: string;
    company?: string;
    terms_version?: string;
    terms_accepted_at?: string;
  };

  if (!plan || !billing) {
    return NextResponse.json({ error: "plan and billing are required" }, { status: 400 });
  }

  const planKey = `${plan}_${billing}` as PlanKey;
  if (!(planKey in PLANS)) {
    return NextResponse.json({ error: `Invalid plan: ${planKey}` }, { status: 400 });
  }

  const secret = process.env.REVOLUT_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Revolut not configured" }, { status: 500 });

  const planConfig = PLANS[planKey];
  let amount: number = planConfig.amount;

  // Apply founding code if provided (monthly only — annual already 40% off)
  let codeError: string | undefined;
  if (founding_code?.trim() && billing === "monthly") {
    const { discount, error } = await validateAndRedeemCode(founding_code, billing);
    if (error) {
      codeError = error;
    } else if (discount > 0) {
      amount = Math.round(amount * (1 - discount / 100));
    }
  }

  const res = await fetch("https://merchant.revolut.com/api/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      "Revolut-Api-Version": "2024-09-01",
      Accept: "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "GBP",
      description: planConfig.description,
      redirect_url: `${APP_URL}/payment-success?plan=${plan}&billing=${billing}`,
      cancel_url:   `${APP_URL}/payment-failed`,
      metadata: {
        plan,
        billing,
        company: company ?? null,
        terms_version: terms_version ?? "v2.0",
        terms_accepted_at: terms_accepted_at ?? new Date().toISOString(),
        ...(founding_code ? { founding_code } : {}),
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[revolut/subscription]", res.status, err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }

  const order = await res.json();
  const checkout_url =
    order.checkout_url ?? `https://checkout.revolut.com/pay/${order.public_id}`;

  return NextResponse.json({
    checkout_url,
    order_id: order.id,
    ...(codeError ? { code_warning: codeError } : {}),
  });
}
