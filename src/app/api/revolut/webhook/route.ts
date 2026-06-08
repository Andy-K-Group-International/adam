import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

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

async function handleOrderCompleted(order: Record<string, unknown>) {
  const supabase = createAdminClient();
  const email = extractField(order, "email", "customer_email");
  const meta  = (order.metadata as Record<string, string> | undefined) ?? {};
  const plan    = meta.plan    ?? "";
  const billing = meta.billing ?? "monthly";
  const company = meta.company ?? null;

  void supabase.from("activity_log").insert({
    action: "payment_completed",
    description: `Revolut payment completed: ${plan} (${billing})${company ? ` — ${company}` : ""}${email ? ` — ${email}` : ""}`,
    created_at: new Date().toISOString(),
  });
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
