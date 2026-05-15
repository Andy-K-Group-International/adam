import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are a senior business development writer at Andy'K Group International LTD.
Your task is to write an Executive Summary section for a client proposal.

The summary must:
- Be 3–4 paragraphs, written in a confident, professional tone
- Acknowledge the client's specific situation, goals, and challenges (from the data provided)
- Explain why Andy'K Group International LTD is uniquely positioned to help
- Reference the recommended service type without being salesy
- End with a forward-looking statement about the proposed partnership
- Be written in plain text (no markdown, no bullet points, no headers)

Write ONLY the executive summary text. No preamble, no labels, no formatting.`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let proposalId: string;
  try {
    const body = await req.json();
    proposalId = body.proposalId;
    if (!proposalId) throw new Error("missing proposalId");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: proposal } = await admin
    .from("proposals")
    .select("*, questionnaire_id")
    .eq("id", proposalId)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  let questionnaireContext = "";
  if (proposal.questionnaire_id) {
    const { data: q } = await admin
      .from("questionnaires")
      .select("company_name, business_goals, challenges, usp, countries_of_operation, products_services, annual_revenue, years_in_business, segments")
      .eq("id", proposal.questionnaire_id)
      .single();

    if (q) {
      questionnaireContext = [
        `Company: ${q.company_name}`,
        `Markets: ${q.countries_of_operation || "Not specified"}`,
        `Years in business: ${q.years_in_business || "Not specified"}`,
        `Annual revenue: ${q.annual_revenue || "Not disclosed"}`,
        q.products_services ? `Products & Services: ${q.products_services}` : "",
        `Business goals: ${q.business_goals}`,
        `Key challenges: ${q.challenges}`,
        `USP: ${q.usp}`,
        q.segments?.length ? `Segments: ${(q.segments as string[]).join(", ")}` : "",
      ].filter(Boolean).join("\n");
    }
  }

  const serviceLabels: Record<string, string> = {
    b2b: "B2B Lead Generation & Sales Development",
    b2g: "B2G Tender Development & Government Market Entry",
    adam_license: "A.D.A.M. Platform Licence",
    end_to_end: "End-to-End Business Development Programme",
  };
  const serviceLabel = serviceLabels[proposal.service_type] ?? "Business Development";

  const userMessage = `Write an Executive Summary for a proposal to the following client.

Service recommended: ${serviceLabel}

${questionnaireContext || "Client details not yet available — write a professional summary based on the service type alone."}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const summary = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
