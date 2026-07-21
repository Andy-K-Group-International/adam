import type { SupabaseClient } from '@supabase/supabase-js';
import type { Questionnaire } from '@/lib/supabase/types';

export async function listQuestionnaires(
  supabase: SupabaseClient,
  options: { status?: string; questionnaireIds?: string[] } = {}
): Promise<Questionnaire[]> {
  if (options.questionnaireIds && options.questionnaireIds.length === 0) return [];

  let query = supabase
    .from('questionnaires')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.questionnaireIds && options.questionnaireIds.length > 0) {
    query = query.in('id', options.questionnaireIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list questionnaires: ${error.message}`);
  }

  return data;
}

export async function getQuestionnaireById(
  supabase: SupabaseClient,
  id: string
): Promise<Questionnaire> {
  const { data, error } = await supabase
    .from('questionnaires')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to get questionnaire: ${error.message}`);
  }

  return data;
}

export async function submitQuestionnaire(
  supabase: SupabaseClient,
  data: Omit<Questionnaire, 'id' | 'status' | 'created_at' | 'updated_at'>
): Promise<Questionnaire> {
  const { data: questionnaire, error } = await supabase
    .from('questionnaires')
    .insert({
      ...data,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to submit questionnaire: ${error.message}`);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    action: 'questionnaire_submitted',
    description: `Questionnaire submitted by ${questionnaire.contact_email}`,
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return questionnaire;
}

// Anonymous draft save/resume/submit now lives entirely server-side —
// see src/app/api/questionnaire/draft/route.ts and .../submit/route.ts —
// using an admin-client + session-token model instead of the browser
// client + anon RLS policy this file used to expose. Those RLS policies
// were removed in the same migration that added this comment.

export async function updateQuestionnaire(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Questionnaire>
): Promise<Questionnaire> {
  const { data: questionnaire, error } = await supabase
    .from('questionnaires')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update questionnaire: ${error.message}`);
  }

  return questionnaire;
}

export async function linkToUser(
  supabase: SupabaseClient,
  email: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('questionnaires')
    .update({
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('contact_email', email);

  if (error) {
    throw new Error(`Failed to link questionnaires to user: ${error.message}`);
  }
}
