import type { SupabaseClient } from "@supabase/supabase-js";
import type { StrategyVersion } from "@/lib/supabase/types";

export async function listStrategyVersions(
  supabase: SupabaseClient,
  clientId: string,
  limit = 10
): Promise<StrategyVersion[]> {
  const { data, error } = await supabase
    .from("strategy_versions")
    .select("*")
    .eq("client_id", clientId)
    .order("version", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getNextStrategyVersionNumber(
  supabase: SupabaseClient,
  clientId: string
): Promise<number> {
  const { data } = await supabase
    .from("strategy_versions")
    .select("version")
    .eq("client_id", clientId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.version ?? 0) + 1;
}

export async function createStrategyVersion(
  supabase: SupabaseClient,
  data: {
    client_id: string;
    strategy_type: string | null;
    strategy_notes: string;
    snapshot_label: string;
    created_by: string | null;
  }
): Promise<StrategyVersion> {
  const nextVersion = await getNextStrategyVersionNumber(supabase, data.client_id);
  const label = data.snapshot_label || (nextVersion === 1 ? "Initial draft" : `Revision ${nextVersion}`);

  const { data: inserted, error } = await supabase
    .from("strategy_versions")
    .insert({ ...data, version: nextVersion, snapshot_label: label })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  // Prune to max 10 versions
  await pruneStrategyVersions(supabase, data.client_id, 10);

  return inserted;
}

async function pruneStrategyVersions(
  supabase: SupabaseClient,
  clientId: string,
  maxVersions: number
): Promise<void> {
  const { data } = await supabase
    .from("strategy_versions")
    .select("id, version")
    .eq("client_id", clientId)
    .order("version", { ascending: false });

  if (!data || data.length <= maxVersions) return;

  const toDelete = data.slice(maxVersions).map((r) => r.id);
  await supabase.from("strategy_versions").delete().in("id", toDelete);
}
