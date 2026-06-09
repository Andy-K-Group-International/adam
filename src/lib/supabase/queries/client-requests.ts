import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClientRequest, NoteDocumentType, ClientRequestStatus, ClientRequestPriority } from "../types";

export async function listClientRequests(
  supabase: SupabaseClient,
  documentType: NoteDocumentType,
  documentId: string,
): Promise<ClientRequest[]> {
  const { data, error } = await supabase
    .from("client_requests")
    .select(`
      *,
      client:client_id ( id, company_name, contact_name, contact_email )
    `)
    .eq("document_type", documentType)
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ClientRequest[];
}

export async function listPendingClientRequests(
  supabase: SupabaseClient,
  clientIds?: string[]
): Promise<ClientRequest[]> {
  if (clientIds && clientIds.length === 0) return [];

  let query = supabase
    .from("client_requests")
    .select(`
      *,
      client:client_id ( id, company_name, contact_name, contact_email )
    `)
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (clientIds && clientIds.length > 0) {
    query = query.in("client_id", clientIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ClientRequest[];
}

export async function createClientRequest(
  supabase: SupabaseClient,
  payload: {
    document_type: NoteDocumentType;
    document_id: string;
    section_id?: string;
    content: string;
    client_id: string;
  },
): Promise<ClientRequest> {
  const { data, error } = await supabase
    .from("client_requests")
    .insert(payload)
    .select(`*, client:client_id ( id, company_name, contact_name, contact_email )`)
    .single();

  if (error) throw error;
  return data as ClientRequest;
}

export async function updateClientRequest(
  supabase: SupabaseClient,
  id: string,
  patch: {
    status?: ClientRequestStatus;
    priority?: ClientRequestPriority;
    admin_response?: string;
    admin_responded_by?: string;
    admin_responded_at?: string;
  },
): Promise<ClientRequest> {
  const { data, error } = await supabase
    .from("client_requests")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(`*, client:client_id ( id, company_name, contact_name, contact_email )`)
    .single();

  if (error) throw error;
  return data as ClientRequest;
}
