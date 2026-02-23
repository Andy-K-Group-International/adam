import type { SupabaseClient } from '@supabase/supabase-js';
import type { ActivityLog } from '@/lib/supabase/types';

export async function listForClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list activity log for client: ${error.message}`);
  }

  return data;
}

export async function listForCurrentClient(
  supabase: SupabaseClient,
  clientId: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list activity log for current client: ${error.message}`);
  }

  return data;
}

export async function listAll(
  supabase: SupabaseClient,
  limit: number = 100
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list all activity logs: ${error.message}`);
  }

  return data;
}

export async function createActivity(
  supabase: SupabaseClient,
  data: Omit<ActivityLog, 'id' | 'created_at'>
): Promise<ActivityLog> {
  const { data: activity, error } = await supabase
    .from('activity_log')
    .insert({
      ...data,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create activity log: ${error.message}`);
  }

  return activity;
}
