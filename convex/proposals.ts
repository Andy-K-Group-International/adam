import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./helpers";
import { api, internal } from "./_generated/api";

// ─── Queries ──────────────────────────────────────────────────

export const listAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("evaluating"),
        v.literal("flagged"),
        v.literal("draft"),
        v.literal("sent"),
        v.literal("changes_requested"),
        v.literal("approved"),
        v.literal("declined")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    if (args.status) {
      return await ctx.db
        .query("proposals")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }

    return await ctx.db.query("proposals").collect();
  },
});

export const getById = query({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const proposal = await ctx.db.get(args.id);
    if (!proposal) throw new Error("Proposal not found");

    // Clients can view if the proposal is linked to their questionnaire email
    if (user.role === "client") {
      const questionnaire = await ctx.db.get(proposal.questionnaireId);
      if (!questionnaire || questionnaire.contactEmail !== user.email) {
        throw new Error("Not authorized to view this proposal");
      }
    }

    return proposal;
  },
});

export const getByQuestionnaireId = query({
  args: { questionnaireId: v.id("questionnaires") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    return await ctx.db
      .query("proposals")
      .withIndex("by_questionnaireId", (q) =>
        q.eq("questionnaireId", args.questionnaireId)
      )
      .first();
  },
});

// Client query: get proposal linked to their email
export const getForClient = query({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const proposal = await ctx.db.get(args.id);
    if (!proposal) return null;

    const questionnaire = await ctx.db.get(proposal.questionnaireId);
    if (!questionnaire) return null;

    // Allow if client email matches questionnaire email
    if (user.role === "client" && questionnaire.contactEmail !== user.email) {
      return null;
    }

    return proposal;
  },
});

// ─── Internal Mutations (called from actions) ────────────────

export const createInternal = internalMutation({
  args: {
    questionnaireId: v.id("questionnaires"),
    title: v.string(),
    status: v.union(
      v.literal("evaluating"),
      v.literal("flagged"),
      v.literal("draft")
    ),
    aiEvaluation: v.optional(
      v.object({
        recommendation: v.union(v.literal("proceed"), v.literal("flag")),
        reasoning: v.string(),
        qualityScore: v.number(),
        evaluatedAt: v.number(),
      })
    ),
    sections: v.array(
      v.object({
        key: v.string(),
        title: v.string(),
        content: v.string(),
        order: v.number(),
        isVisible: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const proposalId = await ctx.db.insert("proposals", {
      questionnaireId: args.questionnaireId,
      title: args.title,
      status: args.status,
      aiEvaluation: args.aiEvaluation,
      sections: args.sections,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "proposal_created",
      questionnaireId: args.questionnaireId,
      proposalId: proposalId,
      metadata: { title: args.title, status: args.status },
      createdAt: now,
    });

    return proposalId;
  },
});

export const updateStatusInternal = internalMutation({
  args: {
    id: v.id("proposals"),
    status: v.union(
      v.literal("evaluating"),
      v.literal("flagged"),
      v.literal("draft"),
      v.literal("sent"),
      v.literal("changes_requested"),
      v.literal("approved"),
      v.literal("declined")
    ),
    aiEvaluation: v.optional(
      v.object({
        recommendation: v.union(v.literal("proceed"), v.literal("flag")),
        reasoning: v.string(),
        qualityScore: v.number(),
        evaluatedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.aiEvaluation) updates.aiEvaluation = args.aiEvaluation;

    await ctx.db.patch(args.id, updates);
  },
});

export const updateSectionsInternal = internalMutation({
  args: {
    id: v.id("proposals"),
    sections: v.array(
      v.object({
        key: v.string(),
        title: v.string(),
        content: v.string(),
        order: v.number(),
        isVisible: v.boolean(),
      })
    ),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("flagged"), v.literal("evaluating"))
    ),
    templateId: v.optional(v.id("proposalTemplates")),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      sections: args.sections,
      updatedAt: Date.now(),
    };
    if (args.status) updates.status = args.status;
    if (args.templateId) updates.templateId = args.templateId;

    await ctx.db.patch(args.id, updates);
  },
});

// Bridging mutation to schedule AI generation from an action
export const scheduleGeneration = internalMutation({
  args: {
    proposalId: v.id("proposals"),
    questionnaireId: v.id("questionnaires"),
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(0, api.actions.ai.generateProposal, {
      proposalId: args.proposalId,
      questionnaireId: args.questionnaireId,
    });
  },
});

// ─── Admin Mutations ──────────────────────────────────────────

export const updateSections = mutation({
  args: {
    id: v.id("proposals"),
    sections: v.array(
      v.object({
        key: v.string(),
        title: v.string(),
        content: v.string(),
        order: v.number(),
        isVisible: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    const proposal = await ctx.db.get(args.id);
    if (!proposal) throw new Error("Proposal not found");

    await ctx.db.patch(args.id, {
      sections: args.sections,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const updateSection = mutation({
  args: {
    id: v.id("proposals"),
    sectionKey: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "staff"]);

    const proposal = await ctx.db.get(args.id);
    if (!proposal) throw new Error("Proposal not found");

    const sections = proposal.sections.map((s) =>
      s.key === args.sectionKey ? { ...s, content: args.content } : s
    );

    await ctx.db.patch(args.id, {
      sections,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const adminApprove = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "staff"]);
    const now = Date.now();

    const proposal = await ctx.db.get(args.id);
    if (!proposal) throw new Error("Proposal not found");
    if (
      proposal.status !== "draft" &&
      proposal.status !== "changes_requested" &&
      proposal.status !== "flagged"
    ) {
      throw new Error("Proposal cannot be approved from this status");
    }

    await ctx.db.patch(args.id, {
      status: "sent",
      approvedByAdminAt: now,
      sentToClientAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "proposal_admin_approved",
      actorId: user._id,
      proposalId: args.id,
      questionnaireId: proposal.questionnaireId,
      createdAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "proposal_sent_to_client",
      actorId: user._id,
      proposalId: args.id,
      questionnaireId: proposal.questionnaireId,
      createdAt: now,
    });

    // Return questionnaire info for email sending on the frontend
    const questionnaire = await ctx.db.get(proposal.questionnaireId);
    return {
      proposalId: args.id,
      clientEmail: questionnaire?.contactEmail,
      clientName: questionnaire?.contactName,
      companyName: questionnaire?.companyName,
      title: proposal.title,
    };
  },
});

export const clientApprove = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const now = Date.now();

    const proposal = await ctx.db.get(args.id);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "sent") {
      throw new Error("Proposal cannot be approved from this status");
    }

    // Verify client owns this proposal
    const questionnaire = await ctx.db.get(proposal.questionnaireId);
    if (!questionnaire || questionnaire.contactEmail !== user.email) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      status: "approved",
      clientApprovedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "proposal_client_approved",
      actorId: user._id,
      proposalId: args.id,
      questionnaireId: proposal.questionnaireId,
      createdAt: now,
    });

    return args.id;
  },
});

export const clientRequestChanges = mutation({
  args: {
    id: v.id("proposals"),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const now = Date.now();

    const proposal = await ctx.db.get(args.id);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "sent") {
      throw new Error("Changes can only be requested for sent proposals");
    }

    const questionnaire = await ctx.db.get(proposal.questionnaireId);
    if (!questionnaire || questionnaire.contactEmail !== user.email) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      status: "changes_requested",
      clientComment: args.comment,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "proposal_changes_requested",
      actorId: user._id,
      proposalId: args.id,
      questionnaireId: proposal.questionnaireId,
      metadata: { comment: args.comment },
      createdAt: now,
    });

    return {
      proposalId: args.id,
      companyName: questionnaire.companyName,
      title: proposal.title,
    };
  },
});

export const convertToContract = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "staff"]);
    const now = Date.now();

    const proposal = await ctx.db.get(args.id);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "approved") {
      throw new Error("Only approved proposals can be converted to contracts");
    }

    const questionnaire = await ctx.db.get(proposal.questionnaireId);
    if (!questionnaire) throw new Error("Questionnaire not found");

    // Find or create client from questionnaire
    let clientId = proposal.clientId;

    if (!clientId) {
      // Check if questionnaire was already converted to a client
      if (questionnaire.convertedToClientId) {
        clientId = questionnaire.convertedToClientId;
      } else {
        // Auto-create client from questionnaire data
        clientId = await ctx.db.insert("clients", {
          companyName: questionnaire.companyName,
          contactName: questionnaire.contactName,
          contactEmail: questionnaire.contactEmail,
          contactPhone: questionnaire.contactPhone,
          websiteUrl: questionnaire.websiteUrl,
          address: questionnaire.address,
          billingCurrency: questionnaire.billingCurrency,
          segments: questionnaire.segments,
          stage: "contract",
          questionnaireId: proposal.questionnaireId,
          assignedTo: user._id,
          createdAt: now,
          updatedAt: now,
        });

        await ctx.db.patch(proposal.questionnaireId, {
          status: "converted",
          convertedToClientId: clientId,
          updatedAt: now,
        });

        await ctx.db.insert("activityLog", {
          type: "client_created",
          actorId: user._id,
          clientId,
          questionnaireId: proposal.questionnaireId,
          metadata: { source: "proposal_conversion" },
          createdAt: now,
        });
      }
    }

    // Update client stage to "contract"
    await ctx.db.patch(clientId, {
      stage: "contract",
      updatedAt: now,
    });

    // Map proposal sections to contract sections (keep relevant ones)
    const contractSectionKeys = [
      "services",
      "investment",
      "timeline",
      "terms",
      "deliverables",
      "scope",
    ];
    const contractSections = proposal.sections
      .filter(
        (s) =>
          s.isVisible &&
          (contractSectionKeys.some((k) => s.key.toLowerCase().includes(k)) ||
            s.key === "methodology" ||
            s.key === "support")
      )
      .map((s) => ({
        id: s.key,
        title: s.title,
        content: s.content,
      }));

    // If no sections matched the filter, include all visible sections
    const finalSections =
      contractSections.length > 0
        ? contractSections
        : proposal.sections
            .filter((s) => s.isVisible)
            .map((s) => ({
              id: s.key,
              title: s.title,
              content: s.content,
            }));

    // Create the contract
    const contractId = await ctx.db.insert("contracts", {
      clientId,
      proposalId: args.id,
      title: proposal.title,
      content: finalSections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n---\n\n"),
      status: "draft",
      version: 1,
      sections: finalSections,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    // Link proposal to contract
    await ctx.db.patch(args.id, {
      contractId,
      clientId,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "proposal_converted",
      actorId: user._id,
      proposalId: args.id,
      clientId,
      contractId,
      questionnaireId: proposal.questionnaireId,
      createdAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "contract_created",
      actorId: user._id,
      clientId,
      contractId,
      createdAt: now,
    });

    await ctx.db.insert("activityLog", {
      type: "client_stage_changed",
      actorId: user._id,
      clientId,
      metadata: { from: "proposal", to: "contract" },
      createdAt: now,
    });

    return { contractId, clientId };
  },
});

// Admin: generate proposal for a flagged submission
export const generateForFlagged = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "staff"]);

    const proposal = await ctx.db.get(args.id);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "flagged") {
      throw new Error("Only flagged proposals can be manually generated");
    }

    await ctx.db.patch(args.id, {
      status: "evaluating",
      updatedAt: Date.now(),
    });

    // The AI action will be triggered from the frontend
    return { proposalId: args.id, questionnaireId: proposal.questionnaireId };
  },
});
