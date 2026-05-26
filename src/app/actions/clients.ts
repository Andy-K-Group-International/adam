"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getContactForRouting } from "@/lib/supabase/queries/contacts";
import type { StrategyType, ActivationChecklistItem } from "@/lib/supabase/types";
import { sendClientActivationEmail } from "@/app/actions/email";

// ── Archive ───────────────────────────────────────────────────────────────────

export async function archiveClientAction(clientId: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("clients")
      .update({ archived: true, archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", clientId);
    if (error) return { error: error.message };
    await supabase.from("activity_log").insert({
      client_id: clientId,
      type: "client_stage_changed",
      metadata: { action: "archived" },
      created_at: new Date().toISOString(),
    });
    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

export async function unarchiveClientAction(clientId: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("clients")
      .update({ archived: false, archived_at: null, updated_at: new Date().toISOString() })
      .eq("id", clientId);
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

// ── Reactivation ──────────────────────────────────────────────────────────────

export async function reactivateClientAction(
  clientId: string,
  newServiceType: StrategyType,
  notes: string
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("company_name, contact_name, contact_email")
      .eq("id", clientId)
      .single();
    if (clientErr || !client) return { error: "Client not found" };

    await supabase
      .from("clients")
      .update({
        stage: "proposal",
        strategy_type: newServiceType,
        notes: notes.trim() || null,
        archived: false,
        archived_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId)
      .throwOnError();

    await supabase.from("activity_log").insert({
      client_id: clientId,
      type: "client_stage_changed",
      metadata: { action: "reactivated", service_type: newServiceType, notes },
      created_at: new Date().toISOString(),
    });

    const contact = await getContactForRouting(supabase, clientId, "general");
    const recipientEmail = contact?.email ?? client.contact_email;
    const recipientName = contact?.name ?? client.contact_name;

    await resendEmail({
      to: recipientEmail,
      subject: `We'd love to continue working with ${client.company_name}`,
      text: `Hi ${recipientName},\n\nWe have prepared a new proposal for ${client.company_name}.\n\nLog in: https://adam.andykgroup.com/dashboard\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
      html: buildReactivationHtml(recipientName, client.company_name),
    });

    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

// ── Client Report: Send ───────────────────────────────────────────────────────

export async function sendClientReportAction(reportId: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: report, error: reportErr } = await supabase
      .from("client_reports")
      .select("*, clients(company_name, contact_name, contact_email)")
      .eq("id", reportId)
      .single();
    if (reportErr || !report) return { error: "Report not found" };

    const clientRow = report.clients as { company_name: string; contact_name: string; contact_email: string };
    const contact = await getContactForRouting(supabase, report.client_id, "general");
    const recipientEmail = contact?.email ?? clientRow.contact_email;
    const recipientName = contact?.name ?? clientRow.contact_name;

    await supabase
      .from("client_reports")
      .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", reportId)
      .throwOnError();

    const periodLabel = report.period === "monthly" ? "Monthly" : "Quarterly";
    await resendEmail({
      to: recipientEmail,
      subject: `Your ${periodLabel} Report: ${report.title}`,
      text: `Hi ${recipientName},\n\nYour ${periodLabel.toLowerCase()} report "${report.title}" is ready.\n\nView it: https://adam.andykgroup.com/dashboard/reports\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
      html: buildReportEmailHtml(recipientName, clientRow.company_name, report.title, periodLabel),
    });

    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

// ── Activation ────────────────────────────────────────────────────────────────

export async function activateClientAction(
  clientId: string,
  approvedByUserId: string,
  checklistState: ActivationChecklistItem[]
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("company_name, contact_name, contact_email")
      .eq("id", clientId)
      .single();
    if (clientErr || !client) return { error: "Client not found" };

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("clients")
      .update({
        stage: "active",
        activated_at: now,
        activation_approved_by: approvedByUserId,
        activation_checklist: checklistState,
        updated_at: now,
      })
      .eq("id", clientId);
    if (error) return { error: error.message };

    await supabase.from("activity_log").insert({
      client_id: clientId,
      type: "client_stage_changed",
      metadata: { action: "activated", approved_by: approvedByUserId },
      created_at: now,
    });

    const contact = await getContactForRouting(supabase, clientId, "general");
    const recipientEmail = contact?.email ?? client.contact_email;
    const recipientName = contact?.name ?? client.contact_name;

    await sendClientActivationEmail({
      clientEmail: recipientEmail,
      clientName: recipientName,
      companyName: client.company_name,
    }).catch(() => {});

    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

// ── Market Analysis: Save ─────────────────────────────────────────────────────

export async function saveMarketAnalysisAction(
  clientId: string,
  analysis: {
    market_overview: string;
    icp_definition: string;
    market_opportunities: string;
    risks_challenges: string;
    competitors: { name: string; strengths: string; weaknesses: string; market_share: string }[];
  }
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("clients")
      .update({ market_analysis: analysis, updated_at: new Date().toISOString() })
      .eq("id", clientId);
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

// ── Internal email transport ──────────────────────────────────────────────────

async function resendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Andy'K Group International LTD <info@andykgroup.com>",
      to: [to],
      subject,
      text,
      ...(html ? { html } : {}),
    }),
  });
}

const LOGO = `<svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#01011b" stroke-width="4" fill="none"/><polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#c9707d" stroke-width="3" fill="none"/><text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#01011b">A</text></svg>`;

function wrap(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#faf6f3;font-family:'Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f3;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:#faf6f3;padding:20px 40px;border-radius:12px 12px 0 0;border:1px solid #ede8e2;border-bottom:none;"><table cellpadding="0" cellspacing="0"><tr><td width="36" style="vertical-align:middle;">${LOGO}</td><td style="padding-left:10px;vertical-align:middle;"><span style="font-family:Georgia,serif;color:#01011b;font-size:15px;font-weight:700;">A.D.A.M.</span></td></tr></table></td></tr><tr><td style="background:#fff;padding:40px;border-left:1px solid #ede8e2;border-right:1px solid #ede8e2;">${body}</td></tr><tr><td style="background:#faf6f3;padding:14px 32px;border-radius:0 0 12px 12px;border:1px solid #ede8e2;border-top:none;text-align:center;"><p style="font-family:'Courier New',monospace;font-size:10px;color:#8b93a8;margin:0;">Andy&#8217;K Group International LTD &middot; 86-90 Paul Street, London EC2A 4NE</p></td></tr></table></td></tr></table></body></html>`;
}

function buildReactivationHtml(name: string, company: string) {
  return wrap(`<h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;">We&#8217;d love to continue working together</h1><p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p><p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">We&#8217;ve prepared a new proposal for ${company} and would love to continue building on our work together. Log in to your portal to review it.</p><a href="https://adam.andykgroup.com/dashboard" style="display:inline-block;background:#c9707d;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:32px;">View Portal &#8594;</a><p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>`);
}

function buildReportEmailHtml(name: string, company: string, title: string, period: string) {
  return wrap(`<h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;">Your ${period} Report is Ready</h1><p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p><p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Your ${period.toLowerCase()} report for ${company} has been published.</p><div style="background:#faf6f3;border-left:2px solid #c9707d;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;"><p style="color:#8b93a8;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Report</p><p style="color:#01011b;font-size:15px;font-weight:600;margin:0;">${title}</p></div><a href="https://adam.andykgroup.com/dashboard/reports" style="display:inline-block;background:#c9707d;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:32px;">Read Report &#8594;</a><p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>`);
}
