import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractVersion } from '@/lib/supabase/types';

export async function listByContract(
  supabase: SupabaseClient,
  contractId: string
): Promise<ContractVersion[]> {
  const { data, error } = await supabase
    .from('contract_versions')
    .select('*')
    .eq('contract_id', contractId)
    .order('version_number', { ascending: false });

  if (error) {
    throw new Error(`Failed to list contract versions: ${error.message}`);
  }

  return data;
}

export async function createVersion(
  supabase: SupabaseClient,
  data: Omit<ContractVersion, 'id' | 'created_at'>
): Promise<ContractVersion> {
  const { data: version, error } = await supabase
    .from('contract_versions')
    .insert({
      ...data,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create contract version: ${error.message}`);
  }

  return version;
}
