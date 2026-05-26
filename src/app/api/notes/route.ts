import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listNotes, createNote } from "@/lib/supabase/queries/document-notes";
import { getCurrentUser } from "@/lib/supabase/queries/users";
import type { NoteDocumentType, NoteVisibility } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const documentType = searchParams.get("documentType") as NoteDocumentType | null;
  const documentId = searchParams.get("documentId");

  if (!documentType || !documentId) {
    return NextResponse.json({ error: "Missing documentType or documentId" }, { status: 400 });
  }

  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  if (!user || !["admin", "staff"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const notes = await listNotes(supabase, documentType, documentId);
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  if (!user || !["admin", "staff"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { document_type, document_id, section_id, content, parent_id, visibility } = body as {
    document_type: NoteDocumentType;
    document_id: string;
    section_id?: string;
    content: string;
    parent_id?: string;
    visibility?: NoteVisibility;
  };

  if (!document_type || !document_id || !content?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const note = await createNote(admin, {
    document_type,
    document_id,
    section_id,
    content: content.trim(),
    author_id: user.id,
    parent_id,
    visibility: visibility ?? "operational",
  });

  return NextResponse.json(note, { status: 201 });
}
