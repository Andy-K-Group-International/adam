import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapAnswersToDiscreteColumns } from "@/lib/questionnaire-field-map";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { sessionToken, email, answers, selectedSegments } = body as {
    sessionToken?: string;
    email?: string;
    answers?: Record<string, unknown>;
    selectedSegments?: string[];
  };

  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const supabase = createAdminClient();

  let draft: { id: string } | null = null;
  if (sessionToken) {
    const { data } = await supabase
      .from("questionnaires")
      .select("id")
      .eq("session_id", sessionToken)
      .eq("status", "draft")
      .maybeSingle();
    draft = data;
  }
  if (!draft) {
    const { data } = await supabase
      .from("questionnaires")
      .select("id")
      .eq("contact_email", normalizedEmail)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    draft = data;
  }

  if (!draft) {
    return NextResponse.json({ error: "No draft found for this session" }, { status: 404 });
  }

  const finalAnswers = answers ?? {};
  const finalSegments = selectedSegments ?? [];

  const { data: submitted, error } = await supabase
    .from("questionnaires")
    .update({
      contact_email: normalizedEmail,
      answers: finalAnswers,
      selected_segments: finalSegments,
      // Best-effort: also populate the discrete columns admin review, AI
      // evaluation, and convertToClientAction all read directly — see
      // questionnaire-field-map.ts for what is (and isn't) covered.
      ...mapAnswersToDiscreteColumns(finalAnswers, finalSegments),
      status: "submitted",
      privacy_policy_agreed: true,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", draft.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("activity_log").insert({
    action: "questionnaire_submitted",
    description: `Questionnaire submitted by ${normalizedEmail}`,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ questionnaire: submitted });
}
