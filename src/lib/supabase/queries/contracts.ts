import type { SupabaseClient } from '@supabase/supabase-js';
import type { Contract } from '@/lib/supabase/types';

export async function listContractsForClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<Contract[]> {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list contracts for client: ${error.message}`);
  }

  return data;
}

export async function listAllContracts(
  supabase: SupabaseClient,
  options: { status?: string; userId?: string } = {}
): Promise<Contract[]> {
  let query = supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
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
    throw new Error(`Failed to list contracts: ${error.message}`);
  }

  return data;
}

export async function getContractById(
  supabase: SupabaseClient,
  id: string
): Promise<Contract> {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to get contract: ${error.message}`);
  }

  return data;
}

export async function createContract(
  supabase: SupabaseClient,
  data: Omit<Contract, 'id' | 'status' | 'created_at' | 'updated_at'>
): Promise<Contract> {
  const { data: contract, error } = await supabase
    .from('contracts')
    .insert({
      ...data,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create contract: ${error.message}`);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    type: 'contract_created',
    client_id: contract.client_id,
    contract_id: contract.id,
    metadata: { contract_title: contract.title },
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return contract;
}

export async function updateContract(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Contract>
): Promise<Contract> {
  // Only allow updates on draft or changes_requested contracts
  const { data: existing, error: fetchError } = await supabase
    .from('contracts')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch contract: ${fetchError.message}`);
  }

  if (existing.status !== 'draft' && existing.status !== 'changes_requested') {
    throw new Error(`Cannot update contract in status: ${existing.status}`);
  }

  // Optimistic lock: require the status to still match what we just read.
  // Without this, two admins editing the same draft concurrently would
  // silently last-write-win — the second save now fails cleanly instead.
  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', existing.status)
    .select('*')
    .maybeSingle();

  if (!error && !contract) {
    throw new Error('This contract was modified by someone else — please reload and try again');
  }

  if (error) {
    throw new Error(`Failed to update contract: ${error.message}`);
  }

  return contract;
}

export async function publishContract(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<Contract> {
  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      status: 'published',
      published_by: userId,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to publish contract: ${error.message}`);
  }

  // Create version snapshot
  const { error: versionError } = await supabase.from('contract_versions').insert({
    contract_id: id,
    version_number: contract.version || 1,
    content: contract.content,
    created_by: userId,
    created_at: new Date().toISOString(),
  });

  if (versionError) {
    console.error('Failed to create version snapshot:', versionError.message);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    type: 'contract_published',
    client_id: contract.client_id,
    contract_id: id,
    actor_id: userId,
    metadata: { contract_title: contract.title },
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return contract;
}

export async function markViewed(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<Contract> {
  // Only mark as viewed if currently published
  const { data: existing, error: fetchError } = await supabase
    .from('contracts')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch contract: ${fetchError.message}`);
  }

  if (existing.status !== 'published') {
    throw new Error('Can only mark published contracts as viewed');
  }

  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      status: 'viewed',
      viewed_at: new Date().toISOString(),
      viewed_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to mark contract as viewed: ${error.message}`);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    type: 'contract_viewed',
    client_id: contract.client_id,
    contract_id: id,
    actor_id: userId,
    metadata: { contract_title: contract.title },
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return contract;
}

export async function requestChanges(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  comment: string
): Promise<Contract> {
  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      status: 'changes_requested',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to request changes: ${error.message}`);
  }

  // Add comment
  const { error: commentError } = await supabase.from('contract_comments').insert({
    contract_id: id,
    user_id: userId,
    content: comment,
    type: 'change_request',
    created_at: new Date().toISOString(),
  });

  if (commentError) {
    console.error('Failed to add comment:', commentError.message);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    type: 'contract_changes_requested',
    client_id: contract.client_id,
    contract_id: id,
    actor_id: userId,
    metadata: { contract_title: contract.title },
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return contract;
}

export async function clientSign(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  signatureStorageId: string
): Promise<Contract> {
  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      status: 'client_signed',
      client_signature: signatureStorageId,
      client_signed_by: userId,
      client_signed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to sign contract: ${error.message}`);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    type: 'contract_client_signed',
    client_id: contract.client_id,
    contract_id: id,
    actor_id: userId,
    metadata: { contract_title: contract.title },
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return contract;
}

export async function verifyAppendix(
  supabase: SupabaseClient,
  contractId: string,
  slot: string
): Promise<Contract> {
  const { data: existing, error: fetchError } = await supabase
    .from('contracts')
    .select('appendices')
    .eq('id', contractId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch contract: ${fetchError.message}`);
  }

  const updatedAppendices = (existing.appendices || []).map((a: { slot: string }) =>
    a.slot === slot ? { ...a, status: 'verified', rejectionNote: undefined } : a
  );

  const { data: contract, error } = await supabase
    .from('contracts')
    .update({ appendices: updatedAppendices, updated_at: new Date().toISOString() })
    .eq('id', contractId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to verify appendix: ${error.message}`);
  }

  return contract;
}

export async function rejectAppendix(
  supabase: SupabaseClient,
  contractId: string,
  slot: string,
  rejectionNote?: string
): Promise<Contract> {
  const { data: existing, error: fetchError } = await supabase
    .from('contracts')
    .select('appendices')
    .eq('id', contractId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch contract: ${fetchError.message}`);
  }

  const updatedAppendices = (existing.appendices || []).map((a: { slot: string }) =>
    a.slot === slot ? { ...a, status: 'rejected', rejectionNote: rejectionNote || '' } : a
  );

  const { data: contract, error } = await supabase
    .from('contracts')
    .update({ appendices: updatedAppendices, updated_at: new Date().toISOString() })
    .eq('id', contractId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to reject appendix: ${error.message}`);
  }

  return contract;
}

export async function countersign(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  signatureStorageId: string
): Promise<Contract> {
  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      status: 'final',
      admin_signature: signatureStorageId,
      admin_signed_by: userId,
      admin_signed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to countersign contract: ${error.message}`);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    type: 'contract_countersigned',
    client_id: contract.client_id,
    contract_id: id,
    actor_id: userId,
    metadata: { contract_title: contract.title },
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return contract;
}
