import type { Client, Contract, Invoice, ActivityLog } from "./supabase/types";

export type RiskSeverity = "critical" | "warning" | "info";
export type RiskType =
  | "INACTIVITY"
  | "OVERDUE_INVOICE"
  | "LOW_HEALTH"
  | "MISSING_KYC"
  | "STALLED_ONBOARDING"
  | "MISSING_STRATEGY"
  | "UNSIGNED_CONTRACT";

export interface ClientRisk {
  type: RiskType;
  severity: RiskSeverity;
  message: string;
}

export interface ClientRiskReport {
  clientId: string;
  clientName: string;
  clientRef: string | null;
  risks: ClientRisk[];
}

const SEVERITY: Record<RiskType, RiskSeverity> = {
  LOW_HEALTH:          "critical",
  OVERDUE_INVOICE:     "critical",
  MISSING_KYC:         "critical",
  INACTIVITY:          "warning",
  STALLED_ONBOARDING:  "warning",
  UNSIGNED_CONTRACT:   "warning",
  MISSING_STRATEGY:    "info",
};

const PROPOSAL_PLUS = ["proposal", "strategy", "contract", "invoice", "kickoff", "active"];

export function detectRisks(
  clients: Client[],
  contracts: Contract[],
  invoices: Invoice[],
  activities: ActivityLog[],
  kycStatuses: Record<string, string>
): ClientRiskReport[] {
  const now = Date.now();

  const latestActivity: Record<string, number> = {};
  for (const a of activities) {
    if (!a.client_id) continue;
    const t = new Date(a.created_at).getTime();
    if (!latestActivity[a.client_id] || t > latestActivity[a.client_id]) {
      latestActivity[a.client_id] = t;
    }
  }

  const overdueByClient: Record<string, Invoice[]> = {};
  for (const inv of invoices) {
    if (inv.status !== "overdue") continue;
    (overdueByClient[inv.client_id] ??= []).push(inv);
  }

  const contractsByClient: Record<string, Contract[]> = {};
  for (const c of contracts) {
    (contractsByClient[c.client_id] ??= []).push(c);
  }

  const results: ClientRiskReport[] = [];

  for (const client of clients) {
    if (client.archived) continue;
    const risks: ClientRisk[] = [];

    // INACTIVITY
    const lastActivity = latestActivity[client.id];
    if (lastActivity) {
      const days = (now - lastActivity) / 86_400_000;
      if (days >= 7) {
        risks.push({ type: "INACTIVITY", severity: SEVERITY.INACTIVITY, message: `Client inactive for ${Math.floor(days)} days` });
      }
    }

    // OVERDUE_INVOICE
    for (const inv of overdueByClient[client.id] ?? []) {
      risks.push({ type: "OVERDUE_INVOICE", severity: SEVERITY.OVERDUE_INVOICE, message: `Invoice overdue: ${inv.invoice_number}` });
    }

    // LOW_HEALTH
    if (client.health_score !== null && client.health_score < 40) {
      risks.push({ type: "LOW_HEALTH", severity: SEVERITY.LOW_HEALTH, message: `Critical health score: ${client.health_score}/100` });
    }

    // MISSING_KYC
    const hasContractInProgress = (contractsByClient[client.id] ?? []).some(
      (c) => c.status === "draft" || c.status === "published"
    );
    if (hasContractInProgress && kycStatuses[client.id] !== "verified") {
      risks.push({ type: "MISSING_KYC", severity: SEVERITY.MISSING_KYC, message: "KYC not verified — contract blocked" });
    }

    // STALLED_ONBOARDING
    if (client.stage === "questionnaire") {
      const days = (now - new Date(client.created_at).getTime()) / 86_400_000;
      if (days >= 14) {
        risks.push({ type: "STALLED_ONBOARDING", severity: SEVERITY.STALLED_ONBOARDING, message: `Onboarding stalled for ${Math.floor(days)} days` });
      }
    }

    // MISSING_STRATEGY
    if (PROPOSAL_PLUS.includes(client.stage) && !client.strategy_notes?.trim()) {
      risks.push({ type: "MISSING_STRATEGY", severity: SEVERITY.MISSING_STRATEGY, message: "No strategy document" });
    }

    // UNSIGNED_CONTRACT
    for (const c of contractsByClient[client.id] ?? []) {
      if (c.status === "published" && c.published_at) {
        const days = (now - new Date(c.published_at).getTime()) / 86_400_000;
        if (days >= 7) {
          risks.push({ type: "UNSIGNED_CONTRACT", severity: SEVERITY.UNSIGNED_CONTRACT, message: `Contract unsigned for ${Math.floor(days)} days` });
        }
      }
    }

    if (risks.length > 0) {
      results.push({ clientId: client.id, clientName: client.company_name, clientRef: client.client_ref, risks });
    }
  }

  return results;
}
