import type { SupabaseClient } from '@supabase/supabase-js';
import type { Milestone, MilestoneStatus } from '@/lib/supabase/types';

export async function listMilestones(supabase: SupabaseClient, clientId: string): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('client_id', clientId)
    .order('order', { ascending: true });
  if (error) throw new Error(`Failed to list milestones: ${error.message}`);
  return data ?? [];
}

export async function createMilestone(
  supabase: SupabaseClient,
  data: { client_id: string; title: string; description?: string; status?: MilestoneStatus; due_date?: string | null; order: number }
): Promise<Milestone> {
  const { data: row, error } = await supabase
    .from('milestones')
    .insert({
      ...data,
      status: data.status ?? 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create milestone: ${error.message}`);
  return row;
}

export async function updateMilestone(
  supabase: SupabaseClient,
  id: string,
  clientId: string,
  data: Partial<Pick<Milestone, 'title' | 'description' | 'status' | 'due_date' | 'order' | 'completed_at'>>
): Promise<Milestone> {
  const payload: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
  if (data.status === 'completed' && !data.completed_at) {
    payload.completed_at = new Date().toISOString();
  } else if (data.status && data.status !== 'completed') {
    payload.completed_at = null;
  }
  const { data: row, error } = await supabase
    .from('milestones')
    .update(payload)
    .eq('id', id)
    .eq('client_id', clientId)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to update milestone: ${error.message}`);
  return row;
}

export async function deleteMilestone(supabase: SupabaseClient, id: string, clientId: string): Promise<void> {
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id)
    .eq('client_id', clientId);
  if (error) throw new Error(`Failed to delete milestone: ${error.message}`);
}

export async function reorderMilestones(
  supabase: SupabaseClient,
  clientId: string,
  orderedIds: string[]
): Promise<void> {
  const updates = orderedIds.map((id, idx) =>
    supabase
      .from('milestones')
      .update({ order: idx, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('client_id', clientId)
  );
  await Promise.all(updates);
}
