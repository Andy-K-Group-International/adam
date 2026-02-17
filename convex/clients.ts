import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./helpers";

export const list = query({
  args: {
    stage: v.optional(
      v.union(
        v.literal("questionnaire"),
        v.literal("proposal"),
        v.literal("strategy"),
        v.literal("contract"),
        v.literal("invoice"),
        v.literal("kickoff")
      )
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    if (args.search) {
      let searchQuery = ctx.db
        .query("clients")
        .withSearchIndex("search_company", (q) => {
          let sq = q.search("companyName", args.search!);
          if (args.stage) {
            sq = sq.eq("stage", args.stage);
          }
          return sq;
        });
      return await searchQuery.collect();
    }

    if (args.stage) {
      return await ctx.db
        .query("clients")
        .withIndex("by_stage", (q) => q.eq("stage", args.stage!))
        .collect();
    }

    return await ctx.db.query("clients").collect();
  },
});

export const getById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");

    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.id))
      .collect();

    return { ...client, contracts };
  },
});

export const create = mutation({
  args: {
    companyName: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    address: v.optional(
      v.object({
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        postcode: v.string(),
        country: v.string(),
      })
    ),
    billingCurrency: v.optional(v.string()),
    segments: v.optional(v.array(v.string())),
    stage: v.optional(
      v.union(
        v.literal("questionnaire"),
        v.literal("proposal"),
        v.literal("strategy"),
        v.literal("contract"),
        v.literal("invoice"),
        v.literal("kickoff")
      )
    ),
    assignedTo: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "staff"]);
    const now = Date.now();

    const clientId = await ctx.db.insert("clients", {
      companyName: args.companyName,
      contactName: args.contactName,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      websiteUrl: args.websiteUrl,
      address: args.address,
      billingCurrency: args.billingCurrency,
      segments: args.segments,
      stage: args.stage ?? "questionnaire",
      assignedTo: args.assignedTo,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "client_created",
      actorId: user._id,
      clientId,
      createdAt: now,
    });

    return clientId;
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    companyName: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    address: v.optional(
      v.object({
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        postcode: v.string(),
        country: v.string(),
      })
    ),
    billingCurrency: v.optional(v.string()),
    segments: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Client not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const updateStage = mutation({
  args: {
    id: v.id("clients"),
    stage: v.union(
      v.literal("questionnaire"),
      v.literal("proposal"),
      v.literal("strategy"),
      v.literal("contract"),
      v.literal("invoice"),
      v.literal("kickoff")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "staff"]);
    const now = Date.now();

    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");

    const previousStage = client.stage;

    await ctx.db.patch(args.id, {
      stage: args.stage,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "client_stage_changed",
      actorId: user._id,
      clientId: args.id,
      metadata: { from: previousStage, to: args.stage },
      createdAt: now,
    });

    return args.id;
  },
});

export const convertFromQuestionnaire = mutation({
  args: { questionnaireId: v.id("questionnaires") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "staff"]);
    const now = Date.now();

    const questionnaire = await ctx.db.get(args.questionnaireId);
    if (!questionnaire) throw new Error("Questionnaire not found");
    if (questionnaire.status === "converted") {
      throw new Error("Questionnaire already converted");
    }

    const clientId = await ctx.db.insert("clients", {
      companyName: questionnaire.companyName,
      contactName: questionnaire.contactName,
      contactEmail: questionnaire.contactEmail,
      contactPhone: questionnaire.contactPhone,
      websiteUrl: questionnaire.websiteUrl,
      address: questionnaire.address,
      billingCurrency: questionnaire.billingCurrency,
      segments: questionnaire.segments,
      stage: "questionnaire",
      questionnaireId: args.questionnaireId,
      assignedTo: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.questionnaireId, {
      status: "converted",
      convertedToClientId: clientId,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "client_created",
      actorId: user._id,
      clientId,
      questionnaireId: args.questionnaireId,
      metadata: { source: "questionnaire" },
      createdAt: now,
    });

    return clientId;
  },
});
