import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./helpers";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const getByAuth0Id = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
  },
});

export const ensureExists = mutation({
  args: {
    auth0Id: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (existing) {
      // Update profile info but preserve role and accountStatus
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("users", {
      auth0Id: args.auth0Id,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      role: "client",
      accountStatus: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsert = mutation({
  args: {
    auth0Id: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(
      v.literal("admin"),
      v.literal("staff"),
      v.literal("client")
    ),
    accountStatus: v.optional(
      v.union(v.literal("pending"), v.literal("active"))
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        role: args.role,
        accountStatus: args.accountStatus ?? existing.accountStatus ?? "active",
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      auth0Id: args.auth0Id,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      role: args.role,
      accountStatus: args.accountStatus ?? "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});
