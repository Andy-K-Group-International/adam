import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAgreementSnapshot } from "@/lib/snapshots";

export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, sigHeader: string, secret: string): boolean {
  const match = sigHeader.match(/v1=(?:(\d+)\.)?([a-f0-9]+)/i);
  if (!match) return false;
  const [, timestamp, hexSig] = match;
  const payload = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  try {
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (expected.length !== hexSig.length) return false;
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hexSig, "hex"));
  } catch {
    return false;
  }
}

function extractField(data: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = (data[key] as string | undefined) ?? ((data.customer as Record<string, unknown>)?.[key] as string | undefined);
    if (val) return String(val).toLowerCase().trim();
  }
  return "";
}

async function sendAdminPaymentAlert({
  company,
  plan,
  billing,
  email,
  orderId,
  foundingCode,
}: {
  company: string | null;
  plan: string;
  billing: string;
  email: string;
  orderId: string;
  foundingCode?: string;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return;

  const subject = `[A.D.A.M.] Payment received — ${company ?? email} — ${plan} (${billing}) — awaiting activation`;
  const text = [
    "New payment received on A.D.A.M.",
    "",
    `Company: ${company ?? "(not provided)"}`,
    `Email: ${email}`,
    `Plan: ${plan} — ${billing}`,
    `Revolut Order ID: ${orderId}`,
    foundingCode ? `Founding code: ${foundingCode}` : null,
    "",
    "Status: paid_pending_verification",
    "Action required: verify business documents and activate subscription in admin panel.",
    "",
    "Admin panel: https://adam.andykgroup.com/admin/clients",
  ].filter(Boolean).join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Andy'K Group International LTD <info@andykgroup.com>",
      to: ["ceo@andykgroup.com"],
      subject,
      text,
    }),
  }).catch((err) => console.error("[revolut/webhook] admin email error", err));
}

async function handleOrderCompleted(order: Record<string, unknown>) {
  const supabase = createAdminClient();
  const email = extractField(order, "email", "customer_email");
  const meta  = (order.metadata as Record<string, string> | undefined) ?? {};
  const plan           = meta.plan    ?? "";
  const billing        = meta.billing ?? "monthly";
  const company        = meta.company ?? null;
  const termsVersion   = meta.terms_version ?? null;
  const termsAcceptedAt = meta.terms_accepted_at ?? null;
  const foundingCode   = meta.founding_code ?? null;
  const orderId        = String(order.id ?? "");

  const now = new Date().toISOString();

  if (email) {
    // Primary lookup: clients.contact_email
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("contact_email", email)
      .maybeSingle();

    let clientId: string | null = existingClient?.id ?? null;
    let matchPath: "contact_email" | "contacts_fallback" | "no_match" =
      clientId ? "contact_email" : "no_match";

    // Fallback: contacts table (primary contact email → client_id)
    if (!clientId) {
      try {
        const { data: contactRow } = await supabase
          .from("contacts")
          .select("client_id")
          .eq("email", email)
          .eq("is_primary", true)
          .maybeSingle();
        if (contactRow?.client_id) {
          clientId = contactRow.client_id;
          matchPath = "contacts_fallback";
          console.log(`[revolut/webhook] contact_email miss — matched via contacts table for ${email}`);
        }
      } catch (err) {
        console.error("[revolut/webhook] contacts fallback lookup failed", err);
      }
    }

    if (clientId) {
      await supabase.from("clients").update({
        plan_name: plan || null,
        billing_cycle: billing || null,
        subscription_status: "paid_pending_verification",
        payment_date: now,
        payment_provider: "revolut",
        revolut_order_id: orderId || null,
        terms_version_accepted: termsVersion,
        terms_accepted_at: termsAcceptedAt,
        founding_client: !!foundingCode,
        founding_code_used: foundingCode,
      }).eq("id", clientId);

      await createAgreementSnapshot({
        clientId,
        email,
        planName: plan || "",
        billingCycle: billing || "monthly",
        priceGbp: null,
        termsVersion: termsVersion ?? "v2.0",
        serviceDefinitionVersion: "v1.0",
        aiMode: null,
        acceptedByEmail: email,
        businessVerificationStatus: "pending",
        foundingClient: !!foundingCode,
        foundingCode: foundingCode,
        eventType: "payment",
      }).catch((err) => console.error("[revolut/webhook] snapshot error", err));

      await supabase.from("activity_log").insert({
        type: "payment_completed",
        client_id: clientId,
        metadata: {
          plan,
          billing,
          company,
          order_id: orderId,
          match_path: matchPath,
          source: "revolut_webhook",
        },
        created_at: now,
      });
    } else {
      await supabase.from("activity_log").insert({
        type: "payment_completed",
        metadata: {
          plan,
          billing,
          company,
          email,
          order_id: orderId,
          match_path: "no_match",
          note: "No matching client found for email",
          source: "revolut_webhook",
        },
        created_at: now,
      });
    }
  }

  await sendAdminPaymentAlert({ company, plan, billing, email, orderId, foundingCode: foundingCode ?? undefined });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sigHeader = req.headers.get("Revolut-Signature") ?? "";
  const secret = process.env.REVOLUT_SECRET_KEY;

  if (!secret) {
    console.error("[revolut/webhook] REVOLUT_SECRET_KEY not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  if (!verifySignature(rawBody, sigHeader, secret)) {
    console.warn("[revolut/webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; order?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "ORDER_COMPLETED" && event.order) {
    await handleOrderCompleted(event.order).catch((err) =>
      console.error("[revolut/webhook] handleOrderCompleted error", err)
    );
  }

  return NextResponse.json({ received: true });
}
