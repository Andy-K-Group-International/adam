"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleQuestionActive(questionId: string, isActive: boolean) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_items")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("question_id", questionId)
    .select("*")
    .single();

  if (error) {
    return { error: error.message };
  }
  return { data };
}

export async function refreshQuestions() {
  const supabase = await createClient();
  const { data: questions, error: qErr } = await supabase
    .from("question_items")
    .select("*")
    .order("number", { ascending: true });

  const { data: sections, error: sErr } = await supabase
    .from("question_sections")
    .select("*")
    .order("order", { ascending: true });

  if (qErr || sErr) {
    return { error: qErr?.message || sErr?.message };
  }
  return { questions, sections };
}
