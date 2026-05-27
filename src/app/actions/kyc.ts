"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { KycDocumentType, KycDocument } from "@/lib/supabase/types";

// ── Email helper ──────────────────────────────────────────────────────────────

const LOGO_SVG_40 = `<svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#0E282D" stroke-width="4" fill="none"/><polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#2F9E9A" stroke-width="3" fill="none"/><text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#0E282D">A</text></svg>`;
const LOGO_SVG_24 = `<svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#0E282D" stroke-width="4" fill="none"/><polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#2F9E9A" stroke-width="3" fill="none"/><text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#0E282D">A</text></svg>`;

function emailHtml(label: string, body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f4;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#f0f4f4;padding:20px 40px;border-radius:12px 12px 0 0;border:1px solid #ede8e2;border-bottom:none;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td width="40" height="40" style="width:40px;height:40px;min-width:40px;vertical-align:middle;">${LOGO_SVG_40}</td>
          <td style="padding-left:12px;vertical-align:middle;">
            <span style="font-family:Georgia,'Times New Roman',serif;color:#0E282D;font-size:16px;font-weight:700;">A.D.A.M.</span>
            &nbsp;&nbsp;<span style="font-family:'Courier New',monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.12em;">${label}</span>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border-left:1px solid #ede8e2;border-right:1px solid #ede8e2;">${body}</td></tr>
      <tr><td style="background:#f0f4f4;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #ede8e2;border-top:none;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;width:33%;"><table cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;width:24px;height:24px;min-width:24px;">${LOGO_SVG_24}</td>
            <td style="padding-left:7px;vertical-align:middle;"><span style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;color:#0E282D;">A.D.A.M.</span></td>
          </tr></table></td>
          <td style="text-align:center;vertical-align:middle;width:34%;padding:0 8px;">
            <p style="font-family:'Courier New',monospace;font-size:10px;color:#8b93a8;margin:0;line-height:1.7;">Andy&#8217;K Group International LTD &middot; Reg: 16453500<br>86-90 Paul Street, London, EC2A 4NE</p>
          </td>
          <td style="text-align:right;vertical-align:middle;width:33%;">
            <a href="https://andykgroup.com" style="font-family:'Courier New',monospace;font-size:10px;color:#2F9E9A;text-decoration:none;">andykgroup.com</a>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}

async function sendEmail(to: string, subject: string, text: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const res = await fetch("https://api.resend.com/emails", {
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

// ── Actions ───────────────────────────────────────────────────────────────────

export async function submitKycAction(data: {
  clientId: string;
  companyName: string;
  companyRegNumber: string;
  vatNumber: string;
  country: string;
  directorName: string;
  directorEmail: string;
  documents: KycDocument[];
}): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    await supabase.from("kyc_verifications").upsert(
      {
        client_id: data.clientId,
        status: "pending",
        company_name: data.companyName || null,
        company_reg_number: data.companyRegNumber || null,
        vat_number: data.vatNumber || null,
        country: data.country || null,
        director_name: data.directorName || null,
        director_email: data.directorEmail || null,
        documents: data.documents,
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" }
    );

    // Get client info for admin notification
    const { data: client } = await supabase
      .from("clients")
      .select("company_name, contact_name, contact_email")
      .eq("id", data.clientId)
      .single();

    if (client) {
      const html = emailHtml("KYC Alert", `
        <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;">KYC submitted for review</h1>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">A KYC verification request has been submitted and requires your review.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.1em;width:140px;border-bottom:1px solid #ede8e2;">Client</td><td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${client.company_name}</td></tr>
          <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Company Reg</td><td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${data.companyRegNumber || "—"}</td></tr>
          <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Director</td><td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${data.directorName || "—"}</td></tr>
          <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.1em;">Documents</td><td style="padding:7px 0;color:#525a70;font-size:13px;">${data.documents.length} uploaded</td></tr>
        </table>
        <p style="color:#8b93a8;font-size:12px;font-family:'Courier New',monospace;margin:0;">Review via the admin panel → Clients → ${client.company_name} → KYC</p>
      `);
      await sendEmail(
        "info@andykgroup.com",
        `KYC Submitted — ${client.company_name}`,
        `KYC submitted for ${client.company_name}. Review at adam.andykgroup.com/admin/clients/${data.clientId}`,
        html
      );
    }

    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

export async function verifyKycAction(
  kycId: string,
  adminUserId: string
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: kyc, error } = await supabase
      .from("kyc_verifications")
      .update({
        status: "verified",
        verified_by: adminUserId,
        verified_at: new Date().toISOString(),
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", kycId)
      .select("client_id, director_email, company_name")
      .single();

    if (error || !kyc) return { error: error?.message ?? "Not found" };

    const { data: client } = await supabase
      .from("clients")
      .select("contact_name, contact_email, company_name")
      .eq("id", kyc.client_id)
      .single();

    if (client) {
      const recipientEmail = kyc.director_email || client.contact_email;
      const html = emailHtml("KYC Verified", `
        <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;">Your KYC has been verified</h1>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Dear ${client.contact_name},</p>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">We are pleased to confirm that the KYC verification for <strong>${client.company_name}</strong> has been completed successfully. Your account is now fully verified.</p>
        <div style="background:#f0faf4;border-left:2px solid #22c55e;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
          <p style="color:#16a34a;font-size:14px;font-weight:600;margin:0;">✓ KYC Status: Verified</p>
        </div>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 20px;">You can now proceed with signing your contract and all further steps in the onboarding process.</p>
        <div style="border-top:1px solid #ede8e2;padding-top:20px;">
          <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
        </div>
      `);
      await sendEmail(
        recipientEmail,
        "KYC Verification Complete — Andy'K Group International LTD",
        `Dear ${client.contact_name},\n\nYour KYC verification for ${client.company_name} has been completed successfully. Your account is now fully verified.\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
        html
      );
    }

    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

export async function rejectKycAction(
  kycId: string,
  reason: string
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: kyc, error } = await supabase
      .from("kyc_verifications")
      .update({
        status: "rejected",
        rejection_reason: reason,
        verified_by: null,
        verified_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", kycId)
      .select("client_id, director_email, company_name")
      .single();

    if (error || !kyc) return { error: error?.message ?? "Not found" };

    const { data: client } = await supabase
      .from("clients")
      .select("contact_name, contact_email, company_name")
      .eq("id", kyc.client_id)
      .single();

    if (client) {
      const recipientEmail = kyc.director_email || client.contact_email;
      const html = emailHtml("KYC Update", `
        <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;">Action required: KYC resubmission</h1>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Dear ${client.contact_name},</p>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Unfortunately, we were unable to complete the KYC verification for <strong>${client.company_name}</strong>. Please review the reason below and resubmit your documents.</p>
        <div style="background:#fef2f2;border-left:2px solid #ef4444;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
          <p style="color:#8b93a8;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Rejection reason</p>
          <p style="color:#0E282D;font-size:14px;margin:0;">${reason}</p>
        </div>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 20px;">Please log in to your client portal and resubmit your KYC documents addressing the issue above.</p>
        <div style="margin-bottom:28px;">
          <a href="https://adam.andykgroup.com/dashboard/profile" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;">Resubmit KYC &#8594;</a>
        </div>
        <div style="border-top:1px solid #ede8e2;padding-top:20px;">
          <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
        </div>
      `);
      await sendEmail(
        recipientEmail,
        "KYC Resubmission Required — Andy'K Group International LTD",
        `Dear ${client.contact_name},\n\nYour KYC verification for ${client.company_name} requires resubmission.\n\nReason: ${reason}\n\nPlease log in at adam.andykgroup.com/dashboard/profile to resubmit.\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
        html
      );
    }

    return {};
  } catch (err) {
    return { error: String(err) };
  }
}
