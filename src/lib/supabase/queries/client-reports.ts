import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClientReport, ReportPeriod } from '@/lib/supabase/types';

export async function listClientReports(supabase: SupabaseClient, clientId: string): Promise<ClientReport[]> {
  const { data, error } = await supabase
    .from('client_reports')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to list reports: ${error.message}`);
  return data ?? [];
}

export async function getClientReport(supabase: SupabaseClient, id: string): Promise<ClientReport> {
  const { data, error } = await supabase
    .from('client_reports')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Failed to get report: ${error.message}`);
  return data;
}

export async function createClientReport(
  supabase: SupabaseClient,
  data: {
    client_id: string;
    title: string;
    period: ReportPeriod;
    content: Record<string, string>;
    created_by?: string | null;
  }
): Promise<ClientReport> {
  const { data: row, error } = await supabase
    .from('client_reports')
    .insert({
      ...data,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create report: ${error.message}`);
  return row;
}

export async function updateClientReport(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Pick<ClientReport, 'title' | 'period' | 'content' | 'status' | 'sent_at'>>
): Promise<ClientReport> {
  const { data: row, error } = await supabase
    .from('client_reports')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to update report: ${error.message}`);
  return row;
}

export async function listSentReportsForClient(supabase: SupabaseClient, clientId: string): Promise<ClientReport[]> {
  const { data, error } = await supabase
    .from('client_reports')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'sent')
    .order('sent_at', { ascending: false });
  if (error) throw new Error(`Failed to list sent reports: ${error.message}`);
  return data ?? [];
}
