import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendInvoiceOverdue,
  sendContractSignatureReminder,
  sendProposalResponseReminder,
  sendTokenReminder,
} from "@/app/actions/email";

function cronAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token === process.env.CRON_SECRET;
}

export async function GET(req: NextRequest) {
  if (!cronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const results: Record<string, number> = {
    overdue_invoices: 0,
    contract_reminders: 0,
    proposal_reminders: 0,
    token_reminders: 0,
  };

  // ── a) Overdue invoices ────────────────────────────────────────────────────
  const { data: overdueInvoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, total_amount, currency, due_date, client_id")
    .lt("due_date", now.toISOString())
    .in("status", ["sent"]);

  for (const inv of overdueInvoices ?? []) {
    // Fetch primary contact email
    const { data: contact } = await supabase
      .from("contacts")
      .select("name, email")
      .eq("client_id", inv.client_id)
      .eq("is_primary", true)
      .maybeSingle();

    const { data: client } = await supabase
      .from("clients")
      .select("company_name, contact_email, contact_name")
      .eq("id", inv.client_id)
      .single();

    if (!client) continue;

    const email = contact?.email ?? client.contact_email;
    const name  = contact?.name  ?? client.contact_name;

    await Promise.allSettled([
      sendInvoiceOverdue({
        clientEmail:   email,
        clientName:    name,
        invoiceNumber: inv.invoice_number,
        invoiceId:     inv.id,
        totalAmount:   inv.total_amount,
        currency:      inv.currency,
        dueDate:       inv.due_date,
      }),
      // Mark as overdue in DB
      supabase
        .from("invoices")
        .update({ status: "overdue", updated_at: now.toISOString() })
        .eq("id", inv.id),
    ]);

    results.overdue_invoices++;
  }

  // ── b) Contracts awaiting signature > 7 days ───────────────────────────────
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: pendingContracts } = await supabase
    .from("contracts")
    .select("id, title, client_id, published_at")
    .eq("status", "published")
    .lt("published_at", sevenDaysAgo);

  for (const contract of pendingContracts ?? []) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("name, email")
      .eq("client_id", contract.client_id)
      .eq("is_primary", true)
      .maybeSingle();

    const { data: client } = await supabase
      .from("clients")
      .select("contact_email, contact_name")
      .eq("id", contract.client_id)
      .single();

    if (!client) continue;

    await sendContractSignatureReminder({
      clientEmail:  contact?.email ?? client.contact_email,
      clientName:   contact?.name  ?? client.contact_name,
      contractTitle: contract.title,
      contractId:    contract.id,
    });

    results.contract_reminders++;
  }

  // ── c) Proposals awaiting response > 5 days ────────────────────────────────
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const { data: pendingProposals } = await supabase
    .from("proposals")
    .select("id, title, client_id, published_at")
    .eq("status", "published")
    .lt("published_at", fiveDaysAgo);

  for (const proposal of pendingProposals ?? []) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("name, email")
      .eq("client_id", proposal.client_id)
      .eq("is_primary", true)
      .maybeSingle();

    const { data: client } = await supabase
      .from("clients")
      .select("contact_email, contact_name")
      .eq("id", proposal.client_id)
      .single();

    if (!client) continue;

    await sendProposalResponseReminder({
      clientEmail:   contact?.email ?? client.contact_email,
      clientName:    contact?.name  ?? client.contact_name,
      proposalTitle: proposal.title,
      proposalId:    proposal.id,
    });

    results.proposal_reminders++;
  }

  // ── d) Questionnaire tokens expiring in 48 hours ───────────────────────────
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
  const { data: expiringLeads } = await supabase
    .from("leads")
    .select("id, name, email, questionnaire_token, token_expires_at")
    .eq("status", "qualified")
    .not("questionnaire_token", "is", null)
    .gt("token_expires_at", now.toISOString())
    .lt("token_expires_at", in48h);

  for (const lead of expiringLeads ?? []) {
    await sendTokenReminder({
      name:           lead.name,
      email:          lead.email,
      token:          lead.questionnaire_token as string,
      tokenExpiresAt: lead.token_expires_at as string,
    });

    results.token_reminders++;
  }

  return NextResponse.json({ status: "ok", timestamp: now.toISOString(), results });
}
