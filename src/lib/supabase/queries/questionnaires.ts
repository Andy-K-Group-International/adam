import type { SupabaseClient } from '@supabase/supabase-js';
import type { Questionnaire } from '@/lib/supabase/types';

export async function listQuestionnaires(
  supabase: SupabaseClient,
  options: { status?: string } = {}
): Promise<Questionnaire[]> {
  let query = supabase
    .from('questionnaires')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
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

export async function saveDraft(
  supabase: SupabaseClient,
  data: {
    email: string;
    answers: Record<string, any>;
    selectedSegments: string[];
    currentPageIndex: number;
  }
): Promise<Questionnaire> {
  // Check for existing draft by email
  const { data: existing, error: findError } = await supabase
    .from('questionnaires')
    .select('*')
    .eq('contact_email', data.email)
    .eq('status', 'draft')
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to find existing draft: ${findError.message}`);
  }

  if (existing) {
    // Update existing draft
    const { data: updated, error } = await supabase
      .from('questionnaires')
      .update({
        answers: data.answers,
        selected_segments: data.selectedSegments,
        current_page_index: data.currentPageIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update draft: ${error.message}`);
    }

    return updated;
  }

  // Create new draft
  const { data: draft, error } = await supabase
    .from('questionnaires')
    .insert({
      contact_email: data.email,
      answers: data.answers,
      selected_segments: data.selectedSegments,
      current_page_index: data.currentPageIndex,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create draft: ${error.message}`);
  }

  return draft;
}

export async function getDraftByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<Questionnaire | null> {
  const { data, error } = await supabase
    .from('questionnaires')
    .select('*')
    .eq('contact_email', email)
    .eq('status', 'draft')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get draft: ${error.message}`);
  }

  return data;
}

export async function deleteDraft(
  supabase: SupabaseClient,
  email: string
): Promise<void> {
  const { error } = await supabase
    .from('questionnaires')
    .delete()
    .eq('contact_email', email)
    .eq('status', 'draft');

  if (error) {
    throw new Error(`Failed to delete draft: ${error.message}`);
  }
}

export async function submitDraft(
  supabase: SupabaseClient,
  data: {
    email: string;
    answers: Record<string, any>;
    selectedSegments: string[];
  }
): Promise<Questionnaire> {
  // Find the draft
  const { data: draft, error: findError } = await supabase
    .from('questionnaires')
    .select('*')
    .eq('contact_email', data.email)
    .eq('status', 'draft')
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to find draft: ${findError.message}`);
  }

  if (!draft) {
    throw new Error('No draft found for this email');
  }

  // Upgrade draft to submitted
  const { data: submitted, error } = await supabase
    .from('questionnaires')
    .update({
      answers: data.answers,
      selected_segments: data.selectedSegments,
      status: 'submitted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', draft.id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to submit draft: ${error.message}`);
  }

  // Log activity
  const { error: activityError } = await supabase.from('activity_log').insert({
    action: 'questionnaire_submitted',
    description: `Questionnaire submitted by ${data.email}`,
    created_at: new Date().toISOString(),
  });

  if (activityError) {
    console.error('Failed to log activity:', activityError.message);
  }

  return submitted;
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
