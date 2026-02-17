import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./helpers";

export const submit = mutation({
  args: {
    companyName: v.string(),
    websiteUrl: v.optional(v.string()),
    billingCurrency: v.string(),
    contactName: v.string(),
    contactPhone: v.string(),
    contactEmail: v.string(),
    address: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      postcode: v.string(),
      country: v.string(),
    }),
    dataEnrichmentConsent: v.boolean(),
    socialProfiles: v.optional(v.string()),
    countriesOfOperation: v.string(),
    yearsInBusiness: v.string(),
    annualRevenue: v.optional(v.string()),
    productsServices: v.string(),
    businessGoals: v.string(),
    challenges: v.string(),
    competitors: v.optional(v.string()),
    usp: v.string(),
    communicationChannels: v.array(v.string()),
    securityRequirements: v.optional(v.array(v.string())),
    privacyPolicyAgreed: v.boolean(),
    segments: v.array(v.string()),
    b2bData: v.optional(v.any()),
    b2gData: v.optional(v.any()),
    adamData: v.optional(v.any()),
    attachmentIds: v.optional(v.array(v.string())),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const questionnaireId = await ctx.db.insert("questionnaires", {
      ...args,
      status: "submitted",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "questionnaire_submitted",
      questionnaireId,
      metadata: {
        companyName: args.companyName,
        contactEmail: args.contactEmail,
      },
      createdAt: now,
    });

    return questionnaireId;
  },
});

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("submitted"),
        v.literal("converted")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    if (args.status) {
      return await ctx.db
        .query("questionnaires")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }

    return await ctx.db.query("questionnaires").collect();
  },
});

export const getById = query({
  args: { id: v.id("questionnaires") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    const questionnaire = await ctx.db.get(args.id);
    if (!questionnaire) throw new Error("Questionnaire not found");

    return questionnaire;
  },
});

export const saveDraft = mutation({
  args: {
    email: v.string(),
    answers: v.any(),
    selectedSegments: v.array(v.string()),
    currentPageIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Look for existing draft by email
    const existing = await ctx.db
      .query("questionnaires")
      .withIndex("by_email", (q) => q.eq("contactEmail", args.email))
      .filter((q) => q.eq(q.field("status"), "draft"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        b2bData: args.answers,
        segments: args.selectedSegments,
        sessionId: String(args.currentPageIndex),
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new draft
    const id = await ctx.db.insert("questionnaires", {
      companyName: args.answers.companyName || "",
      websiteUrl: args.answers.websiteUrl || undefined,
      billingCurrency: args.answers.billingCurrency || "",
      contactName: args.answers.contactName || "",
      contactPhone: args.answers.contactPhone || "",
      contactEmail: args.email,
      address: args.answers.address || {
        line1: "",
        city: "",
        postcode: "",
        country: "",
      },
      dataEnrichmentConsent: !!args.answers.dataEnrichmentConsent,
      socialProfiles: args.answers.socialProfiles || undefined,
      countriesOfOperation: args.answers.countriesOfOperation || "",
      yearsInBusiness: args.answers.yearsInBusiness || "",
      annualRevenue: args.answers.annualRevenue || undefined,
      productsServices: args.answers.productsServices || "",
      businessGoals: args.answers.businessGoals || "",
      challenges: args.answers.challenges || "",
      competitors: args.answers.competitors || undefined,
      usp: args.answers.usp || "",
      communicationChannels: args.answers.communicationChannels || [],
      securityRequirements: args.answers.securityRequirements || undefined,
      privacyPolicyAgreed: !!args.answers.privacyPolicyAgreed,
      segments: args.selectedSegments,
      b2bData: args.answers,
      b2gData: undefined,
      adamData: undefined,
      attachmentIds: undefined,
      status: "draft",
      sessionId: String(args.currentPageIndex),
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const getDraftByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!args.email) return null;

    const draft = await ctx.db
      .query("questionnaires")
      .withIndex("by_email", (q) => q.eq("contactEmail", args.email))
      .filter((q) => q.eq(q.field("status"), "draft"))
      .first();

    if (!draft) return null;

    return {
      _id: draft._id,
      answers: draft.b2bData || {},
      selectedSegments: draft.segments || [],
      currentPageIndex: parseInt(draft.sessionId) || 0,
      updatedAt: draft.updatedAt,
    };
  },
});

export const deleteDraft = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const draft = await ctx.db
      .query("questionnaires")
      .withIndex("by_email", (q) => q.eq("contactEmail", args.email))
      .filter((q) => q.eq(q.field("status"), "draft"))
      .first();

    if (draft) {
      await ctx.db.delete(draft._id);
    }
  },
});

export const submitDraft = mutation({
  args: {
    email: v.string(),
    answers: v.any(),
    selectedSegments: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find the draft by email
    const draft = await ctx.db
      .query("questionnaires")
      .withIndex("by_email", (q) => q.eq("contactEmail", args.email))
      .filter((q) => q.eq(q.field("status"), "draft"))
      .first();

    if (draft) {
      // Update draft to submitted with final answers
      await ctx.db.patch(draft._id, {
        companyName: args.answers.companyName || draft.companyName,
        websiteUrl: args.answers.websiteUrl || draft.websiteUrl,
        billingCurrency: args.answers.billingCurrency || draft.billingCurrency,
        contactName: args.answers.contactName || draft.contactName,
        contactPhone: args.answers.contactPhone || draft.contactPhone,
        address: args.answers.address || draft.address,
        dataEnrichmentConsent: !!args.answers.dataEnrichmentConsent,
        socialProfiles: args.answers.socialProfiles || draft.socialProfiles,
        countriesOfOperation: args.answers.countriesOfOperation || draft.countriesOfOperation,
        yearsInBusiness: args.answers.yearsInBusiness || draft.yearsInBusiness,
        annualRevenue: args.answers.annualRevenue || draft.annualRevenue,
        productsServices: args.answers.productsServices || draft.productsServices,
        businessGoals: args.answers.businessGoals || draft.businessGoals,
        challenges: args.answers.challenges || draft.challenges,
        competitors: args.answers.competitors || draft.competitors,
        usp: args.answers.usp || draft.usp,
        communicationChannels: args.answers.communicationChannels || draft.communicationChannels,
        securityRequirements: args.answers.securityRequirements || draft.securityRequirements,
        privacyPolicyAgreed: !!args.answers.privacyPolicyAgreed,
        segments: args.selectedSegments,
        b2bData: args.answers,
        status: "submitted",
        submittedAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("activityLog", {
        type: "questionnaire_submitted",
        questionnaireId: draft._id,
        metadata: {
          companyName: args.answers.companyName || draft.companyName,
          contactEmail: args.email,
        },
        createdAt: now,
      });

      return draft._id;
    }

    // No draft found — create submitted questionnaire directly
    const id = await ctx.db.insert("questionnaires", {
      companyName: args.answers.companyName || "",
      websiteUrl: args.answers.websiteUrl || undefined,
      billingCurrency: args.answers.billingCurrency || "",
      contactName: args.answers.contactName || "",
      contactPhone: args.answers.contactPhone || "",
      contactEmail: args.email,
      address: args.answers.address || {
        line1: "",
        city: "",
        postcode: "",
        country: "",
      },
      dataEnrichmentConsent: !!args.answers.dataEnrichmentConsent,
      socialProfiles: args.answers.socialProfiles || undefined,
      countriesOfOperation: args.answers.countriesOfOperation || "",
      yearsInBusiness: args.answers.yearsInBusiness || "",
      annualRevenue: args.answers.annualRevenue || undefined,
      productsServices: args.answers.productsServices || "",
      businessGoals: args.answers.businessGoals || "",
      challenges: args.answers.challenges || "",
      competitors: args.answers.competitors || undefined,
      usp: args.answers.usp || "",
      communicationChannels: args.answers.communicationChannels || [],
      securityRequirements: args.answers.securityRequirements || undefined,
      privacyPolicyAgreed: !!args.answers.privacyPolicyAgreed,
      segments: args.selectedSegments,
      b2bData: args.answers,
      status: "submitted",
      sessionId: "0",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "questionnaire_submitted",
      questionnaireId: id,
      metadata: {
        companyName: args.answers.companyName || "",
        contactEmail: args.email,
      },
      createdAt: now,
    });

    return id;
  },
});

export const linkToUser = mutation({
  args: {
    email: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const questionnaires = await ctx.db
      .query("questionnaires")
      .withIndex("by_email", (q) => q.eq("contactEmail", args.email))
      .collect();

    for (const q of questionnaires) {
      if (!q.userId) {
        await ctx.db.patch(q._id, { userId: args.userId });
      }
    }

    return questionnaires.length;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
