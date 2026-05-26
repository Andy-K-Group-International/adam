import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listClientRequests, createClientRequest } from "@/lib/supabase/queries/client-requests";
import { getCurrentUser } from "@/lib/supabase/queries/users";
import { sendClientRequestNotification } from "@/app/actions/email";
import type { NoteDocumentType } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const documentType = searchParams.get("documentType") as NoteDocumentType | null;
  const documentId = searchParams.get("documentId");

  if (!documentType || !documentId) {
    return NextResponse.json({ error: "Missing documentType or documentId" }, { status: 400 });
  }

  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const requests = await listClientRequests(supabase, documentType, documentId);
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { document_type, document_id, section_id, content } = body as {
    document_type: NoteDocumentType;
    document_id: string;
    section_id?: string;
    content: string;
  };

  if (!document_type || !document_id || !content?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!user.client_id) {
    return NextResponse.json({ error: "No client associated with this account" }, { status: 400 });
  }

  const admin = createAdminClient();
  const request = await createClientRequest(admin, {
    document_type,
    document_id,
    section_id,
    content: content.trim(),
    client_id: user.client_id,
  });

  const clientData = request.client;
  if (clientData) {
    sendClientRequestNotification({
      companyName: clientData.company_name,
      contactName: clientData.contact_name,
      documentType: document_type,
      documentId: document_id,
      content: content.trim(),
      sectionId: section_id,
    }).catch(console.error);
  }

  return NextResponse.json(request, { status: 201 });
}
