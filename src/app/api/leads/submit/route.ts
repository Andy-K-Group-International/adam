import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { sendLeadConfirmation, sendLeadAdminNotification, sendLeadRejection } from "@/app/actions/email";

const ALLOWED_ORIGINS = [
  "https://andykgroup.com",
  "https://www.andykgroup.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

const BLOCKED_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "icloud.com", "protonmail.com", "gmx.com", "web.de",
  "yahoo.co.uk", "yahoo.fr", "hotmail.co.uk", "hotmail.fr",
  "live.com", "msn.com",
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function isBusinessEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? !BLOCKED_EMAIL_DOMAINS.includes(domain) : false;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400, headers });
  }

  const { name, email, phone, company, source, answers } = body as {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    answers?: Record<string, unknown>;
  };

  if (!name?.trim() || !email?.trim() || !answers) {
    return NextResponse.json(
      { success: false, error: "name, email, and answers are required" },
      { status: 400, headers }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!isBusinessEmail(normalizedEmail)) {
    return NextResponse.json(
      { success: false, error: "Please use your business email address" },
      { status: 400, headers }
    );
  }

  const serviceInterest = answers.service_interest ? String(answers.service_interest) : null;
  const supabase = createAdminClient();

  // Rate limiting: 3 requests per IP per 24 hours
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("rate_limit_log")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("endpoint", "/api/leads/submit")
    .gte("created_at", windowStart);

  if ((recentCount ?? 0) >= 3) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again tomorrow." },
      { status: 429, headers }
    );
  }

  // Log this attempt (non-blocking)
  supabase.from("rate_limit_log").insert({ ip, endpoint: "/api/leads/submit" }).then(() => {});

  // Cooling period check
  const { data: existing } = await supabase
    .from("leads")
    .select("id, status, cooling_period_until, rejected_at")
    .eq("email", normalizedEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.cooling_period_until) {
    const until = new Date(existing.cooling_period_until as string);
    if (until > new Date()) {
      return NextResponse.json({ success: true, message: "Application received." }, { status: 200, headers });
    }
  }

  // Score
  const scoreResult = calculateLeadScore({
    revenue:              String(answers.revenue ?? ""),
    timeline:             String(answers.timeline ?? ""),
    decision_authority:   String(answers.decision_authority ?? ""),
    service_interest:     serviceInterest ?? undefined,
    services:             Array.isArray(answers.services) ? (answers.services as string[]) : [],
    business_description: answers.business_description ? String(answers.business_description) : undefined,
    biggest_challenge:    answers.biggest_challenge    ? String(answers.biggest_challenge)    : undefined,
    website:              answers.website              ? String(answers.website)              : undefined,
  });

  // Auto-routing by score
  let initialStatus: "new" | "qualified" | "rejected";
  let autoRejected = false;
  let coolingUntil: Date | null = null;

  if (scoreResult.total < 40) {
    initialStatus = "rejected";
    autoRejected = true;
    coolingUntil = new Date();
    coolingUntil.setMonth(coolingUntil.getMonth() + 6);
  } else if (scoreResult.total >= 60) {
    initialStatus = "qualified";
  } else {
    initialStatus = "new";
  }

  const metadata = {
    score:            scoreResult.total,
    breakdown:        scoreResult.dimensions,
    questionnaire:    { ...answers },
    scored_at:        scoreResult.scored_at,
    ...(serviceInterest ? { service_interest: serviceInterest } : {}),
  };

  const baseData = {
    name:             name.trim(),
    phone:            phone?.trim() || null,
    company:          company?.trim() || null,
    source:           source || "website",
    status:           initialStatus,
    service_interest: serviceInterest,
    metadata,
    updated_at:       new Date().toISOString(),
    ...(autoRejected
      ? {
          rejected_at:          new Date().toISOString(),
          cooling_period_until: coolingUntil!.toISOString(),
        }
      : {}),
  };

  let leadId: string;

  if (existing && existing.status !== "rejected") {
    const { data: updated, error } = await supabase
      .from("leads")
      .update(baseData)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) {
      console.error("Lead update error:", error.message);
      return NextResponse.json({ success: false, error: "Failed to update lead" }, { status: 500, headers });
    }
    leadId = updated.id;
  } else {
    const { data: created, error } = await supabase
      .from("leads")
      .insert({ ...baseData, email: normalizedEmail, converted_to_client_id: null })
      .select("id")
      .single();

    if (error) {
      console.error("Lead create error:", error.message);
      return NextResponse.json({ success: false, error: "Failed to create lead" }, { status: 500, headers });
    }
    leadId = created.id;
  }

  // Emails
  if (autoRejected) {
    await Promise.allSettled([
      sendLeadRejection({ name: name.trim(), email: normalizedEmail }),
    ]);
  } else {
    await Promise.allSettled([
      sendLeadConfirmation({ name: name.trim(), email: normalizedEmail }),
      sendLeadAdminNotification({
        leadId,
        name:          name.trim(),
        email:         normalizedEmail,
        phone:         phone?.trim() || null,
        company:       company?.trim() || null,
        score:         scoreResult.total,
        breakdown:     scoreResult.dimensions,
        questionnaire: { ...answers },
        highPriority:  scoreResult.total >= 60,
      }),
    ]);
  }

  return NextResponse.json({ success: true, message: "Application received." }, { status: 200, headers });
}
