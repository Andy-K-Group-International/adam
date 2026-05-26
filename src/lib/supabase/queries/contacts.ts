import type { SupabaseClient } from "@supabase/supabase-js";
import type { Contact, ContactRole } from "@/lib/supabase/types";

export async function listContacts(
  supabase: SupabaseClient,
  clientId: string
): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("client_id", clientId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to list contacts: ${error.message}`);
  return data;
}

export async function createContact(
  supabase: SupabaseClient,
  data: {
    client_id: string;
    name: string;
    email: string;
    phone?: string | null;
    job_title?: string | null;
    role: ContactRole;
    is_primary?: boolean;
    notes?: string | null;
  }
): Promise<Contact> {
  // If setting as primary, clear existing primary first
  if (data.is_primary) {
    await supabase
      .from("contacts")
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq("client_id", data.client_id)
      .eq("is_primary", true);
  }

  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      ...data,
      is_primary: data.is_primary ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create contact: ${error.message}`);
  return contact;
}

export async function updateContact(
  supabase: SupabaseClient,
  id: string,
  clientId: string,
  data: Partial<Omit<Contact, "id" | "client_id" | "created_at" | "updated_at">>
): Promise<Contact> {
  // If setting as primary, clear existing primary first (excluding this contact)
  if (data.is_primary) {
    await supabase
      .from("contacts")
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq("client_id", clientId)
      .eq("is_primary", true)
      .neq("id", id);
  }

  const { data: contact, error } = await supabase
    .from("contacts")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("client_id", clientId)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update contact: ${error.message}`);
  return contact;
}

export async function deleteContact(
  supabase: SupabaseClient,
  id: string,
  clientId: string
): Promise<void> {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("client_id", clientId);

  if (error) throw new Error(`Failed to delete contact: ${error.message}`);
}

// Returns { name, email } for the correct contact given a routing purpose.
// Falls back to primary contact, then to the client row itself.
export async function getContactForRouting(
  supabase: SupabaseClient,
  clientId: string,
  purpose: "contract" | "invoice" | "general"
): Promise<{ name: string; email: string } | null> {
  const preferredRole: ContactRole =
    purpose === "invoice" ? "billing"
    : purpose === "contract" ? "signatory"
    : "primary";

  const { data: contacts } = await supabase
    .from("contacts")
    .select("name, email, role, is_primary")
    .eq("client_id", clientId)
    .order("is_primary", { ascending: false });

  if (!contacts || contacts.length === 0) return null;

  // Try preferred role first
  const preferred = contacts.find((c) => c.role === preferredRole);
  if (preferred) return { name: preferred.name, email: preferred.email };

  // Fall back to primary contact
  const primary = contacts.find((c) => c.is_primary);
  if (primary) return { name: primary.name, email: primary.email };

  // Fall back to first contact
  return { name: contacts[0].name, email: contacts[0].email };
}

export async function getPrimaryContact(
  supabase: SupabaseClient,
  clientId: string
): Promise<Contact | null> {
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_primary", true)
    .maybeSingle();

  return data ?? null;
}
