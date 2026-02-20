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
  options: { status?: string } = {}
): Promise<Contract[]> {
  let query = supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
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
    client_id: contract.client_id,
    action: 'contract_created',
    description: `Contract ${contract.title} was created`,
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

  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

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
    client_id: contract.client_id,
    action: 'contract_published',
    description: `Contract ${contract.title} was published`,
    user_id: userId,
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
    client_id: contract.client_id,
    action: 'contract_viewed',
    description: `Contract ${contract.title} was viewed by client`,
    user_id: userId,
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
    client_id: contract.client_id,
    action: 'changes_requested',
    description: `Changes requested on contract ${contract.title}`,
    user_id: userId,
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
      client_signature_storage_id: signatureStorageId,
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
    client_id: contract.client_id,
    action: 'contract_client_signed',
    description: `Contract ${contract.title} was signed by client`,
    user_id: userId,
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
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
      admin_signature_storage_id: signatureStorageId,
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
    client_id: contract.client_id,
    action: 'contract_countersigned',
    description: `Contract ${contract.title} was countersigned and finalized`,
    user_id: userId,
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return contract;
}
