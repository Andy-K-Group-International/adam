import type { SupabaseClient } from "@supabase/supabase-js";
import type { KycVerification } from "@/lib/supabase/types";

export async function getKycByClientId(
  supabase: SupabaseClient,
  clientId: string
): Promise<KycVerification | null> {
  const { data, error } = await supabase
    .from("kyc_verifications")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw new Error(`Failed to get KYC: ${error.message}`);
  return data ?? null;
}

export async function upsertKyc(
  supabase: SupabaseClient,
  clientId: string,
  patch: Partial<Omit<KycVerification, "id" | "created_at" | "updated_at">>
): Promise<KycVerification> {
  const { data, error } = await supabase
    .from("kyc_verifications")
    .upsert(
      {
        client_id: clientId,
        ...patch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to upsert KYC: ${error.message}`);
  return data;
}

export async function updateKyc(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<KycVerification>
): Promise<KycVerification> {
  const { data, error } = await supabase
    .from("kyc_verifications")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update KYC: ${error.message}`);
  return data;
}

export async function listKycForClients(
  supabase: SupabaseClient,
  clientIds: string[]
): Promise<Pick<KycVerification, "id" | "client_id" | "status">[]> {
  if (clientIds.length === 0) return [];
  const { data, error } = await supabase
    .from("kyc_verifications")
    .select("id, client_id, status")
    .in("client_id", clientIds);

  if (error) throw new Error(`Failed to list KYC: ${error.message}`);
  return (data ?? []) as Pick<KycVerification, "id" | "client_id" | "status">[];
}
