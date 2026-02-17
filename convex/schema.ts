import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
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
    clientId: v.optional(v.id("clients")),
    accountStatus: v.optional(
      v.union(v.literal("pending"), v.literal("active"))
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth0Id", ["auth0Id"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  clients: defineTable({
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
    stage: v.union(
      v.literal("questionnaire"),
      v.literal("proposal"),
      v.literal("strategy"),
      v.literal("contract"),
      v.literal("invoice"),
      v.literal("kickoff")
    ),
    assignedTo: v.optional(v.id("users")),
    questionnaireId: v.optional(v.id("questionnaires")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_stage", ["stage"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_email", ["contactEmail"])
    .searchIndex("search_company", {
      searchField: "companyName",
      filterFields: ["stage"],
    }),

  questionnaires: defineTable({
    companyName: v.string(),
    websiteUrl: v.optional(v.string()),
    billingCurrency: v.string(),
    contactName: v.string(),
    contactPhone: v.string(),
    contactEmail: v.string(),
    address: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      postcode: v.string(),
      country: v.string(),
    }),
    dataEnrichmentConsent: v.boolean(),
    socialProfiles: v.optional(v.string()),
    countriesOfOperation: v.string(),
    yearsInBusiness: v.string(),
    annualRevenue: v.optional(v.string()),
    productsServices: v.string(),
    businessGoals: v.string(),
    challenges: v.string(),
    competitors: v.optional(v.string()),
    usp: v.string(),
    communicationChannels: v.array(v.string()),
    securityRequirements: v.optional(v.array(v.string())),
    privacyPolicyAgreed: v.boolean(),
    segments: v.array(v.string()),
    b2bData: v.optional(v.any()),
    b2gData: v.optional(v.any()),
    adamData: v.optional(v.any()),
    attachmentIds: v.optional(v.array(v.string())),
    userId: v.optional(v.id("users")),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("converted")
    ),
    sessionId: v.string(),
    submittedAt: v.optional(v.number()),
    convertedToClientId: v.optional(v.id("clients")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_sessionId", ["sessionId"])
    .index("by_email", ["contactEmail"]),

  contracts: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    content: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("viewed"),
      v.literal("changes_requested"),
      v.literal("client_signed"),
      v.literal("countersigned"),
      v.literal("final")
    ),
    version: v.number(),
    sections: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          content: v.string(),
        })
      )
    ),
    clientSignature: v.optional(v.string()),
    clientSignedAt: v.optional(v.number()),
    clientSignedBy: v.optional(v.id("users")),
    adminSignature: v.optional(v.string()),
    adminSignedAt: v.optional(v.number()),
    adminSignedBy: v.optional(v.id("users")),
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
    createdBy: v.id("users"),
    publishedAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
    finalizedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"])
    .index("by_createdBy", ["createdBy"]),

  contractVersions: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_contractId", ["contractId"])
    .index("by_contractId_version", ["contractId", "version"]),

  contractFiles: defineTable({
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
    uploadedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_contractId", ["contractId"])
    .index("by_contractId_category", ["contractId", "category"]),

  contractComments: defineTable({
    contractId: v.id("contracts"),
    sectionId: v.optional(v.string()),
    parentId: v.optional(v.id("contractComments")),
    content: v.string(),
    authorId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contractId", ["contractId"])
    .index("by_contractId_sectionId", ["contractId", "sectionId"])
    .index("by_parentId", ["parentId"]),

  activityLog: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_contractId", ["contractId"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),
});
