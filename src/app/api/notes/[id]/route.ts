import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateNote } from "@/lib/supabase/queries/document-notes";
import { getCurrentUser } from "@/lib/supabase/queries/users";
import type { NoteVisibility } from "@/lib/supabase/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  if (!user || !["admin", "staff"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { content, is_resolved, is_pinned, visibility } = body as {
    content?: string;
    is_resolved?: boolean;
    is_pinned?: boolean;
    visibility?: NoteVisibility;
  };

  const patch: Parameters<typeof updateNote>[2] = {};
  if (content !== undefined) patch.content = content.trim();
  if (is_resolved !== undefined) patch.is_resolved = is_resolved;
  if (is_pinned !== undefined) patch.is_pinned = is_pinned;
  if (visibility !== undefined) patch.visibility = visibility;

  const admin = createAdminClient();
  const note = await updateNote(admin, id, patch);
  return NextResponse.json(note);
}
