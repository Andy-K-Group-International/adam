import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./helpers";

export const listByContract = query({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const comments = await ctx.db
      .query("contractComments")
      .withIndex("by_contractId", (q) => q.eq("contractId", args.contractId))
      .collect();

    // Enrich comments with author info
    const enriched = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          author: author
            ? {
                _id: author._id,
                firstName: author.firstName,
                lastName: author.lastName,
                imageUrl: author.imageUrl,
                role: author.role,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

export const create = mutation({
  args: {
    contractId: v.id("contracts"),
    sectionId: v.optional(v.string()),
    parentId: v.optional(v.id("contractComments")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const now = Date.now();

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");

    // Clients can only comment on their own contracts
    if (user.role === "client") {
      if (!user.clientId || contract.clientId !== user.clientId) {
        throw new Error("Not authorized to comment on this contract");
      }
    }

    const commentId = await ctx.db.insert("contractComments", {
      contractId: args.contractId,
      sectionId: args.sectionId,
      parentId: args.parentId,
      content: args.content,
      authorId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "comment_added",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.contractId,
      metadata: { sectionId: args.sectionId },
      createdAt: now,
    });

    return commentId;
  },
});
