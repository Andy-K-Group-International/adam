import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./helpers";

export const listForClient = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    if (!user.clientId) return [];
    return await ctx.db
      .query("contracts")
      .withIndex("by_clientId", (q) => q.eq("clientId", user.clientId!))
      .collect();
  },
});

export const listAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("viewed"),
        v.literal("changes_requested"),
        v.literal("client_signed"),
        v.literal("countersigned"),
        v.literal("final")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    if (args.status) {
      return await ctx.db
        .query("contracts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }

    return await ctx.db.query("contracts").collect();
  },
});

export const getById = query({
  args: { id: v.id("contracts") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const contract = await ctx.db.get(args.id);
    if (!contract) throw new Error("Contract not found");

    // Clients can only view their own contracts
    if (user.role === "client") {
      if (!user.clientId || contract.clientId !== user.clientId) {
        throw new Error("Not authorized to view this contract");
      }
    }

    return contract;
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    title: v.string(),
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
    appendices: v.optional(
      v.array(
        v.object({
          slot: v.string(),
          label: v.string(),
          required: v.boolean(),
          fileId: v.optional(v.id("contractFiles")),
          status: v.union(
            v.literal("empty"),
            v.literal("uploaded"),
            v.literal("verified"),
            v.literal("rejected")
          ),
          rejectionNote: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "staff"]);
    const now = Date.now();

    const client = await ctx.db.get(args.clientId);
    if (!client) throw new Error("Client not found");

    const contractId = await ctx.db.insert("contracts", {
      clientId: args.clientId,
      title: args.title,
      content: args.content,
      status: "draft",
      version: 1,
      sections: args.sections,
      appendices: args.appendices,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "contract_created",
      actorId: user._id,
      clientId: args.clientId,
      contractId,
      createdAt: now,
    });

    return contractId;
  },
});

export const update = mutation({
  args: {
    id: v.id("contracts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    sections: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    const contract = await ctx.db.get(args.id);
    if (!contract) throw new Error("Contract not found");
    if (contract.status !== "draft" && contract.status !== "changes_requested") {
      throw new Error("Contract can only be edited in draft or changes_requested status");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.sections !== undefined) updates.sections = args.sections;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const publish = mutation({
  args: { id: v.id("contracts") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "staff"]);
    const now = Date.now();

    const contract = await ctx.db.get(args.id);
    if (!contract) throw new Error("Contract not found");
    if (contract.status !== "draft" && contract.status !== "changes_requested") {
      throw new Error("Contract can only be published from draft or changes_requested status");
    }

    const newVersion = contract.version + 1;

    // Create version snapshot
    await ctx.db.insert("contractVersions", {
      contractId: args.id,
      version: newVersion,
      content: contract.content,
      sections: contract.sections,
      changedBy: user._id,
      changeNote: "Published",
      createdAt: now,
    });

    await ctx.db.patch(args.id, {
      status: "published",
      version: newVersion,
      publishedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "contract_published",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.id,
      metadata: { version: newVersion },
      createdAt: now,
    });

    return args.id;
  },
});

export const markViewed = mutation({
  args: { id: v.id("contracts") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const now = Date.now();

    const contract = await ctx.db.get(args.id);
    if (!contract) throw new Error("Contract not found");

    // Only clients can mark as viewed
    if (user.role !== "client") throw new Error("Only clients can mark contracts as viewed");
    if (!user.clientId || contract.clientId !== user.clientId) {
      throw new Error("Not authorized");
    }
    if (contract.status !== "published") {
      throw new Error("Contract must be in published status to mark as viewed");
    }

    await ctx.db.patch(args.id, {
      status: "viewed",
      viewedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "contract_viewed",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.id,
      createdAt: now,
    });

    return args.id;
  },
});

export const requestChanges = mutation({
  args: {
    id: v.id("contracts"),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const now = Date.now();

    const contract = await ctx.db.get(args.id);
    if (!contract) throw new Error("Contract not found");

    if (user.role !== "client") throw new Error("Only clients can request changes");
    if (!user.clientId || contract.clientId !== user.clientId) {
      throw new Error("Not authorized");
    }
    if (contract.status !== "viewed" && contract.status !== "published") {
      throw new Error("Contract must be in published or viewed status to request changes");
    }

    await ctx.db.patch(args.id, {
      status: "changes_requested",
      updatedAt: now,
    });

    // Add comment
    await ctx.db.insert("contractComments", {
      contractId: args.id,
      content: args.comment,
      authorId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "contract_changes_requested",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.id,
      metadata: { comment: args.comment },
      createdAt: now,
    });

    return args.id;
  },
});

export const clientSign = mutation({
  args: {
    id: v.id("contracts"),
    signatureStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const now = Date.now();

    const contract = await ctx.db.get(args.id);
    if (!contract) throw new Error("Contract not found");

    if (user.role !== "client") throw new Error("Only clients can sign contracts");
    if (!user.clientId || contract.clientId !== user.clientId) {
      throw new Error("Not authorized");
    }
    if (contract.status !== "viewed" && contract.status !== "published") {
      throw new Error("Contract must be in published or viewed status to sign");
    }

    await ctx.db.patch(args.id, {
      status: "client_signed",
      clientSignature: args.signatureStorageId,
      clientSignedAt: now,
      clientSignedBy: user._id,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "contract_client_signed",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.id,
      createdAt: now,
    });

    return args.id;
  },
});

export const countersign = mutation({
  args: {
    id: v.id("contracts"),
    signatureStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    const now = Date.now();

    const contract = await ctx.db.get(args.id);
    if (!contract) throw new Error("Contract not found");
    if (contract.status !== "client_signed") {
      throw new Error("Contract must be client-signed before countersigning");
    }

    await ctx.db.patch(args.id, {
      status: "final",
      adminSignature: args.signatureStorageId,
      adminSignedAt: now,
      adminSignedBy: user._id,
      finalizedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "contract_countersigned",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.id,
      createdAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "contract_finalized",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.id,
      createdAt: now,
    });

    return args.id;
  },
});
