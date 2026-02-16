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

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
