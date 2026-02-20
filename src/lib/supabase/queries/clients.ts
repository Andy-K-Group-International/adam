import type { SupabaseClient } from '@supabase/supabase-js';
import type { Client } from '@/lib/supabase/types';

export async function listClients(
  supabase: SupabaseClient,
  options: { stage?: string; search?: string } = {}
): Promise<Client[]> {
  let query = supabase.from('clients').select('*').order('created_at', { ascending: false });

  if (options.stage) {
    query = query.eq('stage', options.stage);
  }

  if (options.search) {
    query = query.textSearch('company_name', options.search);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list clients: ${error.message}`);
  }

  return data;
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
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      ...data,
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

  // Create client from questionnaire data
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      company_name: questionnaire.company_name,
      contact_name: questionnaire.contact_name,
      contact_email: questionnaire.contact_email,
      contact_phone: questionnaire.contact_phone,
      stage: 'new',
      questionnaire_id: questionnaireId,
      answers: questionnaire.answers,
      selected_segments: questionnaire.selected_segments,
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
