"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface AgreementSnapshotData {
  clientId?: string | null;
  email: string;
  termsVersion: string;
  serviceDefinitionVersion?: string;
  planName: string;
  billingCycle: string;
  priceGbp?: number | null;
  aiMode?: string | null;
  acceptedByEmail?: string | null;
  businessVerificationStatus?: string | null;
  foundingClient?: boolean;
  foundingCode?: string | null;
  metadata?: Record<string, unknown> | null;
  eventType?: "payment" | "activation" | "renewal";
}

export async function createAgreementSnapshot(data: AgreementSnapshotData) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("client_agreement_snapshots").insert({
      client_id: data.clientId ?? null,
      email: data.email,
      terms_version: data.termsVersion,
      service_definition_version: data.serviceDefinitionVersion ?? "v1.0",
      plan_name: data.planName,
      billing_cycle: data.billingCycle,
      price_gbp: data.priceGbp ?? null,
      ai_mode: data.aiMode ?? "basic",
      accepted_at: new Date().toISOString(),
      accepted_by_email: data.acceptedByEmail ?? data.email,
      business_verification_status: data.businessVerificationStatus ?? "pending",
      founding_client: data.foundingClient ?? false,
      founding_code: data.foundingCode ?? null,
      metadata: data.metadata ?? null,
      event_type: data.eventType ?? "payment",
    });
    if (error) console.error("[snapshots] createAgreementSnapshot error:", error.message);
  } catch (err) {
    console.error("[snapshots] unexpected error:", err);
  }
}

export async function getClientSnapshots(clientId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("client_agreement_snapshots")
    .select("*")
    .eq("client_id", clientId)
    .order("accepted_at", { ascending: false });
  return data ?? [];
}
