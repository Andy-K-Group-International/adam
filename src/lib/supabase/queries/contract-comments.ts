import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractComment } from '@/lib/supabase/types';

export async function listByContract(
  supabase: SupabaseClient,
  contractId: string
): Promise<(ContractComment & { user: { id: string; name: string; email: string } | null })[]> {
  const { data, error } = await supabase
    .from('contract_comments')
    .select('*, user:users(id, name, email)')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to list contract comments: ${error.message}`);
  }

  return data;
}

export async function createComment(
  supabase: SupabaseClient,
  data: Omit<ContractComment, 'id' | 'created_at'>
): Promise<ContractComment> {
  const { data: comment, error } = await supabase
    .from('contract_comments')
    .insert({
      ...data,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`);
  }

  // Log activity - get contract info for the log
  const { data: contract } = await supabase
    .from('contracts')
    .select('client_id, title')
    .eq('id', data.contract_id)
    .single();

  if (contract) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      client_id: contract.client_id,
      action: 'comment_added',
      description: `Comment added on contract ${contract.title}`,
      user_id: data.author_id,
      created_at: new Date().toISOString(),
    });

    if (activityError) {
      console.error('Failed to log activity:', activityError.message);
    }
  }

  return comment;
}
