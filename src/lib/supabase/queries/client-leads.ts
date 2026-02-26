import type { SupabaseClient } from "@supabase/supabase-js";

export async function getLeadByEmail(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase
    .from("client_leads")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(`Failed to get lead: ${error.message}`);
  return data;
}

export async function upsertLead(
  supabase: SupabaseClient,
  lead: {
    email: string;
    pre_qualification_completed?: boolean;
    pre_qualification_completed_at?: string;
    pre_qualification_data?: Record<string, unknown>;
    service_type?: string;
  }
) {
  const { data, error } = await supabase
    .from("client_leads")
    .upsert(lead, { onConflict: "email" })
    .select()
    .single();
  if (error) throw new Error(`Failed to upsert lead: ${error.message}`);
  return data;
}
