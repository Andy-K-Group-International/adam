import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./helpers";

// ─── Public queries (no auth — used by questionnaire flow) ───

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("questionItems")
      .withIndex("by_number")
      .collect();
    return items
      .filter((q) => q.isActive)
      .map((q) => ({
        id: q.questionId,
        number: q.number,
        question: q.question,
        type: q.type,
        required: q.required,
        options: q.options,
        placeholder: q.placeholder,
        conditionalOn: q.conditionalOn,
        section: q.section,
        subsection: q.subsection,
      }));
  },
});

export const listActiveSections = query({
  args: {},
  handler: async (ctx) => {
    const sections = await ctx.db.query("questionSections").collect();
    return sections
      .filter((s) => s.isActive)
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.sectionId,
        title: s.title,
        subsections: s.subsections,
      }));
  },
});

// ─── Admin queries ───

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("questionItems")
      .withIndex("by_number")
      .collect();
    return items.map((q) => ({
      _id: q._id,
      id: q.questionId,
      number: q.number,
      question: q.question,
      type: q.type,
      required: q.required,
      options: q.options,
      placeholder: q.placeholder,
      conditionalOn: q.conditionalOn,
      section: q.section,
      subsection: q.subsection,
      isActive: q.isActive,
    }));
  },
});

export const listAllSections = query({
  args: {},
  handler: async (ctx) => {
    const sections = await ctx.db.query("questionSections").collect();
    return sections
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        _id: s._id,
        id: s.sectionId,
        title: s.title,
        subsections: s.subsections,
        order: s.order,
        isActive: s.isActive,
      }));
  },
});

// ─── Admin mutations ───

export const updateQuestion = mutation({
  args: {
    questionId: v.string(),
    question: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("text"),
        v.literal("url"),
        v.literal("email"),
        v.literal("phone"),
        v.literal("long-text"),
        v.literal("single-select"),
        v.literal("multi-select"),
        v.literal("checkbox"),
        v.literal("address"),
        v.literal("file"),
        v.literal("group")
      )
    ),
    required: v.optional(v.boolean()),
    options: v.optional(
      v.array(v.object({ label: v.string(), value: v.string() }))
    ),
    placeholder: v.optional(v.string()),
    conditionalOn: v.optional(
      v.object({ questionId: v.string(), value: v.string() })
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const existing = await ctx.db
      .query("questionItems")
      .withIndex("by_questionId", (q) => q.eq("questionId", args.questionId))
      .unique();
    if (!existing) throw new Error("Question not found");

    const { questionId: _qid, ...updates } = args;
    // Filter out undefined values
    const patch: Record<string, any> = {};
    if (updates.question !== undefined) patch.question = updates.question;
    if (updates.type !== undefined) patch.type = updates.type;
    if (updates.required !== undefined) patch.required = updates.required;
    if (updates.options !== undefined) patch.options = updates.options;
    if (updates.placeholder !== undefined)
      patch.placeholder = updates.placeholder;
    if (updates.conditionalOn !== undefined)
      patch.conditionalOn = updates.conditionalOn;

    await ctx.db.patch(existing._id, patch);
  },
});

export const toggleActive = mutation({
  args: {
    questionId: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const existing = await ctx.db
      .query("questionItems")
      .withIndex("by_questionId", (q) => q.eq("questionId", args.questionId))
      .unique();
    if (!existing) throw new Error("Question not found");

    await ctx.db.patch(existing._id, { isActive: args.isActive });
  },
});

export const updateSection = mutation({
  args: {
    sectionId: v.string(),
    title: v.optional(v.string()),
    subsections: v.optional(
      v.array(v.object({ id: v.string(), title: v.string() }))
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const existing = await ctx.db
      .query("questionSections")
      .withIndex("by_sectionId", (q) => q.eq("sectionId", args.sectionId))
      .unique();
    if (!existing) throw new Error("Section not found");

    const patch: Record<string, any> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.subsections !== undefined) patch.subsections = args.subsections;

    await ctx.db.patch(existing._id, patch);
  },
});
