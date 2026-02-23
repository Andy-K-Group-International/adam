"use node";

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

// ─── Shared Helper ────────────────────────────────────────────

async function callClaudeAPI(
  messages: { role: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  // Extract system messages into top-level param (Anthropic format)
  const systemMessages = messages.filter((m) => m.role === "system");
  const nonSystemMessages = messages.filter((m) => m.role !== "system");
  const systemPrompt = systemMessages.map((m) => m.content).join("\n\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: 0.7,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: nonSystemMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Claude API error:", error);
    throw new Error(`AI API call failed: ${error}`);
  }

  const data = await response.json();
  const textBlock = data.content.find(
    (b: { type: string; text?: string }) => b.type === "text"
  );
  return textBlock?.text || "";
}

// ─── AI Section Generator ─────────────────────────────────────

async function generateAISection(
  systemPrompt: string,
  questionnaire: Record<string, unknown>,
  aiKey: string,
  sectionTitle: string
): Promise<string> {
  const sectionPrompts: Record<string, string> = {
    EXECUTIVE_SUMMARY: `Write a compelling executive summary (3-4 paragraphs) for a proposal to ${questionnaire.companyName}.
They are a company offering "${questionnaire.productsServices}" operating in ${questionnaire.countriesOfOperation}.
Their goals: ${questionnaire.businessGoals}
Their challenges: ${questionnaire.challenges}
Selected services: ${(questionnaire.segments as string[]).join(", ")}
Highlight how Andy'K Group can address their specific needs.`,

    WHY_ANDYK: `Write a "Why Andy'K Group" section (3-4 paragraphs) explaining why Andy'K Group International is the right partner for ${questionnaire.companyName}.
Their industry: ${questionnaire.productsServices}
Their challenges: ${questionnaire.challenges}
Their USP: ${questionnaire.usp}
Focus on relevant experience, data-driven approach, and tailored solutions.`,

    B2B_SERVICES: `Write a detailed B2B lead generation services section for ${questionnaire.companyName}.
Their products/services: ${questionnaire.productsServices}
Their target markets: ${questionnaire.countriesOfOperation}
Their goals: ${questionnaire.businessGoals}
Their competitors: ${questionnaire.competitors || "Not specified"}
B2B specific data: ${JSON.stringify(questionnaire.b2bData || {})}
Include specific strategies, channels, and expected deliverables.`,

    B2G_SERVICES: `Write a B2G government tender services section for ${questionnaire.companyName}.
Their products/services: ${questionnaire.productsServices}
Their target markets: ${questionnaire.countriesOfOperation}
B2G specific data: ${JSON.stringify(questionnaire.b2gData || {})}
Include tender identification, compliance preparation, and submission support.`,

    ADAM_SERVICES: `Write a section about the A.D.A.M. AI platform services for ${questionnaire.companyName}.
Their products/services: ${questionnaire.productsServices}
Their challenges: ${questionnaire.challenges}
ADAM specific data: ${JSON.stringify(questionnaire.adamData || {})}
Explain how AI automation can streamline their operations.`,

    METHODOLOGY: `Write a methodology and timeline section for ${questionnaire.companyName}.
Services selected: ${(questionnaire.segments as string[]).join(", ")}
Include phases: Discovery, Strategy, Implementation, Optimization.
Provide realistic timelines for each phase.`,

    INVESTMENT: `Create an investment/pricing section for ${questionnaire.companyName}.
Services: ${(questionnaire.segments as string[]).join(", ")}
Currency: ${questionnaire.billingCurrency}
Company size indicators: ${questionnaire.yearsInBusiness} years in business, revenue: ${questionnaire.annualRevenue || "undisclosed"}

Present pricing as a table-like structure with:
- Service tiers or packages
- Monthly/quarterly retainer options
- Setup fees where applicable
Format as markdown with clear line items.`,

    TERMS: `Write terms and conditions summary for the proposal to ${questionnaire.companyName}.
Include: contract duration, payment terms, confidentiality, termination clause.
Keep it professional but concise — this is a summary, not the full contract.`,
  };

  const prompt =
    sectionPrompts[aiKey] ||
    `Write professional content for the "${sectionTitle}" section of a business proposal for ${questionnaire.companyName}. Their business: ${questionnaire.productsServices}. Their goals: ${questionnaire.businessGoals}.`;

  try {
    const response = await callClaudeAPI([
      {
        role: "system",
        content: `${systemPrompt}\n\nIMPORTANT: Respond with a JSON object containing a single "content" key with the markdown-formatted section content. Example: {"content": "Your markdown content here..."}`,
      },
      { role: "user", content: prompt },
    ]);

    const parsed = JSON.parse(response);
    return parsed.content || response;
  } catch (error) {
    console.error(`Failed to generate AI section ${aiKey}:`, error);
    return `*[AI content generation pending — please edit this section manually]*`;
  }
}

// ─── Evaluate Questionnaire ───────────────────────────────────

export const evaluateQuestionnaire = action({
  args: { questionnaireId: v.id("questionnaires") },
  handler: async (ctx, args): Promise<string> => {
    // Fetch questionnaire
    const questionnaire = await ctx.runQuery(
      api.questionnaires.getById,
      { id: args.questionnaireId }
    );

    if (!questionnaire) {
      throw new Error("Questionnaire not found");
    }

    // Create proposal record in evaluating state
    const proposalId: Id<"proposals"> = await ctx.runMutation(
      internal.proposals.createInternal,
      {
        questionnaireId: args.questionnaireId,
        title: `Proposal for ${questionnaire.companyName}`,
        status: "evaluating" as const,
        sections: [],
      }
    );

    try {
      // AI evaluation
      const systemPrompt = `You are an AI assistant for Andy'K Group International, a UK-based B2B/B2G consultancy.
Your job is to evaluate questionnaire submissions from potential clients.

Evaluate based on:
1. Quality of answers — are they detailed and thoughtful, or vague/lorem ipsum/gibberish?
2. Business fit — does this company match Andy'K Group's services (B2B lead gen, B2G tenders, AI platform)?
3. Legitimacy — does the company/contact seem real? Are there red flags?
4. Budget potential — based on company size, years in business, revenue indicators

Respond with JSON:
{
  "recommendation": "proceed" or "flag",
  "reasoning": "2-3 sentences explaining your assessment",
  "qualityScore": 0-100
}

Score guide:
- 80-100: Excellent fit, detailed answers, clear business need
- 60-79: Good fit, some details missing but legitimate
- 40-59: Questionable fit, vague answers or unclear needs
- 0-39: Poor quality, spam-like, or lorem ipsum content — FLAG`;

      const userPrompt = `Evaluate this questionnaire submission:

Company: ${questionnaire.companyName}
Contact: ${questionnaire.contactName} (${questionnaire.contactEmail})
Website: ${questionnaire.websiteUrl || "Not provided"}
Countries: ${questionnaire.countriesOfOperation}
Years in Business: ${questionnaire.yearsInBusiness}
Annual Revenue: ${questionnaire.annualRevenue || "Not disclosed"}
Products/Services: ${questionnaire.productsServices}
Business Goals: ${questionnaire.businessGoals}
Challenges: ${questionnaire.challenges}
Competitors: ${questionnaire.competitors || "Not provided"}
USP: ${questionnaire.usp}
Segments: ${questionnaire.segments.join(", ")}
Communication Channels: ${questionnaire.communicationChannels.join(", ")}
B2B Data: ${JSON.stringify(questionnaire.b2bData || {})}
B2G Data: ${JSON.stringify(questionnaire.b2gData || {})}
ADAM Data: ${JSON.stringify(questionnaire.adamData || {})}`;

      const aiResponse = await callClaudeAPI([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      const evaluation = JSON.parse(aiResponse);

      const aiEvaluation = {
        recommendation: evaluation.recommendation as "proceed" | "flag",
        reasoning: evaluation.reasoning as string,
        qualityScore: Math.min(100, Math.max(0, evaluation.qualityScore as number)),
        evaluatedAt: Date.now(),
      };

      if (evaluation.recommendation === "flag") {
        // Flag the proposal
        await ctx.runMutation(internal.proposals.updateStatusInternal, {
          id: proposalId,
          status: "flagged",
          aiEvaluation,
        });

        // Send non-urgent email to admin
        await ctx.runAction(api.actions.email.sendProposalFlagged, {
          staffEmail: "info@andykgroupinternational.com",
          companyName: questionnaire.companyName,
          contactName: questionnaire.contactName,
          contactEmail: questionnaire.contactEmail,
          reasoning: evaluation.reasoning,
          qualityScore: evaluation.qualityScore,
          proposalId: proposalId,
        });
      } else {
        // Update with evaluation and proceed to generate
        await ctx.runMutation(internal.proposals.updateStatusInternal, {
          id: proposalId,
          status: "evaluating",
          aiEvaluation,
        });

        // Schedule proposal generation via bridging mutation
        await ctx.runMutation(internal.proposals.scheduleGeneration, {
          proposalId,
          questionnaireId: args.questionnaireId,
        });
      }
    } catch (error) {
      console.error("AI evaluation failed:", error);
      // On failure, mark as flagged so admin can handle manually
      await ctx.runMutation(internal.proposals.updateStatusInternal, {
        id: proposalId,
        status: "flagged",
        aiEvaluation: {
          recommendation: "flag" as const,
          reasoning: `AI evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}. Manual review required.`,
          qualityScore: 0,
          evaluatedAt: Date.now(),
        },
      });
    }

    return proposalId;
  },
});

// ─── Generate Proposal (public, also callable from admin UI) ──

export const generateProposal = action({
  args: {
    proposalId: v.id("proposals"),
    questionnaireId: v.id("questionnaires"),
  },
  handler: async (ctx, args): Promise<string> => {
    // Fetch questionnaire and active template
    const questionnaire = await ctx.runQuery(
      api.questionnaires.getById,
      { id: args.questionnaireId }
    );
    const template = await ctx.runQuery(
      api.proposalTemplates.getActive
    );

    if (!questionnaire) throw new Error("Questionnaire not found");
    if (!template) throw new Error("No active proposal template found");

    const now = Date.now();
    const proposalRef = `AKG-${now.toString(36).toUpperCase()}`;

    // Build placeholder mapping from questionnaire data
    const placeholders: Record<string, string> = {
      COMPANY_NAME: questionnaire.companyName,
      CONTACT_NAME: questionnaire.contactName,
      CONTACT_EMAIL: questionnaire.contactEmail,
      WEBSITE_URL: questionnaire.websiteUrl || "N/A",
      COUNTRIES_OF_OPERATION: questionnaire.countriesOfOperation,
      YEARS_IN_BUSINESS: questionnaire.yearsInBusiness,
      ANNUAL_REVENUE: questionnaire.annualRevenue || "Not disclosed",
      PRODUCTS_SERVICES: questionnaire.productsServices,
      BUSINESS_GOALS: questionnaire.businessGoals,
      CHALLENGES: questionnaire.challenges,
      COMPETITORS: questionnaire.competitors || "Not specified",
      USP: questionnaire.usp,
      COMMUNICATION_CHANNELS: questionnaire.communicationChannels.join(", "),
      BILLING_CURRENCY: questionnaire.billingCurrency,
      SEGMENTS: questionnaire.segments.join(", "),
      DATE: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      PROPOSAL_REF: proposalRef,
    };

    // Process each template section
    const filledSections = [];

    for (const section of template.sections) {
      // Check conditional sections
      if (section.isConditional && section.condition) {
        const [field, value] = section.condition.split(":");
        if (field === "segments") {
          const hasSegment = questionnaire.segments.some(
            (s: string) => s.toUpperCase() === value.toUpperCase()
          );
          if (!hasSegment) continue; // Skip this section
        }
      }

      // Replace static placeholders
      let content = section.contentTemplate;
      for (const [key, val] of Object.entries(placeholders)) {
        content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
      }

      // Find AI placeholders and generate content for them
      const aiPlaceholderRegex = /\{\{AI:([A-Z_]+)\}\}/g;
      const aiPlaceholders = [...content.matchAll(aiPlaceholderRegex)];

      for (const match of aiPlaceholders) {
        const aiKey = match[1];
        const aiContent = await generateAISection(
          template.systemPrompt,
          questionnaire,
          aiKey,
          section.title
        );
        content = content.replace(match[0], aiContent);
      }

      filledSections.push({
        key: section.key,
        title: section.title,
        content,
        order: section.order,
        isVisible: true,
      });
    }

    // Save sections and update status
    await ctx.runMutation(internal.proposals.updateSectionsInternal, {
      id: args.proposalId,
      sections: filledSections,
      status: "draft" as const,
      templateId: template._id,
    });

    // Send urgent email to admin
    await ctx.runAction(api.actions.email.sendProposalReady, {
      staffEmail: "info@andykgroupinternational.com",
      companyName: questionnaire.companyName,
      proposalId: args.proposalId,
      title: `Proposal for ${questionnaire.companyName}`,
    });

    return args.proposalId;
  },
});
