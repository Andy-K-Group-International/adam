import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function buildQuestionnaireText(q: Record<string, unknown>): string {
  const lines: string[] = [
    `Company: ${q.company_name}`,
    `Contact: ${q.contact_name} <${q.contact_email}>`,
    `Website: ${q.website_url || "N/A"}`,
    `Countries of operation: ${q.countries_of_operation}`,
    `Years in business: ${q.years_in_business}`,
    `Annual revenue: ${q.annual_revenue || "Not disclosed"}`,
    `Segments selected: ${(q.segments as string[])?.join(", ") || "None"}`,
    ``,
    `Products / Services:`,
    String(q.products_services),
    ``,
    `Business goals:`,
    String(q.business_goals),
    ``,
    `Key challenges:`,
    String(q.challenges),
    ``,
    `USP / Differentiators:`,
    String(q.usp),
    ``,
    `Competitors: ${q.competitors || "N/A"}`,
    `Communication channels: ${(q.communication_channels as string[])?.join(", ") || "N/A"}`,
    `Security requirements: ${(q.security_requirements as string[])?.join(", ") || "None"}`,
  ];

  if (q.b2b_data && Object.keys(q.b2b_data as object).length > 0) {
    lines.push(``, `B2B data:`, JSON.stringify(q.b2b_data, null, 2));
  }
  if (q.b2g_data && Object.keys(q.b2g_data as object).length > 0) {
    lines.push(``, `B2G data:`, JSON.stringify(q.b2g_data, null, 2));
  }
  if (q.adam_data && Object.keys(q.adam_data as object).length > 0) {
    lines.push(``, `A.D.A.M. data:`, JSON.stringify(q.adam_data, null, 2));
  }

  return lines.join("\n");
}

const DEFAULT_SYSTEM_PROMPT = `You are a senior business development analyst at Andy K Group International.
Your role is to evaluate client questionnaire responses and assess whether we should proceed with a proposal,
flag the lead for further qualification, or reject it outright.

Evaluate based on:
- Business maturity (years in business, revenue, clarity of goals)
- Strategic fit with our services (B2B, B2G, A.D.A.M. licensing, end-to-end)
- Quality and specificity of answers (vague answers suggest low intent)
- Competitive landscape and differentiation potential
- Identified challenges we can realistically solve

Respond ONLY with valid JSON in this exact format:
{
  "recommendation": "proceed" | "flag" | "reject",
  "reasoning": "2-4 sentence explanation of your assessment",
  "qualityScore": <integer 0-100>
}

Where qualityScore reflects overall lead quality (80+ = strong, 60-79 = moderate, 40-59 = weak, <40 = poor).`;

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let questionnaireId: string;
  try {
    const body = await req.json();
    questionnaireId = body.questionnaireId;
    if (!questionnaireId) throw new Error("missing questionnaireId");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Load questionnaire
  const { data: questionnaire, error: qError } = await admin
    .from("questionnaires")
    .select("*")
    .eq("id", questionnaireId)
    .single();

  if (qError || !questionnaire) {
    return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 });
  }

  // Load active template for system_prompt
  const { data: templates } = await admin
    .from("proposal_templates")
    .select("system_prompt")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  const systemPrompt = templates?.[0]?.system_prompt?.trim() || DEFAULT_SYSTEM_PROMPT;
  const questionnaireText = buildQuestionnaireText(questionnaire);

  // Call Claude
  let evaluation: { recommendation: "proceed" | "flag" | "reject"; reasoning: string; qualityScore: number };
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Please evaluate the following client questionnaire and return your assessment as JSON.\n\n${questionnaireText}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    evaluation = JSON.parse(jsonMatch[0]);

    if (!["proceed", "flag", "reject"].includes(evaluation.recommendation)) {
      throw new Error("Invalid recommendation value");
    }
    evaluation.qualityScore = Math.max(0, Math.min(100, Math.round(evaluation.qualityScore)));
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "AI evaluation failed" }, { status: 500 });
  }

  const aiEvaluation = {
    ...evaluation,
    evaluatedAt: new Date().toISOString(),
  };

  // Save to questionnaire
  const { error: saveError } = await admin
    .from("questionnaires")
    .update({ ai_evaluation: aiEvaluation, updated_at: new Date().toISOString() })
    .eq("id", questionnaireId);

  if (saveError) {
    console.error("Failed to save evaluation:", saveError);
    return NextResponse.json({ error: "Failed to save evaluation" }, { status: 500 });
  }

  // Log activity
  try {
    await admin.from("activity_log").insert({
      type: "questionnaire_ai_evaluated",
      actor_id: user.id,
      questionnaire_id: questionnaireId,
      metadata: { recommendation: evaluation.recommendation, qualityScore: evaluation.qualityScore },
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Failed to log activity:", e);
  }

  return NextResponse.json({ evaluation: aiEvaluation });
}
