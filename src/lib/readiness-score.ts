// Implementation Readiness Score — measures how prepared a client is for implementation.
// This is NOT sales scoring. It reflects documentation, responsiveness, maturity, and cooperation.

export interface ReadinessInput {
  // Documentation
  hasQuestionnaire: boolean;
  kycVerified: boolean;
  hasDocumentUploaded: boolean;
  // Responsiveness
  respondedToProposalWithin48h: boolean | null;
  respondedToContractWithin48h: boolean | null;
  hasPendingRequestsOlderThan7Days: boolean;
  // Operational maturity
  hasWebsite: boolean;
  companySize11Plus: boolean;
  revenueAbove250k: boolean;
  // Cooperation
  contactCount: number;
  primaryContactHasPhone: boolean;
  hasStrategyType: boolean;
}

export interface ReadinessBreakdown {
  documentation: {
    score: number;
    max: number;
    questionnaire: number;
    kyc: number;
    document: number;
  };
  responsiveness: {
    score: number;
    max: number;
    proposalResponse: number;
    contractResponse: number;
    noPendingRequests: number;
  };
  maturity: {
    score: number;
    max: number;
    website: number;
    companySize: number;
    revenue: number;
  };
  cooperation: {
    score: number;
    max: number;
    contacts: number;
    primaryPhone: number;
    strategyType: number;
  };
}

export interface ReadinessResult {
  score: number;
  breakdown: ReadinessBreakdown;
  tier: ReadinessTier;
}

export type ReadinessTier = "Implementation Ready" | "Preparing" | "Early Stage" | "Not Ready";

export function readinessTier(score: number): ReadinessTier {
  if (score >= 80) return "Implementation Ready";
  if (score >= 60) return "Preparing";
  if (score >= 40) return "Early Stage";
  return "Not Ready";
}

export function readinessTierStyle(tier: ReadinessTier): { badge: string; bar: string; dot: string } {
  switch (tier) {
    case "Implementation Ready":
      return { badge: "bg-success/10 text-success border-success/20",   bar: "bg-success",    dot: "bg-success" };
    case "Preparing":
      return { badge: "bg-warning/10 text-warning border-warning/20",   bar: "bg-warning",    dot: "bg-warning" };
    case "Early Stage":
      return { badge: "bg-orange-50 text-orange-600 border-orange-200", bar: "bg-orange-400", dot: "bg-orange-400" };
    case "Not Ready":
      return { badge: "bg-error/10 text-error border-error/20",         bar: "bg-error",      dot: "bg-error" };
  }
}

export function calculateReadiness(input: ReadinessInput): ReadinessResult {
  // Documentation (25 pts)
  const docQuestionnaire = input.hasQuestionnaire ? 10 : 0;
  const docKyc           = input.kycVerified ? 10 : 0;
  const docDocument      = input.hasDocumentUploaded ? 5 : 0;
  const docScore         = docQuestionnaire + docKyc + docDocument;

  // Responsiveness (25 pts)
  const respProposal      = input.respondedToProposalWithin48h === true ? 10 : 0;
  const respContract      = input.respondedToContractWithin48h === true ? 10 : 0;
  const respNoPending     = input.hasPendingRequestsOlderThan7Days ? 0 : 5;
  const respScore         = respProposal + respContract + respNoPending;

  // Operational maturity (25 pts)
  const matWebsite        = input.hasWebsite ? 5 : 0;
  const matSize           = input.companySize11Plus ? 10 : 0;
  const matRevenue        = input.revenueAbove250k ? 10 : 0;
  const matScore          = matWebsite + matSize + matRevenue;

  // Cooperation (25 pts)
  const coopContacts      = input.contactCount >= 2 ? 10 : 0;
  const coopPhone         = input.primaryContactHasPhone ? 5 : 0;
  const coopStrategy      = input.hasStrategyType ? 10 : 0;
  const coopScore         = coopContacts + coopPhone + coopStrategy;

  const total = Math.min(100, docScore + respScore + matScore + coopScore);

  return {
    score: total,
    tier: readinessTier(total),
    breakdown: {
      documentation: {
        score: docScore, max: 25,
        questionnaire: docQuestionnaire, kyc: docKyc, document: docDocument,
      },
      responsiveness: {
        score: respScore, max: 25,
        proposalResponse: respProposal, contractResponse: respContract, noPendingRequests: respNoPending,
      },
      maturity: {
        score: matScore, max: 25,
        website: matWebsite, companySize: matSize, revenue: matRevenue,
      },
      cooperation: {
        score: coopScore, max: 25,
        contacts: coopContacts, primaryPhone: coopPhone, strategyType: coopStrategy,
      },
    },
  };
}

// Revenue string parser — handles "£250,000", "250k", "£1m", etc.
export function parseRevenue(raw: string | null | undefined): number {
  if (!raw) return 0;
  const lower = raw.toLowerCase().replace(/[£$€,\s]/g, "");
  const num = parseFloat(lower);
  if (isNaN(num)) return 0;
  if (lower.includes("m")) return num * 1_000_000;
  if (lower.includes("k")) return num * 1_000;
  return num;
}

// Company size string parser — handles "11-50", "200+", etc.
export function parseCompanySize11Plus(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const match = raw.match(/\d+/);
  if (!match) return false;
  return parseInt(match[0], 10) >= 11;
}
