import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { sendLeadConfirmation, sendLeadAdminNotification } from "@/app/actions/email";

const ALLOWED_ORIGINS = [
  "https://andykgroup.com",
  "https://www.andykgroup.com",
  "http://localhost:3000",
  "http://localhost:3001",
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
  const supabase = createAdminClient();

  // Duplicate + cooling period check
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
      // Silent block — return success so the form doesn't reveal the rejection
      return NextResponse.json({ success: true, message: "Application received." }, { status: 200, headers });
    }
  }

  // Score
  const scoreResult = calculateLeadScore({
    revenue:            String(answers.revenue ?? ""),
    timeline:           String(answers.timeline ?? ""),
    decision_authority: String(answers.decision_authority ?? ""),
    services:           Array.isArray(answers.services) ? answers.services as string[] : [],
    business_description: answers.business_description ? String(answers.business_description) : undefined,
    biggest_challenge:    answers.biggest_challenge    ? String(answers.biggest_challenge)    : undefined,
    website:              answers.website              ? String(answers.website)              : undefined,
  });

  const metadata = {
    score:       scoreResult.total,
    breakdown:   scoreResult.dimensions,
    questionnaire: { ...answers },
    scored_at:   scoreResult.scored_at,
  };

  let leadId: string;

  if (existing && existing.status !== "rejected") {
    // Update existing non-rejected lead
    const { data: updated, error } = await supabase
      .from("leads")
      .update({
        name:     name.trim(),
        phone:    phone?.trim() || null,
        company:  company?.trim() || null,
        source:   source || "website",
        status:   "new",
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) {
      console.error("Lead update error:", error.message);
      return NextResponse.json({ success: false, error: "Failed to update lead" }, { status: 500, headers });
    }
    leadId = updated.id;
  } else {
    // Create new lead
    const { data: created, error } = await supabase
      .from("leads")
      .insert({
        name:     name.trim(),
        email:    normalizedEmail,
        phone:    phone?.trim() || null,
        company:  company?.trim() || null,
        source:   source || "website",
        status:   "new",
        metadata,
        converted_to_client_id: null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Lead create error:", error.message);
      return NextResponse.json({ success: false, error: "Failed to create lead" }, { status: 500, headers });
    }
    leadId = created.id;
  }

  // Fire emails — non-blocking, errors don't fail the submission
  await Promise.allSettled([
    sendLeadConfirmation({ name: name.trim(), email: normalizedEmail }),
    sendLeadAdminNotification({
      leadId,
      name:         name.trim(),
      email:        normalizedEmail,
      phone:        phone?.trim() || null,
      company:      company?.trim() || null,
      score:        scoreResult.total,
      breakdown:    scoreResult.dimensions,
      questionnaire: { ...answers },
    }),
  ]);

  return NextResponse.json({ success: true, message: "Application received." }, { status: 200, headers });
}
