import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./helpers";

const sectionValidator = v.object({
  key: v.string(),
  title: v.string(),
  contentTemplate: v.string(),
  order: v.number(),
  isConditional: v.optional(v.boolean()),
  condition: v.optional(v.string()),
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("proposalTemplates")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .first();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    return await ctx.db.query("proposalTemplates").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    systemPrompt: v.string(),
    sections: v.array(sectionValidator),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    const now = Date.now();

    // Deactivate all existing templates
    const existing = await ctx.db.query("proposalTemplates").collect();
    for (const template of existing) {
      await ctx.db.patch(template._id, { isActive: false, updatedAt: now });
    }

    return await ctx.db.insert("proposalTemplates", {
      name: args.name,
      version: 1,
      isActive: true,
      systemPrompt: args.systemPrompt,
      sections: args.sections,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("proposalTemplates"),
    name: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    sections: v.optional(v.array(sectionValidator)),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const template = await ctx.db.get(args.id);
    if (!template) throw new Error("Template not found");

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
      version: template.version + 1,
    };
    if (args.name !== undefined) updates.name = args.name;
    if (args.systemPrompt !== undefined) updates.systemPrompt = args.systemPrompt;
    if (args.sections !== undefined) updates.sections = args.sections;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const setActive = mutation({
  args: { id: v.id("proposalTemplates") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const now = Date.now();

    // Deactivate all
    const all = await ctx.db.query("proposalTemplates").collect();
    for (const t of all) {
      if (t._id !== args.id && t.isActive) {
        await ctx.db.patch(t._id, { isActive: false, updatedAt: now });
      }
    }

    await ctx.db.patch(args.id, { isActive: true, updatedAt: now });
    return args.id;
  },
});
