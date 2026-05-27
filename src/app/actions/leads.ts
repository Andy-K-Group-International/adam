"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendLeadRejection, sendQuestionnaireInvite } from "./email";

// ─── Demo request: Approve for NDA ───────────────────────────────────────────

export async function approveDemoForNda(leadId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .update({
      status: "qualified",
      token_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select("name, email, company")
    .single();

  if (error) throw new Error(error.message);

  await sendNdaInviteEmail({
    name: lead.name,
    email: lead.email,
    company: lead.company ?? "",
  });
}

// ─── Demo request: Reject ────────────────────────────────────────────────────

export async function rejectDemoRequest(leadId: string, reason?: string): Promise<void> {
  const supabase = createAdminClient();

  const coolingUntil = new Date();
  coolingUntil.setMonth(coolingUntil.getMonth() + 6);

  const { data: lead, error } = await supabase
    .from("leads")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      cooling_period_until: coolingUntil.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select("name, email, company")
    .single();

  if (error) throw new Error(error.message);

  await sendDemoRejectionEmail({
    name: lead.name,
    email: lead.email,
    company: lead.company ?? "",
    reason,
  });
}

// ─── Emails ───────────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, text: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Andy'K Group International LTD <info@andykgroup.com>", to: [to], subject, text, html }),
  });
}

const LOGO = `<svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#01011b" stroke-width="4" fill="none"/><polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#c9707d" stroke-width="3" fill="none"/><text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#01011b">A</text></svg>`;

function wrap(body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#faf6f3;font-family:'Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f3;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:#faf6f3;padding:20px 40px;border-radius:12px 12px 0 0;border:1px solid #ede8e2;border-bottom:none;"><table cellpadding="0" cellspacing="0"><tr><td width="36">${LOGO}</td><td style="padding-left:10px;"><span style="font-family:Georgia,serif;color:#01011b;font-size:15px;font-weight:700;">A.D.A.M.</span></td></tr></table></td></tr><tr><td style="background:#fff;padding:40px;border-left:1px solid #ede8e2;border-right:1px solid #ede8e2;">${body}</td></tr><tr><td style="background:#faf6f3;padding:14px 32px;border-radius:0 0 12px 12px;border:1px solid #ede8e2;border-top:none;text-align:center;"><p style="font-family:'Courier New',monospace;font-size:10px;color:#8b93a8;margin:0;">Andy&#8217;K Group International LTD &middot; 86-90 Paul Street, London EC2A 4NE</p></td></tr></table></td></tr></table></body></html>`;
}

async function sendNdaInviteEmail({ name, email, company }: { name: string; email: string; company: string }) {
  const ndaUrl = "https://adam.andykgroup.com/nda-sign";
  const html = wrap(`
    <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;">Your A.D.A.M. demo application has been approved</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">We have reviewed your application from ${company} and we are pleased to confirm your access has been pre-approved. To proceed, please sign our Non-Disclosure Agreement — this takes less than two minutes.</p>
    <div style="background:#faf6f3;border-left:2px solid #c9707d;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;margin:0 0 6px;">Next step</p>
      <p style="color:#01011b;font-size:14px;font-weight:600;margin:0;">Sign the NDA to unlock your private demo</p>
    </div>
    <a href="${ndaUrl}" style="display:inline-block;background:#c9707d;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:32px;">Sign NDA &amp; Access Demo &#8594;</a>
    <p style="color:#8b93a8;font-size:12px;font-family:'Courier New',monospace;word-break:break-all;margin-bottom:24px;">${ndaUrl}</p>
    <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
  `);
  await sendEmail(
    email,
    "Your A.D.A.M. Demo Access Has Been Approved — Andy'K Group",
    `Hi ${name},\n\nYour demo application from ${company} has been approved.\n\nPlease sign the NDA to unlock your private access:\n${ndaUrl}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  );
}

async function sendDemoRejectionEmail({ name, email, company, reason }: { name: string; email: string; company: string; reason?: string }) {
  const html = wrap(`
    <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;">Thank you for your interest in A.D.A.M.</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Thank you for submitting your application from ${company}. After careful review, we are unable to proceed with a demo at this time.${reason ? ` ${reason}` : ""}</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 32px;">We appreciate your interest and wish you well with your operations. You are welcome to reapply in the future if your circumstances change.</p>
    <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
  `);
  await sendEmail(
    email,
    "A.D.A.M. Demo Application Update — Andy'K Group",
    `Hi ${name},\n\nThank you for your application from ${company}. After review, we are unable to proceed with a demo at this time.\n\nWe appreciate your interest.\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  );
}

export async function rejectLead(leadId: string, reason: string): Promise<void> {
  const supabase = createAdminClient();

  const coolingUntil = new Date();
  coolingUntil.setMonth(coolingUntil.getMonth() + 6);

  const { data: lead, error } = await supabase
    .from("leads")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      cooling_period_until: coolingUntil.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select("name, email")
    .single();

  if (error) throw new Error(error.message);

  await sendLeadRejection({
    name: lead.name,
    email: lead.email,
    reason: reason.trim() || undefined,
  });
}

export async function approveLeadWithToken(leadId: string): Promise<void> {
  const supabase = createAdminClient();

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: lead, error } = await supabase
    .from("leads")
    .update({
      status: "qualified",
      questionnaire_token: token,
      token_expires_at: expiresAt.toISOString(),
      token_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select("name, email, company")
    .single();

  if (error) throw new Error(error.message);

  await sendQuestionnaireInvite({
    name: lead.name,
    email: lead.email,
    company: lead.company,
    token,
    expiresAt: expiresAt.toISOString(),
  });
}
