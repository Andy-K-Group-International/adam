"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendInvoiceSent, sendKickoffConfirmed } from "@/app/actions/email";

export async function sendInvoiceAction(invoiceId: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();
    if (invErr || !invoice) return { error: "Invoice not found" };

    const { data: client } = await supabase
      .from("clients")
      .select("company_name, contact_name, contact_email")
      .eq("id", invoice.client_id)
      .single();
    if (!client) return { error: "Client not found" };

    await supabase
      .from("invoices")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", invoiceId);

    await sendInvoiceSent({
      clientEmail: client.contact_email,
      clientName: client.contact_name,
      companyName: client.company_name,
      invoiceNumber: invoice.invoice_number,
      invoiceId,
      totalAmount: invoice.total_amount,
      currency: invoice.currency,
      dueDate: invoice.due_date,
    });

    return {};
  } catch (err) {
    console.error("sendInvoiceAction error:", err);
    return { error: "Failed to send invoice" };
  }
}

export async function markInvoicePaidAction(invoiceId: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", invoiceId);
    return {};
  } catch (err) {
    console.error("markInvoicePaidAction error:", err);
    return { error: "Failed to mark invoice as paid" };
  }
}

export async function confirmKickoffAction(
  clientId: string,
  kickoffDate: string | null,
  kickoffNotes: string,
  checklist: { id: string; label: string; checked: boolean }[]
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: client } = await supabase
      .from("clients")
      .select("company_name, contact_name, contact_email")
      .eq("id", clientId)
      .single();
    if (!client) return { error: "Client not found" };

    await supabase
      .from("clients")
      .update({
        kickoff_date: kickoffDate,
        kickoff_notes: kickoffNotes || null,
        kickoff_checklist: checklist,
        kickoff_confirmed_at: new Date().toISOString(),
        stage: "kickoff",
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    await sendKickoffConfirmed({
      clientEmail: client.contact_email,
      clientName: client.contact_name,
      companyName: client.company_name,
      kickoffDate,
      checklist: checklist.map((item) => item.label),
      kickoffNotes,
    });

    return {};
  } catch (err) {
    console.error("confirmKickoffAction error:", err);
    return { error: "Failed to confirm kickoff" };
  }
}
