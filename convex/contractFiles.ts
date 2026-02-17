import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./helpers";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    contractId: v.id("contracts"),
    storageId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    category: v.union(
      v.literal("appendix"),
      v.literal("signature"),
      v.literal("attachment")
    ),
    slot: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const now = Date.now();

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");

    const fileId = await ctx.db.insert("contractFiles", {
      contractId: args.contractId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      category: args.category,
      slot: args.slot,
      uploadedBy: user._id,
      createdAt: now,
    });

    // If this is an appendix, update the appendix slot status on the contract
    if (args.category === "appendix" && args.slot && contract.appendices) {
      const updatedAppendices = contract.appendices.map((appendix) => {
        if (appendix.slot === args.slot) {
          return { ...appendix, fileId, status: "uploaded" as const };
        }
        return appendix;
      });
      await ctx.db.patch(args.contractId, {
        appendices: updatedAppendices,
        updatedAt: now,
      });
    }

    await ctx.db.insert("activityLog", {
      type: "appendix_uploaded",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.contractId,
      metadata: { fileName: args.fileName, slot: args.slot, category: args.category },
      createdAt: now,
    });

    return fileId;
  },
});

export const verify = mutation({
  args: {
    contractId: v.id("contracts"),
    slot: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    const now = Date.now();

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");
    if (!contract.appendices) throw new Error("No appendices on this contract");

    const updatedAppendices = contract.appendices.map((appendix) => {
      if (appendix.slot === args.slot) {
        return { ...appendix, status: "verified" as const };
      }
      return appendix;
    });

    await ctx.db.patch(args.contractId, {
      appendices: updatedAppendices,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "appendix_verified",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.contractId,
      metadata: { slot: args.slot },
      createdAt: now,
    });
  },
});

export const reject = mutation({
  args: {
    contractId: v.id("contracts"),
    slot: v.string(),
    rejectionNote: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    const now = Date.now();

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");
    if (!contract.appendices) throw new Error("No appendices on this contract");

    const updatedAppendices = contract.appendices.map((appendix) => {
      if (appendix.slot === args.slot) {
        return {
          ...appendix,
          status: "rejected" as const,
          rejectionNote: args.rejectionNote,
        };
      }
      return appendix;
    });

    await ctx.db.patch(args.contractId, {
      appendices: updatedAppendices,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "appendix_rejected",
      actorId: user._id,
      clientId: contract.clientId,
      contractId: args.contractId,
      metadata: { slot: args.slot, rejectionNote: args.rejectionNote },
      createdAt: now,
    });
  },
});

export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
