import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProposalVersion } from "@/lib/supabase/types";

export async function listProposalVersions(
  supabase: SupabaseClient,
  proposalId: string
): Promise<ProposalVersion[]> {
  const { data, error } = await supabase
    .from("proposal_versions")
    .select("*")
    .eq("proposal_id", proposalId)
    .order("version", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getNextProposalVersionNumber(
  supabase: SupabaseClient,
  proposalId: string
): Promise<number> {
  const { data } = await supabase
    .from("proposal_versions")
    .select("version")
    .eq("proposal_id", proposalId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.version ?? 0) + 1;
}

export async function createProposalVersion(
  supabase: SupabaseClient,
  data: {
    proposal_id: string;
    sections: unknown[];
    addons: unknown | null;
    service_type: string | null;
    snapshot_label: string;
    created_by: string | null;
  }
): Promise<ProposalVersion> {
  const nextVersion = await getNextProposalVersionNumber(supabase, data.proposal_id);
  const { data: inserted, error } = await supabase
    .from("proposal_versions")
    .insert({ ...data, version: nextVersion })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return inserted;
}
