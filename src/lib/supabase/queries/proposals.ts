import type { SupabaseClient } from '@supabase/supabase-js';
import type { Proposal } from '@/lib/supabase/types';

export async function generateProposalRef(
  supabase: SupabaseClient,
  clientId: string
): Promise<string | null> {
  const { data: client } = await supabase
    .from('clients')
    .select('client_ref')
    .eq('id', clientId)
    .single();

  if (!client?.client_ref) return null;

  const { count } = await supabase
    .from('proposals')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId);

  const seq = String((count ?? 0) + 1).padStart(3, '0');
  return `${client.client_ref}-PROP-${seq}`;
}

export async function listProposals(
  supabase: SupabaseClient,
  options: { status?: string; clientId?: string; questionnaireId?: string; userId?: string } = {}
): Promise<Proposal[]> {
  let query = supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.clientId) {
    query = query.eq('client_id', options.clientId);
  }

  if (options.questionnaireId) {
    query = query.eq('questionnaire_id', options.questionnaireId);
  }

  if (options.userId) {
    const { data: clientRows } = await supabase
      .from('clients')
      .select('id')
      .eq('assigned_to', options.userId);
    const clientIds = (clientRows ?? []).map((r: any) => r.id);
    if (clientIds.length === 0) return [];
    query = query.in('client_id', clientIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list proposals: ${error.message}`);
  }

  return data;
}

export async function getProposalById(
  supabase: SupabaseClient,
  id: string
): Promise<Proposal> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to get proposal: ${error.message}`);
  }

  return data;
}

export async function createProposal(
  supabase: SupabaseClient,
  data: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>
): Promise<Proposal> {
  const { data: proposal, error } = await supabase
    .from('proposals')
    .insert({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create proposal: ${error.message}`);
  }

  return proposal;
}

export async function updateProposal(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Proposal>
): Promise<Proposal> {
  const { data: proposal, error } = await supabase
    .from('proposals')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update proposal: ${error.message}`);
  }

  return proposal;
}
