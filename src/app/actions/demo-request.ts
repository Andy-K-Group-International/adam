"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const BLOCKED_DOMAINS = [
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.fr", "yahoo.de",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr",
  "outlook.com", "outlook.co.uk",
  "icloud.com", "me.com", "mac.com",
  "protonmail.com", "proton.me",
  "gmx.com", "gmx.de", "gmx.net",
  "live.com", "msn.com",
  "aol.com",
];

function isBusinessEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return !BLOCKED_DOMAINS.includes(domain);
}

function isValidDomain(website: string): boolean {
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    const parsed = new URL(url);
    const host = parsed.hostname;
    return host.includes(".") && host.length > 3;
  } catch {
    return false;
  }
}

export interface DemoRequestFormData {
  full_name: string;
  email: string;
  company: string;
  website: string;
  role: string;
  country: string;
  company_size: string;
  use_case: string;
  challenge: string;
  how_heard: string;
  document_url?: string;
}

export async function submitDemoRequest(
  data: DemoRequestFormData
): Promise<{ success: true } | { error: string }> {
  // Server-side validations
  if (!data.full_name?.trim()) return { error: "Full name is required." };
  if (!data.email?.trim()) return { error: "Business email is required." };
  if (!isBusinessEmail(data.email)) return { error: "Please use your business email address. Personal email providers are not accepted." };
  if (!data.company?.trim()) return { error: "Company name is required." };
  if (!data.website?.trim()) return { error: "Company website is required." };
  if (!isValidDomain(data.website)) return { error: "Please enter a valid company website URL." };
  if (!data.role?.trim()) return { error: "Role/Position is required." };
  if (!data.country?.trim()) return { error: "Country is required." };
  if (!data.company_size) return { error: "Company size is required." };
  if (!data.use_case) return { error: "Use case is required." };
  if (!data.challenge?.trim()) return { error: "Please describe your operational challenge." };
  if (!data.how_heard) return { error: "Please tell us how you heard about A.D.A.M." };

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    null;

  const supabase = createAdminClient();

  // Check cooling period
  const emailLower = data.email.toLowerCase().trim();
  const { data: existing } = await supabase
    .from("leads")
    .select("id, status, cooling_period_until")
    .eq("email", emailLower)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    if (existing.status === "rejected" && existing.cooling_period_until) {
      const until = new Date(existing.cooling_period_until);
      if (until > new Date()) {
        return { error: "An application from this email is currently under a cooling period. Please try again later." };
      }
    }
    if (existing.status === "new" || existing.status === "contacted" || existing.status === "qualified") {
      return { error: "An application from this email is already under review. We will be in touch soon." };
    }
  }

  const { error } = await supabase.from("leads").insert({
    name: data.full_name.trim(),
    email: emailLower,
    company: data.company.trim(),
    source: "website",
    status: "new",
    service_interest: data.use_case,
    notes: null,
    metadata: {
      score: 0,
      breakdown: {
        revenue:            { value: data.company_size, label: data.company_size, score: 0, max: 40 },
        timeline:           { value: "demo",            label: "Demo request",    score: 0, max: 30 },
        decision_authority: { value: data.role,         label: data.role,         score: 0, max: 30 },
      },
      scored_at: new Date().toISOString(),
      demo_request: true,
      questionnaire: {
        website:       data.website.trim(),
        role:          data.role.trim(),
        country:       data.country.trim(),
        company_size:  data.company_size,
        use_case:      data.use_case,
        challenge:     data.challenge.trim(),
        how_heard:     data.how_heard,
        document_url:  data.document_url ?? null,
        ip_address:    ip,
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Demo request insert error:", error);
    return { error: "Failed to submit your application. Please try again." };
  }

  // Admin notification
  await notifyAdminDemoRequest({
    name: data.full_name.trim(),
    email: emailLower,
    company: data.company.trim(),
    website: data.website.trim(),
    role: data.role.trim(),
    country: data.country.trim(),
    company_size: data.company_size,
    use_case: data.use_case,
    challenge: data.challenge.trim(),
  }).catch(() => {});

  return { success: true };
}

async function notifyAdminDemoRequest(d: {
  name: string; email: string; company: string; website: string;
  role: string; country: string; company_size: string; use_case: string; challenge: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const rows = [
    ["Name",         d.name],
    ["Email",        d.email],
    ["Company",      d.company],
    ["Website",      d.website],
    ["Role",         d.role],
    ["Country",      d.country],
    ["Company Size", d.company_size],
    ["Use Case",     d.use_case],
  ];

  const tableRows = rows.map(([label, value]) =>
    `<tr><td style="padding:6px 0;color:#8b93a8;font-family:'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;width:120px;border-bottom:1px solid #ede8e2;">${label}</td><td style="padding:6px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${value}</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#faf6f3;font-family:'Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f3;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:#fff;padding:40px;border:1px solid #ede8e2;border-radius:12px;"><h1 style="font-family:Georgia,serif;font-size:20px;color:#01011b;margin:0 0 20px;">New Demo Request</h1><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${tableRows}</table><div style="background:#faf6f3;border-left:2px solid #c9707d;padding:14px 18px;border-radius:0 8px 8px 0;"><p style="color:#8b93a8;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;margin:0 0 6px;">Challenge</p><p style="color:#01011b;font-size:13px;margin:0;">${d.challenge}</p></div><p style="margin-top:24px;"><a href="https://adam.andykgroup.com/admin/leads" style="background:#c9707d;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;">Review in A.D.A.M. &#8594;</a></p></td></tr></table></td></tr></table></body></html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "A.D.A.M. <info@andykgroup.com>",
      to: ["info@andykgroup.com"],
      subject: `Demo Request — ${d.name} (${d.company})`,
      text: `New demo request from ${d.name} at ${d.company} (${d.email}).\n\nRole: ${d.role}\nCountry: ${d.country}\nCompany size: ${d.company_size}\nUse case: ${d.use_case}\n\nChallenge:\n${d.challenge}\n\nReview: https://adam.andykgroup.com/admin/leads`,
      html,
    }),
  });
}
