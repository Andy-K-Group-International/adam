import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProposalTemplate } from '@/lib/supabase/types';

export async function listTemplates(
  supabase: SupabaseClient,
  options: { activeOnly?: boolean } = {}
): Promise<ProposalTemplate[]> {
  let query = supabase
    .from('proposal_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list proposal templates: ${error.message}`);
  }

  return data;
}

export async function getTemplateById(
  supabase: SupabaseClient,
  id: string
): Promise<ProposalTemplate> {
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to get proposal template: ${error.message}`);
  }

  return data;
}

export async function createTemplate(
  supabase: SupabaseClient,
  data: Omit<ProposalTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<ProposalTemplate> {
  const { data: template, error } = await supabase
    .from('proposal_templates')
    .insert({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create proposal template: ${error.message}`);
  }

  return template;
}

export async function updateTemplate(
  supabase: SupabaseClient,
  id: string,
  data: Partial<ProposalTemplate>
): Promise<ProposalTemplate> {
  const { data: template, error } = await supabase
    .from('proposal_templates')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update proposal template: ${error.message}`);
  }

  return template;
}
