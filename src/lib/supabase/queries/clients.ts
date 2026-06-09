import type { SupabaseClient } from '@supabase/supabase-js';
import type { Client } from '@/lib/supabase/types';

async function generateClientRef(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });
  const seq = String((count ?? 0) + 1).padStart(4, '0');
  return `AK-${year}-${seq}`;
}

export async function listClients(
  supabase: SupabaseClient,
  options: { stage?: string; search?: string; showArchived?: boolean; userId?: string } = {}
): Promise<(Client & { primary_contact: { name: string; email: string } | null })[]> {
  let query = supabase
    .from('clients')
    .select('*, contacts!left(name, email, is_primary)')
    .order('created_at', { ascending: false });

  if (!options.showArchived) {
    query = query.eq('archived', false);
  }

  if (options.stage) {
    query = query.eq('stage', options.stage);
  }

  if (options.search) {
    query = query.textSearch('company_name', options.search);
  }

  if (options.userId) {
    query = query.eq('assigned_to', options.userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list clients: ${error.message}`);
  }

  return (data ?? []).map((row: any) => {
    const contactsArr: { name: string; email: string; is_primary: boolean }[] =
      Array.isArray(row.contacts) ? row.contacts : [];
    const primary =
      contactsArr.find((c) => c.is_primary) ?? contactsArr[0] ?? null;
    const { contacts: _contacts, ...client } = row;
    return {
      ...client,
      primary_contact: primary ? { name: primary.name, email: primary.email } : null,
    };
  });
}

export async function getClientById(
  supabase: SupabaseClient,
  id: string
): Promise<Client & { contracts: any[] }> {
  const { data, error } = await supabase
    .from('clients')
    .select('*, contracts(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to get client: ${error.message}`);
  }

  return data;
}

export async function createClient(
  supabase: SupabaseClient,
  data: Omit<Client, 'id' | 'created_at' | 'updated_at'>
): Promise<Client> {
  const client_ref = data.client_ref ?? await generateClientRef(supabase);
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      ...data,
      client_ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create client: ${error.message}`);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    client_id: client.id,
    action: 'client_created',
    description: `Client ${client.company_name} was created`,
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return client;
}

export async function updateClient(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Client>
): Promise<Client> {
  const { data: client, error } = await supabase
    .from('clients')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update client: ${error.message}`);
  }

  return client;
}

export async function updateClientStage(
  supabase: SupabaseClient,
  id: string,
  stage: string
): Promise<Client> {
  const { data: client, error } = await supabase
    .from('clients')
    .update({
      stage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update client stage: ${error.message}`);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    client_id: client.id,
    action: 'stage_changed',
    description: `Client stage changed to ${stage}`,
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return client;
}

export async function convertFromQuestionnaire(
  supabase: SupabaseClient,
  questionnaireId: string
): Promise<Client> {
  // Get the questionnaire
  const { data: questionnaire, error: qError } = await supabase
    .from('questionnaires')
    .select('*')
    .eq('id', questionnaireId)
    .single();

  if (qError) {
    throw new Error(`Failed to get questionnaire: ${qError.message}`);
  }

  const client_ref = await generateClientRef(supabase);

  // Create client from questionnaire data
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      client_ref,
      company_name: questionnaire.company_name,
      contact_name: questionnaire.contact_name,
      contact_email: questionnaire.contact_email,
      contact_phone: questionnaire.contact_phone,
      stage: 'questionnaire',
      questionnaire_id: questionnaireId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (clientError) {
    throw new Error(`Failed to create client from questionnaire: ${clientError.message}`);
  }

  // Update questionnaire status
  const { error: updateError } = await supabase
    .from('questionnaires')
    .update({
      status: 'converted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', questionnaireId);

  if (updateError) {
    console.error('Failed to update questionnaire status:', updateError.message);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    client_id: client.id,
    action: 'converted_from_questionnaire',
    description: `Client created from questionnaire submission`,
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return client;
}
