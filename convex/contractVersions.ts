import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./helpers";

export const listByContract = query({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    return await ctx.db
      .query("contractVersions")
      .withIndex("by_contractId", (q) => q.eq("contractId", args.contractId))
      .collect();
  },
});

export const create = mutation({
  args: {
    contractId: v.id("contracts"),
    version: v.number(),
    content: v.string(),
    sections: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          content: v.string(),
        })
      )
    ),
    changedBy: v.id("users"),
    changeNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("contractVersions", {
      contractId: args.contractId,
      version: args.version,
      content: args.content,
      sections: args.sections,
      changedBy: args.changedBy,
      changeNote: args.changeNote,
      createdAt: now,
    });
  },
});
