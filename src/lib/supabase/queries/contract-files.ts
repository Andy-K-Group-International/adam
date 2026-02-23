import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractFile } from '@/lib/supabase/types';

export async function createFile(
  supabase: SupabaseClient,
  data: Omit<ContractFile, 'id' | 'created_at'>
): Promise<ContractFile> {
  const { data: file, error } = await supabase
    .from('contract_files')
    .insert({
      ...data,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create contract file: ${error.message}`);
  }

  // Update appendix status on the contract if slot is specified
  if (data.slot) {
    const appendixField = `appendix_${data.slot}_status`;
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        [appendixField]: 'uploaded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.contract_id);

    if (updateError) {
      console.error('Failed to update appendix status:', updateError.message);
    }
  }

  return file;
}

export async function verifyAppendix(
  supabase: SupabaseClient,
  contractId: string,
  slot: string
): Promise<void> {
  const appendixField = `appendix_${slot}_status`;

  const { error } = await supabase
    .from('contracts')
    .update({
      [appendixField]: 'verified',
      updated_at: new Date().toISOString(),
    })
    .eq('id', contractId);

  if (error) {
    throw new Error(`Failed to verify appendix: ${error.message}`);
  }

  // Log activity
  const { data: contract } = await supabase
    .from('contracts')
    .select('client_id, title')
    .eq('id', contractId)
    .single();

  if (contract) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      client_id: contract.client_id,
      action: 'appendix_verified',
      description: `Appendix ${slot} verified for contract ${contract.title}`,
      created_at: new Date().toISOString(),
    });

    if (activityError) {
      console.error('Failed to log activity:', activityError.message);
    }
  }
}

export async function rejectAppendix(
  supabase: SupabaseClient,
  contractId: string,
  slot: string,
  rejectionNote: string
): Promise<void> {
  const statusField = `appendix_${slot}_status`;
  const noteField = `appendix_${slot}_rejection_note`;

  const { error } = await supabase
    .from('contracts')
    .update({
      [statusField]: 'rejected',
      [noteField]: rejectionNote,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contractId);

  if (error) {
    throw new Error(`Failed to reject appendix: ${error.message}`);
  }

  // Log activity
  const { data: contract } = await supabase
    .from('contracts')
    .select('client_id, title')
    .eq('id', contractId)
    .single();

  if (contract) {
    const { error: activityError } = await supabase.from('activity_log').insert({
      client_id: contract.client_id,
      action: 'appendix_rejected',
      description: `Appendix ${slot} rejected for contract ${contract.title}: ${rejectionNote}`,
      created_at: new Date().toISOString(),
    });

    if (activityError) {
      console.error('Failed to log activity:', activityError.message);
    }
  }
}

export async function getFileUrl(
  supabase: SupabaseClient,
  storageKey: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('contract-files')
    .createSignedUrl(storageKey, 3600); // 1 hour expiry

  if (error) {
    throw new Error(`Failed to get file URL: ${error.message}`);
  }

  return data.signedUrl;
}
