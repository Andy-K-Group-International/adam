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

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
