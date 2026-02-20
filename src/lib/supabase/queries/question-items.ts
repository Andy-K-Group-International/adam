import type { SupabaseClient } from '@supabase/supabase-js';
import type { QuestionItem, QuestionSection } from '@/lib/supabase/types';

export async function listActive(
  supabase: SupabaseClient
): Promise<QuestionItem[]> {
  const { data, error } = await supabase
    .from('question_items')
    .select('*')
    .eq('is_active', true)
    .order('number', { ascending: true });

  if (error) {
    throw new Error(`Failed to list active question items: ${error.message}`);
  }

  return data;
}

export async function listActiveSections(
  supabase: SupabaseClient
): Promise<QuestionSection[]> {
  const { data, error } = await supabase
    .from('question_sections')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });

  if (error) {
    throw new Error(`Failed to list active sections: ${error.message}`);
  }

  return data;
}

export async function listAll(
  supabase: SupabaseClient
): Promise<QuestionItem[]> {
  const { data, error } = await supabase
    .from('question_items')
    .select('*')
    .order('number', { ascending: true });

  if (error) {
    throw new Error(`Failed to list all question items: ${error.message}`);
  }

  return data;
}

export async function listAllSections(
  supabase: SupabaseClient
): Promise<QuestionSection[]> {
  const { data, error } = await supabase
    .from('question_sections')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    throw new Error(`Failed to list all sections: ${error.message}`);
  }

  return data;
}

export async function updateQuestion(
  supabase: SupabaseClient,
  questionId: string,
  data: Partial<QuestionItem>
): Promise<QuestionItem> {
  const { data: question, error } = await supabase
    .from('question_items')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('question_id', questionId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update question: ${error.message}`);
  }

  return question;
}

export async function toggleActive(
  supabase: SupabaseClient,
  questionId: string,
  isActive: boolean
): Promise<QuestionItem> {
  const { data: question, error } = await supabase
    .from('question_items')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('question_id', questionId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to toggle question active state: ${error.message}`);
  }

  return question;
}

export async function updateSection(
  supabase: SupabaseClient,
  sectionId: string,
  data: Partial<QuestionSection>
): Promise<QuestionSection> {
  const { data: section, error } = await supabase
    .from('question_sections')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('section_id', sectionId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update section: ${error.message}`);
  }

  return section;
}
