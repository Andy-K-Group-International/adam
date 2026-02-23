import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Idempotency: check if Inkt questionnaire already exists
    const existing = await ctx.db
      .query("questionnaires")
      .withIndex("by_email", (q) => q.eq("contactEmail", "demo@inkt.app"))
      .first();

    if (existing) {
      return { message: "Inkt demo data already exists", questionnaireId: existing._id };
    }

    // 1. Insert questionnaire (status: "converted")
    const questionnaireId = await ctx.db.insert("questionnaires", {
      companyName: "Inkt B.V.",
      websiteUrl: "https://inkt.app",
      billingCurrency: "EUR",
      contactName: "Erik de Vries",
      contactPhone: "+31 20 123 4567",
      contactEmail: "demo@inkt.app",
      address: {
        line1: "Herengracht 420",
        line2: "3rd Floor",
        city: "Amsterdam",
        postcode: "1017 BZ",
        country: "Netherlands",
      },
      dataEnrichmentConsent: true,
      socialProfiles: "https://linkedin.com/company/inkt-app",
      countriesOfOperation: "Netherlands, United States, United Kingdom, Germany",
      yearsInBusiness: "2",
      annualRevenue: "Pre-revenue (seed-funded, €1.2M raised)",
      productsServices:
        "Ebook and audiobook platform with proprietary audio-text synchronisation technology. Features include word-level highlighting during audio playback, seamless switching between reading and listening, and a full analytics dashboard for authors showing reader engagement, completion rates, and chapter-level heatmaps.",
      businessGoals:
        "Launch MVP with 50 titles by Q3, onboard 100 independent authors in the first year, scale infrastructure to handle 10,000+ concurrent streaming users, and establish Inkt as the creator-friendly alternative to Amazon KDP.",
      challenges:
        "Competing against Amazon's monopoly in ebook distribution (30-65% revenue cut vs our 15%). Achieving audio-text sync at scale without latency. Building trust with authors who are wary of new platforms. Cold-start problem: need both authors and readers simultaneously.",
      competitors:
        "Amazon KDP (dominant, but takes 30-65% cut), Apple Books (curated, limited analytics), Google Play Books (low discoverability), Gumroad (no audio support), Storytel (subscription-only, Europe-focused), Lulu Press (print-focused)",
      usp:
        "Only 15% revenue share (vs Amazon's 30-65%). Full reader analytics dashboard for authors — engagement metrics, completion rates, chapter heatmaps. Proprietary word-level audio-text sync technology. Origin story: Eric Jorgenson, CEO of Scribe Media (published 1,500+ books), discovered our founder's Naval Ravikant book app and became our first investor and advisor.",
      communicationChannels: ["email", "slack", "video"],
      securityRequirements: ["gdpr", "soc2"],
      privacyPolicyAgreed: true,
      segments: ["ADAM"],
      b2bData: null,
      b2gData: null,
      adamData: {
        workflowDescription:
          "Author onboarding pipeline: author signs up → uploads manuscript (EPUB/PDF) → our AI processes text and generates chapter markers → author uploads or commissions audiobook → sync engine aligns audio to text at word level → QA review → publish to marketplace. Currently manual for steps 3-5, want to automate with A.D.A.M.",
        breakdownPoints:
          "Manual chapter marker creation (2-3 hours per book), audio alignment QA (takes 4-6 hours per title), author communication and status updates are handled via email threads with no central dashboard.",
        selectedPackage: "Professional",
        integrations: "Stripe (payments), AWS S3 (file storage), SendGrid (transactional email), Mixpanel (analytics), GitHub (codebase)",
        brandingRequirements:
          "Inkt brand: deep indigo (#1a1a4e) primary, coral (#ff6b6b) accent. Minimalist, literary aesthetic. Must feel premium but approachable. Existing Figma design system available.",
        budgetRange: "€3,000 – €5,000/month",
      },
      attachmentIds: [],
      status: "converted",
      sessionId: "inkt-demo-seed",
      submittedAt: now - 86400000, // 1 day ago
      createdAt: now - 86400000,
      updatedAt: now,
    });

    // 2. Insert client record in "proposal" stage
    const clientId = await ctx.db.insert("clients", {
      companyName: "Inkt B.V.",
      contactName: "Erik de Vries",
      contactEmail: "demo@inkt.app",
      contactPhone: "+31 20 123 4567",
      websiteUrl: "https://inkt.app",
      address: {
        line1: "Herengracht 420",
        line2: "3rd Floor",
        city: "Amsterdam",
        postcode: "1017 BZ",
        country: "Netherlands",
      },
      billingCurrency: "EUR",
      segments: ["ADAM"],
      stage: "proposal",
      questionnaireId,
      notes: "Demo account — Inkt ebook/audiobook platform. Seed-funded, strong product-market fit.",
      createdAt: now - 86400000,
      updatedAt: now,
    });

    // Link questionnaire to client
    await ctx.db.patch(questionnaireId, {
      convertedToClientId: clientId,
    });

    // 3. Activity log entries
    await ctx.db.insert("activityLog", {
      type: "questionnaire_submitted",
      clientId,
      questionnaireId,
      metadata: { companyName: "Inkt B.V." },
      createdAt: now - 86400000,
    });

    await ctx.db.insert("activityLog", {
      type: "client_created",
      clientId,
      questionnaireId,
      metadata: { source: "questionnaire", companyName: "Inkt B.V." },
      createdAt: now - 43200000, // 12 hours ago
    });

    return {
      message: "Inkt demo data seeded successfully",
      questionnaireId,
      clientId,
    };
  },
});
