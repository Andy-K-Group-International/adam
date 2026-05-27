import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const LOGO_SVG_40 = `<svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#0E282D" stroke-width="4" fill="none"/><polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#2F9E9A" stroke-width="3" fill="none"/><text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#0E282D">A</text></svg>`;
const LOGO_SVG_24 = `<svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#0E282D" stroke-width="4" fill="none"/><polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#2F9E9A" stroke-width="3" fill="none"/><text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#0E282D">A</text></svg>`;

function resetEmailHtml(resetUrl: string): string {
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
            &nbsp;&nbsp;<span style="font-family:'Courier New',monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.12em;">Password Reset</span>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border-left:1px solid #ede8e2;border-right:1px solid #ede8e2;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0E282D;margin:0 0 16px;line-height:1.3;">Reset your password</h1>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">We received a request to reset the password for your A.D.A.M. account. Click the button below to choose a new password.</p>
        <div style="margin-bottom:32px;">
          <a href="${resetUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.01em;">Reset Password &#8594;</a>
        </div>
        <div style="background:#f0f4f4;border-left:2px solid #ede8e2;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:28px;">
          <p style="color:#8b93a8;font-size:12px;margin:0 0 6px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.1em;">Or copy this link</p>
          <p style="color:#0E282D;font-size:12px;margin:0;font-family:'Courier New',monospace;word-break:break-all;">${resetUrl}</p>
        </div>
        <div style="border-top:1px solid #ede8e2;padding-top:20px;">
          <p style="color:#8b93a8;font-size:13px;line-height:1.6;margin:0;">If you didn't request a password reset, you can safely ignore this email — your password will not be changed. This link expires in 1 hour.</p>
        </div>
      </td></tr>
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

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const redirectTo = "https://adam.andykgroup.com/auth/callback?next=/reset-password";

  // Generate reset link via Supabase admin
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    // Silently succeed to avoid email enumeration
    return NextResponse.json({ success: true });
  }

  const resetUrl = data.properties.action_link;

  // Send via Resend
  const key = process.env.RESEND_API_KEY;
  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Andy'K Group International LTD <info@andykgroup.com>",
        to: [email],
        subject: "Reset your A.D.A.M. password",
        text: `You requested a password reset for your A.D.A.M. account.\n\nReset your password here:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
        html: resetEmailHtml(resetUrl),
      }),
    });
    if (!res.ok) console.error("Resend error:", await res.text());
  }

  return NextResponse.json({ success: true });
}
