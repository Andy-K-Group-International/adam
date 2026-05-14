import type { SupabaseClient } from "@supabase/supabase-js";
import type { Invoice } from "@/lib/supabase/types";

export async function listAllInvoices(
  supabase: SupabaseClient,
  options: { status?: string; clientId?: string } = {}
): Promise<Invoice[]> {
  let query = supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (options.status) query = query.eq("status", options.status);
  if (options.clientId) query = query.eq("client_id", options.clientId);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list invoices: ${error.message}`);
  return data;
}

export async function listInvoicesForClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", clientId)
    .in("status", ["sent", "paid", "overdue"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list invoices for client: ${error.message}`);
  return data;
}

export async function getInvoiceById(
  supabase: SupabaseClient,
  id: string
): Promise<Invoice> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Failed to get invoice: ${error.message}`);
  return data;
}

export async function createInvoice(
  supabase: SupabaseClient,
  data: Omit<Invoice, "id" | "created_at" | "updated_at">
): Promise<Invoice> {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({ ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create invoice: ${error.message}`);
  return invoice;
}

export async function updateInvoice(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Invoice>
): Promise<Invoice> {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update invoice: ${error.message}`);
  return invoice;
}

export async function generateInvoiceNumber(
  supabase: SupabaseClient,
  clientId?: string
): Promise<string> {
  if (clientId) {
    const { data: clientRow } = await supabase
      .from("clients")
      .select("client_ref")
      .eq("id", clientId)
      .single();

    const ref = clientRow?.client_ref;
    if (ref) {
      const { count } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientId);
      const seq = String((count ?? 0) + 1).padStart(3, "0");
      return `${ref}-INV-${seq}`;
    }
  }

  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01T00:00:00Z`);
  const seq = String((count ?? 0) + 1).padStart(4, "0");
  return `INV-${year}-${seq}`;
}
