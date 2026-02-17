import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./helpers";

export const listForClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    return await ctx.db
      .query("activityLog")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const listForCurrentClient = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (!user.clientId) return [];

    const limit = args.limit ?? 20;
    return await ctx.db
      .query("activityLog")
      .withIndex("by_clientId", (q) => q.eq("clientId", user.clientId!))
      .order("desc")
      .take(limit);
  },
});

export const listAll = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    const limit = args.limit ?? 50;

    return await ctx.db
      .query("activityLog")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});

export const create = mutation({
  args: {
    type: v.union(
      v.literal("contract_created"),
      v.literal("contract_published"),
      v.literal("contract_viewed"),
      v.literal("contract_changes_requested"),
      v.literal("contract_client_signed"),
      v.literal("contract_countersigned"),
      v.literal("contract_finalized"),
      v.literal("appendix_uploaded"),
      v.literal("appendix_verified"),
      v.literal("appendix_rejected"),
      v.literal("comment_added"),
      v.literal("client_created"),
      v.literal("questionnaire_submitted"),
      v.literal("client_stage_changed")
    ),
    actorId: v.optional(v.id("users")),
    clientId: v.optional(v.id("clients")),
    contractId: v.optional(v.id("contracts")),
    questionnaireId: v.optional(v.id("questionnaires")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("activityLog", {
      type: args.type,
      actorId: args.actorId,
      clientId: args.clientId,
      contractId: args.contractId,
      questionnaireId: args.questionnaireId,
      metadata: args.metadata,
      createdAt: now,
    });
  },
});
