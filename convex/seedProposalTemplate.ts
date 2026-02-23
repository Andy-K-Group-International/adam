import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if template already exists
    const existing = await ctx.db
      .query("proposalTemplates")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .first();

    if (existing) {
      return { message: "Template already exists", id: existing._id };
    }

    const now = Date.now();

    const id = await ctx.db.insert("proposalTemplates", {
      name: "Default Proposal Template v1",
      version: 1,
      isActive: true,
      systemPrompt: `You are a professional proposal writer for Andy'K Group International LTD, a UK-based consultancy specializing in B2B lead generation, B2G government tender preparation, and AI-powered digital transformation (A.D.A.M. platform).

Company context:
- Founded in the UK, registered company number 16453500
- Serves clients across multiple countries
- Core services: B2B lead generation & sales pipeline, B2G government tender writing & compliance, A.D.A.M. AI platform for automated business processes
- Value proposition: Data-driven strategies, multi-channel outreach, compliance expertise, AI automation

When writing proposals:
- Use professional, confident but not salesy tone
- Reference specific details from the client's questionnaire answers
- Tailor recommendations to their industry, market, and stated challenges
- Be specific with deliverables and timelines
- Use markdown formatting for clarity`,
      sections: [
        {
          key: "executive_summary",
          title: "Executive Summary",
          contentTemplate: `# Executive Summary

{{AI:EXECUTIVE_SUMMARY}}

**Prepared for:** {{COMPANY_NAME}}
**Prepared by:** Andy'K Group International LTD
**Date:** {{DATE}}
**Ref:** {{PROPOSAL_REF}}`,
          order: 1,
        },
        {
          key: "about_client",
          title: "About You",
          contentTemplate: `# About {{COMPANY_NAME}}

**Company:** {{COMPANY_NAME}}
**Contact:** {{CONTACT_NAME}}
**Website:** {{WEBSITE_URL}}
**Countries of Operation:** {{COUNTRIES_OF_OPERATION}}
**Years in Business:** {{YEARS_IN_BUSINESS}}
**Industry/Services:** {{PRODUCTS_SERVICES}}

### Your Goals
{{BUSINESS_GOALS}}

### Key Challenges
{{CHALLENGES}}

### Unique Selling Proposition
{{USP}}`,
          order: 2,
        },
        {
          key: "why_andyk",
          title: "Why Andy'K Group",
          contentTemplate: `# Why Andy'K Group International

{{AI:WHY_ANDYK}}`,
          order: 3,
        },
        {
          key: "services_b2b",
          title: "B2B Lead Generation Services",
          contentTemplate: `# B2B Lead Generation Services

{{AI:B2B_SERVICES}}

### Proposed Channels
{{COMMUNICATION_CHANNELS}}`,
          order: 4,
          isConditional: true,
          condition: "segments:B2B",
        },
        {
          key: "services_b2g",
          title: "B2G Tender & Government Services",
          contentTemplate: `# B2G Tender & Government Services

{{AI:B2G_SERVICES}}`,
          order: 5,
          isConditional: true,
          condition: "segments:B2G",
        },
        {
          key: "services_adam",
          title: "A.D.A.M. AI Platform",
          contentTemplate: `# A.D.A.M. — Automated Digital Asset Manager

{{AI:ADAM_SERVICES}}`,
          order: 6,
          isConditional: true,
          condition: "segments:ADAM",
        },
        {
          key: "methodology",
          title: "Our Methodology",
          contentTemplate: `# Our Methodology & Timeline

{{AI:METHODOLOGY}}`,
          order: 7,
        },
        {
          key: "investment",
          title: "Investment & Pricing",
          contentTemplate: `# Investment

{{AI:INVESTMENT}}

*All prices are in {{BILLING_CURRENCY}}. VAT will be added where applicable.*`,
          order: 8,
        },
        {
          key: "terms",
          title: "Terms & Next Steps",
          contentTemplate: `# Terms & Next Steps

{{AI:TERMS}}

### How to Proceed
1. Review this proposal carefully
2. Click "Approve Proposal" to accept
3. We'll generate a formal contract for digital signing
4. Kick-off meeting scheduled within 5 business days of signing

**This proposal is valid for 30 days from the date of issue.**

---
*Andy'K Group International LTD | Registered in England & Wales | Company No. 16453500*`,
          order: 9,
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    return { message: "Template seeded successfully", id };
  },
});
