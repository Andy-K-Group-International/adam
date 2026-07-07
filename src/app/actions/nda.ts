"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Email transport (mirrors email.ts pattern) ───────────────────────────────

const LOGO_SVG_40 = `<svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#0E282D" stroke-width="4" fill="none"/><polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#2F9E9A" stroke-width="3" fill="none"/><text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#0E282D">A</text></svg>`;
const LOGO_SVG_24 = `<svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#0E282D" stroke-width="4" fill="none"/><polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#2F9E9A" stroke-width="3" fill="none"/><text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#0E282D">A</text></svg>`;

function emailHtml(label: string | undefined, body: string): string {
  const labelSpan = label
    ? `&nbsp;&nbsp;<span style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.12em;">${label}</span>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f4;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#f0f4f4;padding:20px 40px;border-radius:12px 12px 0 0;border:1px solid #ede8e2;border-bottom:none;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td width="40" height="40" style="width:40px;height:40px;min-width:40px;vertical-align:middle;">${LOGO_SVG_40}</td>
          <td style="padding-left:12px;vertical-align:middle;">
            <span style="font-family:Georgia,'Times New Roman',serif;color:#0E282D;font-size:16px;font-weight:700;letter-spacing:-0.3px;">A.D.A.M.</span>${labelSpan}
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border-left:1px solid #ede8e2;border-right:1px solid #ede8e2;">${body}</td></tr>
      <tr><td style="background:#f0f4f4;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #ede8e2;border-top:none;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;width:33%;"><table cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;width:24px;height:24px;min-width:24px;">${LOGO_SVG_24}</td>
            <td style="padding-left:7px;vertical-align:middle;"><span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;color:#0E282D;letter-spacing:0.04em;">A.D.A.M.</span></td>
          </tr></table></td>
          <td style="text-align:center;vertical-align:middle;width:34%;padding:0 8px;">
            <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;margin:0;line-height:1.7;">Andy&#8217;K Group International LTD &middot; Reg: 16453500<br>86-90 Paul Street, London, EC2A 4NE, United Kingdom</p>
          </td>
          <td style="text-align:right;vertical-align:middle;width:33%;">
            <a href="https://andykgroup.com" style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#2F9E9A;text-decoration:none;">andykgroup.com</a>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.error("RESEND_API_KEY not set"); return null; }
  const res = await fetch("https://api.eu.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Andy'K Group International LTD <info@andykgroup.com>",
      to: [to],
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) console.error("Resend error:", await res.text());
}

// ─── Emails ───────────────────────────────────────────────────────────────────

async function sendNdaConfirmation({
  name,
  email,
  company,
  signedAt,
  demoUrl,
}: {
  name: string;
  email: string;
  company: string;
  signedAt: string;
  demoUrl: string;
}) {
  const html = emailHtml("NDA Signed", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your NDA has been signed</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you for signing the Non-Disclosure Agreement with Andy&#8217;K Group International LTD. Your signature has been recorded and a copy is held securely.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:5px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;width:90px;border-bottom:1px solid #ede8e2;">Name</td>
          <td style="padding:5px 0;color:#0E282D;font-size:13px;border-bottom:1px solid #ede8e2;">${name}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Company</td>
          <td style="padding:5px 0;color:#0E282D;font-size:13px;border-bottom:1px solid #ede8e2;">${company}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;">Signed</td>
          <td style="padding:5px 0;color:#0E282D;font-size:13px;">${signedAt}</td>
        </tr>
      </table>
    </div>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 20px;">Your private A.D.A.M. demo is ready. Use your personal access link below — this link is unique to you.</p>
    <div style="margin-bottom:32px;">
      <a href="${demoUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.01em;">Access Your Private Demo &#8594;</a>
    </div>
    <p style="color:#8b93a8;font-size:12px;line-height:1.6;margin:0 0 24px;font-family:'Courier New',Courier,monospace;word-break:break-all;">${demoUrl}</p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  await sendEmail({
    to: email,
    subject: "Your Private A.D.A.M. Demo Access — Andy'K Group International LTD",
    text: `Hi ${name},\n\nThank you for signing the NDA with Andy'K Group International LTD.\n\nYour private A.D.A.M. demo is ready:\n${demoUrl}\n\nName: ${name}\nCompany: ${company}\nSigned: ${signedAt}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

async function sendNdaAdminNotification({
  name,
  email,
  company,
  jobTitle,
  signedAt,
  ip,
}: {
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  signedAt: string;
  ip: string | null;
}) {
  const html = emailHtml("NDA Alert", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">New NDA signed</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">A Non-Disclosure Agreement has been signed via adam.andykgroup.com/nda-sign.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;width:100px;border-bottom:1px solid #ede8e2;">Name</td>
        <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${name}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Company</td>
        <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${company}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Job Title</td>
        <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${jobTitle}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Email</td>
        <td style="padding:7px 0;font-size:13px;border-bottom:1px solid #ede8e2;"><a href="mailto:${email}" style="color:#2F9E9A;text-decoration:none;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Signed</td>
        <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${signedAt}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;">IP</td>
        <td style="padding:7px 0;color:#525a70;font-size:13px;font-family:'Courier New',Courier,monospace;">${ip || "unknown"}</td>
      </tr>
    </table>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#8b93a8;font-size:12px;margin:0;font-family:'Courier New',Courier,monospace;">Automated notification &mdash; A.D.A.M. &middot; Andy&#8217;K Group International LTD</p>
    </div>
  `);
  await sendEmail({
    to: "info@andykgroup.com",
    subject: `NDA Signed — ${name} (${company})`,
    text: `New NDA signed via adam.andykgroup.com/nda-sign\n\nName: ${name}\nCompany: ${company}\nJob Title: ${jobTitle}\nEmail: ${email}\nSigned: ${signedAt}\nIP: ${ip || "unknown"}`,
    html,
  });
}

// ─── Server action ────────────────────────────────────────────────────────────

export async function submitNdaSignature(data: {
  full_name: string;
  company: string;
  email: string;
  job_title: string;
  signature_data: string;
}): Promise<{ success: true; demoToken: string } | { error: string }> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    null;

  const supabase = createAdminClient();
  const { error: dbError } = await supabase.from("nda_signatures").insert({
    full_name: data.full_name,
    company: data.company,
    email: data.email,
    job_title: data.job_title,
    signature_data: data.signature_data,
    ip_address: ip,
  });

  if (dbError) {
    console.error("NDA insert error:", dbError);
    return { error: "Failed to save your signature. Please try again." };
  }

  // Generate demo access token (7-day expiry)
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await supabase.from("demo_tokens").insert({
    token,
    email: data.email,
    name: data.full_name,
    company: data.company,
    company_name: data.company,
    contact_name: data.full_name,
    ip_address: ip,
    expires_at: expiresAt.toISOString(),
  });

  const signedAt = new Date().toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/London",
  });

  const demoUrl = `https://adam.andykgroup.com/demo?token=${token}`;

  await Promise.allSettled([
    sendNdaConfirmation({ name: data.full_name, email: data.email, company: data.company, signedAt, demoUrl }),
    sendNdaAdminNotification({ name: data.full_name, email: data.email, company: data.company, jobTitle: data.job_title, signedAt, ip }),
  ]);

  return { success: true, demoToken: token };
}
