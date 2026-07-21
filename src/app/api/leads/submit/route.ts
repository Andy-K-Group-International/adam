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

  const { name, email, phone, company, source, answers, ref } = body as {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    answers?: Record<string, unknown>;
    ref?: string;
  };

  if (!name?.trim() || !email?.trim() || !answers) {
    return NextResponse.json(
      { success: false, error: "name, email, and answers are required" },
      { status: 400, headers }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const serviceInterest = answers.service_interest ? String(answers.service_interest) : null;
  const isEndToEnd = serviceInterest === "end_to_end";
  const freeEmailWarning = !isBusinessEmail(normalizedEmail);

  const documentUrl = answers.document_url ? String(answers.document_url) : null;
  const documentUploaded = !!documentUrl;
  const supabase = createAdminClient();

  // Rate limiting: 3 requests per IP per 24 hours, plus a second check keyed
  // on email so rotating/spoofing the IP header alone doesn't bypass it.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [{ count: recentByIp }, { count: recentByEmail }] = await Promise.all([
    supabase
      .from("rate_limit_log")
      .select("*", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("endpoint", "/api/leads/submit")
      .gte("created_at", windowStart),
    supabase
      .from("rate_limit_log")
      .select("*", { count: "exact", head: true })
      .eq("email", email.trim().toLowerCase())
      .eq("endpoint", "/api/leads/submit")
      .gte("created_at", windowStart),
  ]);

  if ((recentByIp ?? 0) >= 3 || (recentByEmail ?? 0) >= 3) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again tomorrow." },
      { status: 429, headers }
    );
  }

  // Log this attempt (non-blocking)
  supabase.from("rate_limit_log").insert({ ip, email: email.trim().toLowerCase(), endpoint: "/api/leads/submit" }).then(() => {});

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

  // Score — if scoring throws for any reason, don't drop the submission on
  // the floor: fall back to a neutral score and let the lead through as
  // "new" for manual review instead of a hard 500.
  let scoreResult: ReturnType<typeof calculateLeadScore>;
  try {
    scoreResult = calculateLeadScore({
      revenue:              String(answers.revenue ?? ""),
      timeline:             String(answers.timeline ?? ""),
      decision_authority:   String(answers.decision_authority ?? ""),
      service_interest:     serviceInterest ?? undefined,
      services:             Array.isArray(answers.services) ? (answers.services as string[]) : [],
      business_description: answers.business_description ? String(answers.business_description) : undefined,
      biggest_challenge:    answers.biggest_challenge    ? String(answers.biggest_challenge)    : undefined,
      website:              answers.website              ? String(answers.website)              : undefined,
      document_uploaded:    documentUploaded,
    });
  } catch (err) {
    console.error("Lead scoring failed, falling back to neutral score:", err);
    const fallbackDimension = { value: "unknown", label: "Scoring unavailable", score: 0, max: 0 };
    scoreResult = {
      total: 40,
      dimensions: {
        revenue: fallbackDimension,
        timeline: fallbackDimension,
        decision_authority: fallbackDimension,
      },
      scored_at: new Date().toISOString(),
    };
  }

  // Auto-routing by score (E2E leads are never auto-rejected)
  let initialStatus: "new" | "qualified" | "rejected";
  let autoRejected = false;
  let coolingUntil: Date | null = null;
  let requiresManualReview = false;

  if (!isEndToEnd && scoreResult.total < 40) {
    initialStatus = "rejected";
    autoRejected = true;
    coolingUntil = new Date();
    coolingUntil.setMonth(coolingUntil.getMonth() + 6);
  } else if (isEndToEnd && !documentUploaded) {
    initialStatus = "new";
    requiresManualReview = true;
  } else if (scoreResult.total >= 60) {
    initialStatus = "qualified";
  } else {
    initialStatus = "new";
  }

  // Seller referral: only the seller-code path is wired up here. If `ref`
  // doesn't match an active seller, it's left completely alone — including
  // the pre-existing, still-unwired clients.referral_code / /r/[code]
  // client-refers-client flow, which is a separate feature and out of scope
  // for this one (flagged to Andy as a follow-up, not solved here).
  let referredBySellerId: string | null = null;
  let matchedReferralCode: string | null = null;
  if (ref?.trim()) {
    const { data: seller } = await supabase
      .from("sellers")
      .select("id, referral_code")
      .eq("referral_code", ref.trim().toUpperCase())
      .eq("status", "active")
      .maybeSingle();
    if (seller) {
      referredBySellerId = seller.id;
      matchedReferralCode = seller.referral_code;
    }
  }

  const metadata = {
    score:            scoreResult.total,
    breakdown:        scoreResult.dimensions,
    questionnaire:    { ...answers },
    scored_at:        scoreResult.scored_at,
    ...(serviceInterest ? { service_interest: serviceInterest } : {}),
    ...(documentUrl ? { document_url: documentUrl } : {}),
    ...(requiresManualReview ? { requires_manual_review: true } : {}),
    ...(freeEmailWarning ? { free_email_warning: true } : {}),
    ...(matchedReferralCode
      ? { referral_code: matchedReferralCode, referred_by_seller_id: referredBySellerId }
      : {}),
  };

  const baseData = {
    name:              name.trim(),
    phone:             phone?.trim() || null,
    company:           company?.trim() || null,
    // Server-derived, not trusted from the client: a seller match always
    // wins over whatever `source` the caller passed, since only the server
    // can verify the ref code against an active seller.
    source:            referredBySellerId ? "referral" : (source || "website"),
    status:            initialStatus,
    service_interest:  serviceInterest,
    free_email_warning: freeEmailWarning,
    referred_by_seller_id: referredBySellerId,
    metadata,
    updated_at:        new Date().toISOString(),
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
        isEndToEnd,
        documentUrl,
      }),
    ]);
  }

  const message = isEndToEnd
    ? "Your End-to-End application has been received. Our team will review it and be in touch within 48 hours."
    : "Application received.";

  return NextResponse.json({ success: true, message }, { status: 200, headers });
}
