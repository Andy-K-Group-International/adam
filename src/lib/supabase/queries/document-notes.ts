import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentNote, NoteDocumentType, NoteVisibility } from "../types";

export async function listNotes(
  supabase: SupabaseClient,
  documentType: NoteDocumentType,
  documentId: string,
): Promise<DocumentNote[]> {
  const { data, error } = await supabase
    .from("document_notes")
    .select(`
      *,
      author:author_id ( id, first_name, last_name, email )
    `)
    .eq("document_type", documentType)
    .eq("document_id", documentId)
    .is("parent_id", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const roots = (data ?? []) as DocumentNote[];

  const { data: replyData, error: replyError } = await supabase
    .from("document_notes")
    .select(`
      *,
      author:author_id ( id, first_name, last_name, email )
    `)
    .eq("document_type", documentType)
    .eq("document_id", documentId)
    .not("parent_id", "is", null)
    .order("created_at", { ascending: true });

  if (replyError) throw replyError;

  const replies = (replyData ?? []) as DocumentNote[];
  const replyMap: Record<string, DocumentNote[]> = {};
  for (const r of replies) {
    if (!r.parent_id) continue;
    (replyMap[r.parent_id] ??= []).push(r);
  }

  return roots.map((n) => ({ ...n, replies: replyMap[n.id] ?? [] }));
}

export async function createNote(
  supabase: SupabaseClient,
  payload: {
    document_type: NoteDocumentType;
    document_id: string;
    section_id?: string;
    content: string;
    author_id: string;
    parent_id?: string;
    visibility?: NoteVisibility;
  },
): Promise<DocumentNote> {
  const { data, error } = await supabase
    .from("document_notes")
    .insert(payload)
    .select(`*, author:author_id ( id, first_name, last_name, email )`)
    .single();

  if (error) throw error;
  return data as DocumentNote;
}

export async function updateNote(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Pick<DocumentNote, "content" | "is_resolved" | "is_pinned" | "visibility">>,
): Promise<DocumentNote> {
  const updates: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
  if (patch.content !== undefined) updates.edited = true;

  const { data, error } = await supabase
    .from("document_notes")
    .update(updates)
    .eq("id", id)
    .select(`*, author:author_id ( id, first_name, last_name, email )`)
    .single();

  if (error) throw error;
  return data as DocumentNote;
}
