import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lead, Client } from '@/lib/supabase/types';

export async function listLeads(
  supabase: SupabaseClient,
  options: { status?: string } = {}
): Promise<Lead[]> {
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list leads: ${error.message}`);
  }

  return data;
}

export async function getLeadById(
  supabase: SupabaseClient,
  id: string
): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to get lead: ${error.message}`);
  }

  return data;
}

export async function createLead(
  supabase: SupabaseClient,
  data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>
): Promise<Lead> {
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  return lead;
}

export async function updateLead(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Lead>
): Promise<Lead> {
  const { data: lead, error } = await supabase
    .from('leads')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update lead: ${error.message}`);
  }

  return lead;
}

export async function convertLeadToClient(
  supabase: SupabaseClient,
  leadId: string
): Promise<Client> {
  const lead = await getLeadById(supabase, leadId);

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      company_name: lead.company || lead.name,
      contact_name: lead.name,
      contact_email: lead.email,
      contact_phone: lead.phone,
      stage: 'questionnaire',
      notes: lead.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (clientError) {
    throw new Error(`Failed to create client from lead: ${clientError.message}`);
  }

  const { error: updateError } = await supabase
    .from('leads')
    .update({
      status: 'converted',
      converted_to_client_id: client.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (updateError) {
    console.error('Failed to update lead status:', updateError.message);
  }

  return client;
}
