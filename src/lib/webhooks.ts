import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac } from "crypto";

export type WebhookEvent =
  | "client.created"
  | "client.activated"
  | "contract.signed"
  | "invoice.paid"
  | "lead.qualified"
  | "proposal.approved";

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

export async function triggerWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  const supabase = createAdminClient();

  const { data: endpoints } = await supabase
    .from("webhook_endpoints")
    .select("id, url, secret, events")
    .eq("active", true)
    .contains("events", [event]);

  if (!endpoints?.length) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };
  const body = JSON.stringify(payload);

  await Promise.allSettled(
    endpoints.map((ep) => deliverWebhook(ep, event, body, payload))
  );
}

async function deliverWebhook(
  ep: { id: string; url: string; secret: string },
  event: string,
  body: string,
  payload: WebhookPayload
) {
  const supabase = createAdminClient();
  const sig = createHmac("sha256", ep.secret).update(body).digest("hex");

  let httpStatus: number | null = null;
  let error: string | null = null;
  let status: "delivered" | "failed" = "delivered";

  try {
    const res = await fetch(ep.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ADAM-Signature": `sha256=${sig}`,
        "X-ADAM-Event": event,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    httpStatus = res.status;
    if (!res.ok) {
      status = "failed";
      error = `HTTP ${res.status}`;
    }
  } catch (err) {
    status = "failed";
    error = err instanceof Error ? err.message : "Unknown error";
  }

  await supabase.from("webhook_deliveries").insert({
    endpoint_id: ep.id,
    event,
    payload,
    status,
    http_status: httpStatus,
    error,
    delivered_at: status === "delivered" ? new Date().toISOString() : null,
  });
}
