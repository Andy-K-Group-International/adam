import type { SupabaseClient } from '@supabase/supabase-js';
import type { Meeting, MeetingType, MeetingActionItem } from '@/lib/supabase/types';

export async function listMeetings(supabase: SupabaseClient, clientId: string): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false });
  if (error) throw new Error(`Failed to list meetings: ${error.message}`);
  return data ?? [];
}

export async function createMeeting(
  supabase: SupabaseClient,
  data: {
    client_id: string;
    date: string;
    type: MeetingType;
    attendees: string[];
    notes?: string;
    action_items?: MeetingActionItem[];
  }
): Promise<Meeting> {
  const { data: row, error } = await supabase
    .from('meetings')
    .insert({
      ...data,
      action_items: data.action_items ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create meeting: ${error.message}`);
  return row;
}

export async function updateMeeting(
  supabase: SupabaseClient,
  id: string,
  clientId: string,
  data: Partial<Pick<Meeting, 'date' | 'type' | 'attendees' | 'notes' | 'action_items'>>
): Promise<Meeting> {
  const { data: row, error } = await supabase
    .from('meetings')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('client_id', clientId)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to update meeting: ${error.message}`);
  return row;
}

export async function deleteMeeting(supabase: SupabaseClient, id: string, clientId: string): Promise<void> {
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
    .eq('client_id', clientId);
  if (error) throw new Error(`Failed to delete meeting: ${error.message}`);
}
