"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listClients } from "@/lib/supabase/queries/clients";
import { listAllContracts } from "@/lib/supabase/queries/contracts";
import { listQuestionnaires } from "@/lib/supabase/queries/questionnaires";
import { listAll as listAllActivities } from "@/lib/supabase/queries/activity-log";
import { listPendingClientRequests } from "@/lib/supabase/queries/client-requests";
import { listAllInvoices } from "@/lib/supabase/queries/invoices";
import { listKycForClients } from "@/lib/supabase/queries/kyc";
import { listLeads } from "@/lib/supabase/queries/leads";
import { listProposals } from "@/lib/supabase/queries/proposals";
import { detectRisks } from "@/lib/risk-detection";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Client, Contract, Questionnaire, ActivityLog, ClientRequest, Invoice, Lead, Proposal } from "@/lib/supabase/types";
import type { ClientRiskReport } from "@/lib/risk-detection";
import StatsCards from "@/components/admin/StatsCards";
import ActionItems from "@/components/admin/ActionItems";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import HealthScoreBadge from "@/components/admin/HealthScoreBadge";
import ContextualHelp from "@/components/ui/ContextualHelp";
import Link from "next/link";
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronRight, X, Send, Users, CheckCircle2, Circle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Risks widget ────────────────────────────────────────────────────────────

const RISK_DISMISS_KEY = (clientId: string, riskType: string) =>
  `adam_risk_dismissed_${clientId}_${riskType}_${new Date().toISOString().slice(0, 10)}`;

const severityConfig = {
  critical: { label: "Critical", icon: AlertCircle, cls: "bg-error/10 text-error border-error/20" },
  warning:  { label: "Warning",  icon: AlertTriangle, cls: "bg-warning/10 text-warning border-warning/20" },
  info:     { label: "Info",     icon: Info,          cls: "bg-info/10 text-info border-info/20" },
};

function RisksWidget({ risks }: { risks: ClientRiskReport[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const keys = new Set<string>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("adam_risk_dismissed_")) keys.add(k);
      }
    } catch {}
    setDismissed(keys);
  }, []);

  const dismiss = (clientId: string, riskType: string) => {
    const key = RISK_DISMISS_KEY(clientId, riskType);
    try { localStorage.setItem(key, "1"); } catch {}
    setDismissed((prev) => new Set([...prev, key]));
  };

  const visibleReports = risks
    .map((report) => ({
      ...report,
      risks: report.risks.filter((r) => !dismissed.has(RISK_DISMISS_KEY(report.clientId, r.type))),
    }))
    .filter((r) => r.risks.length > 0);

  if (visibleReports.length === 0) return null;

  const totalRisks = visibleReports.reduce((sum, r) => sum + r.risks.length, 0);
  const criticalCount = visibleReports.reduce(
    (sum, r) => sum + r.risks.filter((x) => x.severity === "critical").length,
    0
  );

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-semibold text-foreground">Implementation Risks</h2>
        <span className="text-xs font-mono text-muted-2">{totalRisks} risk{totalRisks !== 1 ? "s" : ""} across {visibleReports.length} client{visibleReports.length !== 1 ? "s" : ""}</span>
        {criticalCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-error bg-error/10 px-2 py-0.5 rounded-full">
            <AlertCircle className="h-3 w-3" />
            {criticalCount} critical
          </span>
        )}
      </div>
      <div className="space-y-2">
        {visibleReports.map((report) => {
          const isOpen = expanded[report.clientId] ?? true;
          const hasCritical = report.risks.some((r) => r.severity === "critical");
          return (
            <div key={report.clientId} className="bg-white rounded-xl border border-grid-300 overflow-hidden">
              <button
                onClick={() => setExpanded((prev) => ({ ...prev, [report.clientId]: !isOpen }))}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-grid-300/20 transition-colors text-left"
              >
                {isOpen ? <ChevronDown className="h-4 w-4 text-muted-2 shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-2 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{report.clientName}</span>
                  {report.clientRef && (
                    <span className="ml-2 font-mono text-xs text-highlight">{report.clientRef}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {hasCritical && <span className="h-2 w-2 rounded-full bg-error" />}
                  <span className="text-xs text-muted-2">{report.risks.length} risk{report.risks.length !== 1 ? "s" : ""}</span>
                  <Link
                    href={`/admin/clients/${report.clientId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-highlight hover:underline"
                  >
                    View Client
                  </Link>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-grid-300 divide-y divide-grid-300">
                  {report.risks.map((risk) => {
                    const cfg = severityConfig[risk.severity];
                    const Icon = cfg.icon;
                    return (
                      <div key={risk.type} className="flex items-center gap-3 px-5 py-3">
                        <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border shrink-0", cfg.cls)}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                        <p className="flex-1 text-sm text-foreground">{risk.message}</p>
                        <button
                          onClick={() => dismiss(report.clientId, risk.type)}
                          title="Dismiss for today"
                          className="text-muted-2 hover:text-foreground transition-colors shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── At Risk widget ───────────────────────────────────────────────────────────

type ClientWithHealth = Client & { primary_contact: { name: string; email: string } | null };

const stageLabels: Record<string, string> = {
  questionnaire: "Questionnaire",
  proposal: "Proposal",
  strategy: "Strategy",
  contract: "Contract",
  invoice: "Invoice",
  kickoff: "Kick-off",
};

function AtRiskWidget({ clients }: { clients: ClientWithHealth[] }) {
  const atRisk = clients
    .filter((c) => c.health_score !== null && c.health_score < 60)
    .sort((a, b) => (a.health_score ?? 0) - (b.health_score ?? 0));

  if (atRisk.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-semibold text-foreground">At Risk Clients</h2>
        <span className="text-xs font-mono font-normal text-muted-2">health score &lt; 60</span>
        <ContextualHelp
          id="admin-health-score"
          title="Health Score"
          description="Health Score measures operational engagement and implementation stability across all active clients."
          position="right"
        />
      </div>
      <div className="bg-white rounded-xl border border-grid-300 divide-y divide-grid-300 overflow-hidden">
        {atRisk.map((client) => (
          <Link
            key={client.id}
            href={`/admin/clients/${client.id}`}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-grid-300/20 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-highlight transition-colors">
                {client.company_name}
              </p>
              <p className="text-xs text-muted-2">
                {stageLabels[client.stage] ?? client.stage}
                {client.primary_contact && (
                  <> &middot; {client.primary_contact.name}</>
                )}
              </p>
            </div>
            <HealthScoreBadge score={client.health_score ?? null} showBar size="sm" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Launch Applicants widget ─────────────────────────────────────────────────

const applicantStatusLabel: Record<string, string> = {
  new:       "Applied",
  contacted: "Reviewed",
  qualified: "Approved",
  rejected:  "Rejected",
  converted: "Converted",
};

const applicantStatusCls: Record<string, string> = {
  new:       "bg-info/10 text-info border-info/20",
  contacted: "bg-warning/10 text-warning border-warning/20",
  qualified: "bg-success/10 text-success border-success/20",
  rejected:  "bg-error/10 text-error border-error/20",
  converted: "bg-highlight/10 text-highlight border-highlight/20",
};

function LaunchApplicantsWidget({ leads }: { leads: Lead[] }) {
  const [sending, setSending] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [localLeads, setLocalLeads] = useState<Lead[]>(leads);

  const active = localLeads.filter((l) => l.status !== "rejected" && l.status !== "converted");

  async function updateStatus(leadId: string, status: string) {
    const supabase = createClient();
    await supabase.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", leadId);
    setLocalLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: status as Lead["status"] } : l));
  }

  async function sendInvite(lead: Lead) {
    setSending(lead.id);
    setResults((prev) => ({ ...prev, [lead.id]: "" }));
    try {
      const res = await fetch("/api/admin/launch-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          email: lead.email,
          name: lead.name,
          company: lead.company,
          plan: (lead.metadata as Record<string, unknown> | null)?.plan as string ?? null,
        }),
      });
      if (res.ok) {
        setResults((prev) => ({ ...prev, [lead.id]: "sent" }));
        setLocalLeads((prev) =>
          prev.map((l) => l.id === lead.id ? { ...l, launch_invite_sent: true, status: "qualified" as Lead["status"] } : l)
        );
      } else {
        const data = await res.json().catch(() => ({}));
        setResults((prev) => ({ ...prev, [lead.id]: data.error ?? "Failed" }));
      }
    } catch {
      setResults((prev) => ({ ...prev, [lead.id]: "Network error" }));
    }
    setSending(null);
  }

  if (active.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-highlight" />
        <h2 className="text-base font-semibold text-foreground">Launch Applicants</h2>
        <span className="text-xs font-mono text-muted-2">{active.length} applicant{active.length !== 1 ? "s" : ""}</span>
        <span className="text-xs font-mono text-highlight bg-highlight/5 px-2 py-0.5 rounded border border-highlight/20">
          Launch: 15 July 2026
        </span>
      </div>
      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-100">
                <th className="px-4 py-2.5 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Name / Company</th>
                <th className="px-4 py-2.5 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2.5 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Applied</th>
                <th className="px-4 py-2.5 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-mono text-muted-2 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grid-300">
              {active.map((lead) => {
                const result = results[lead.id];
                const isSending = sending === lead.id;
                const alreadySent = lead.launch_invite_sent;
                return (
                  <tr key={lead.id} className="hover:bg-grid-100/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      {lead.company && <p className="text-xs text-muted-2">{lead.company}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${lead.email}`} className="text-highlight hover:underline text-xs font-mono">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-2 font-mono">
                      {new Date(lead.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("inline-flex text-xs font-semibold px-2 py-0.5 rounded border", applicantStatusCls[lead.status] ?? "bg-grid-100 text-muted border-grid-300")}>
                          {applicantStatusLabel[lead.status] ?? lead.status}
                        </span>
                        {alreadySent && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-highlight bg-highlight/5 px-2 py-0.5 rounded border border-highlight/20">
                            <Send className="h-3 w-3" /> Invite sent
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {lead.status === "new" && (
                          <button
                            onClick={() => updateStatus(lead.id, "contacted")}
                            className="text-xs px-2.5 py-1 border border-grid-500 text-muted hover:text-foreground hover:border-foreground transition-colors"
                          >
                            Mark Reviewed
                          </button>
                        )}
                        {lead.status === "contacted" && (
                          <button
                            onClick={() => updateStatus(lead.id, "qualified")}
                            className="text-xs px-2.5 py-1 border border-success/30 text-success hover:bg-success/5 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {lead.status === "qualified" && !alreadySent && (
                          <button
                            onClick={() => sendInvite(lead)}
                            disabled={isSending}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-highlight text-white hover:bg-highlight/90 disabled:opacity-50 transition-colors font-medium"
                          >
                            <Send className="h-3 w-3" />
                            {isSending ? "Sending…" : "Send Launch Invitation"}
                          </button>
                        )}
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="text-xs text-highlight hover:underline"
                        >
                          View
                        </Link>
                        {result && result !== "sent" && (
                          <span className="text-xs text-error font-mono">{result}</span>
                        )}
                        {result === "sent" && (
                          <span className="text-xs text-success font-mono">✓ Sent</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Onboarding checklist (company_admin first login) ────────────────────────

const ONBOARDING_DISMISS_KEY = (authId: string) => `adam_onboarding_done_${authId}`;

function OnboardingChecklist({
  authId,
  companyName,
  proposals,
  contracts,
}: {
  authId: string;
  companyName: string;
  proposals: Proposal[];
  contracts: Contract[];
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(!!localStorage.getItem(ONBOARDING_DISMISS_KEY(authId)));
    } catch {}
  }, [authId]);

  if (dismissed) return null;

  const hasProposal = proposals.length > 0;
  const hasSentContract = contracts.some(
    (c) => c.status !== "draft"
  );
  const allDone = hasProposal && hasSentContract;

  function dismiss() {
    try {
      localStorage.setItem(ONBOARDING_DISMISS_KEY(authId), "1");
    } catch {}
    setDismissed(true);
  }

  const items: { label: string; done: boolean; href: string; cta: string }[] = [
    {
      label: "Account activated",
      done: true,
      href: "/admin",
      cta: "You're here",
    },
    {
      label: "Review your proposal",
      done: hasProposal,
      href: "/admin/proposals",
      cta: "View proposals →",
    },
    {
      label: "Review and sign your contract",
      done: hasSentContract,
      href: "/admin/contracts",
      cta: "View contracts →",
    },
  ];

  return (
    <div className="mb-8 bg-white rounded-xl border border-highlight/30 overflow-hidden">
      <div className="flex items-start justify-between px-5 py-4 border-b border-grid-300 bg-highlight/5">
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-highlight shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Welcome to A.D.A.M.{companyName ? ` — ${companyName}` : ""}
            </p>
            <p className="text-xs text-muted mt-0.5">
              Complete these steps to finish setting up your workspace.
            </p>
          </div>
        </div>
        <button
          onClick={dismiss}
          title="Dismiss"
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-grid-100 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="divide-y divide-grid-300">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-4 px-5 py-3.5">
            <div className="shrink-0">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Circle className="h-4 w-4 text-muted-2" />
              )}
            </div>
            <p className={cn("flex-1 text-sm", item.done ? "text-muted-2 line-through" : "text-foreground")}>
              {item.label}
            </p>
            {!item.done && (
              <Link
                href={item.href}
                className="text-xs text-highlight hover:underline font-medium shrink-0"
              >
                {item.cta}
              </Link>
            )}
            {item.done && (
              <span className="text-xs text-success font-mono shrink-0">Done</span>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-grid-300 bg-grid-100/50 flex items-center justify-between">
        <p className="text-xs text-muted">
          {allDone
            ? "All steps complete. You're all set."
            : `${items.filter((i) => i.done).length} of ${items.length} steps complete`}
        </p>
        <button
          onClick={dismiss}
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          {allDone ? "Dismiss checklist" : "Skip for now"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  type ClientWithHealth = Client & { primary_contact: { name: string; email: string } | null };
  const { user, isCompanyAdmin, isLoading: userLoading } = useCurrentUser();

  const [clients, setClients] = useState<ClientWithHealth[] | undefined>(undefined);
  const [contracts, setContracts] = useState<Contract[] | undefined>(undefined);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[] | undefined>(undefined);
  const [activities, setActivities] = useState<ActivityLog[] | undefined>(undefined);
  const [pendingRequests, setPendingRequests] = useState<ClientRequest[]>([]);
  const [risks, setRisks] = useState<ClientRiskReport[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (userLoading) return;

    const supabase = createClient();
    const userId = isCompanyAdmin ? user?.auth_id : undefined;

    async function fetchData() {
      // Step 1: fetch clients + other data in parallel (clients needed first for clientIds scoping)
      const [clientsData, contractsData, questionnairesData, invoicesData, leadsData, proposalsData] =
        await Promise.all([
          listClients(supabase, { userId }).catch(() => []),
          listAllContracts(supabase, { userId }).catch(() => []),
          isCompanyAdmin ? Promise.resolve([] as Questionnaire[]) : listQuestionnaires(supabase, { status: "submitted" }).catch(() => [] as Questionnaire[]),
          listAllInvoices(supabase, { userId }).catch(() => []),
          isCompanyAdmin ? Promise.resolve([] as Lead[]) : listLeads(supabase).catch(() => [] as Lead[]),
          isCompanyAdmin && userId ? listProposals(supabase, { userId }).catch(() => [] as Proposal[]) : Promise.resolve([] as Proposal[]),
        ]);

      const clientIds = clientsData.map((c) => c.id);

      // Step 2: fetch activity, requests, and kyc scoped by clientIds
      const [activitiesData, pendingRequestsData, kycRows] = await Promise.all([
        listAllActivities(supabase, 100, isCompanyAdmin ? clientIds : undefined).catch(() => []),
        listPendingClientRequests(supabase, isCompanyAdmin ? clientIds : undefined).catch(() => []),
        clientIds.length > 0 ? listKycForClients(supabase, clientIds).catch(() => []) : Promise.resolve([]),
      ]);

      setClients(clientsData);
      setContracts(contractsData);
      setQuestionnaires(questionnairesData);
      setActivities(activitiesData);
      setPendingRequests(pendingRequestsData);
      setLeads(leadsData);
      setProposals(proposalsData);

      const kycMap: Record<string, string> = {};
      for (const row of kycRows) kycMap[row.client_id] = row.status;

      setRisks(detectRisks(clientsData, contractsData, invoicesData, activitiesData, kycMap));
    }

    fetchData();
  }, [userLoading, isCompanyAdmin, user?.auth_id]);

  if (clients === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const totalClients = (clients || []).length;
  const activeContracts = (contracts || []).filter(
    (c) => c.status !== "draft" && c.status !== "final"
  ).length;

  // Build action items from real data
  const actionItems: {
    id: string;
    type: "unsigned_contract" | "unverified_appendix" | "change_request" | "new_questionnaire" | "client_request";
    title: string;
    description: string;
    href: string;
    priority: "high" | "medium" | "low";
  }[] = [];

  // Contracts awaiting countersign
  (contracts || [])
    .filter((c) => c.status === "client_signed")
    .forEach((c) => {
      actionItems.push({
        id: `cs-${c.id}`,
        type: "unsigned_contract",
        title: c.title,
        description: "Client has signed. Awaiting your countersignature.",
        href: `/admin/contracts/${c.id}`,
        priority: "high",
      });
    });

  // Change requests
  (contracts || [])
    .filter((c) => c.status === "changes_requested")
    .forEach((c) => {
      actionItems.push({
        id: `cr-${c.id}`,
        type: "change_request",
        title: c.title,
        description: "Client has requested changes to this contract.",
        href: `/admin/contracts/${c.id}`,
        priority: "high",
      });
    });

  // Unverified appendices
  (contracts || [])
    .filter((c) =>
      c.appendices?.some((a) => a.status === "uploaded")
    )
    .forEach((c) => {
      actionItems.push({
        id: `ap-${c.id}`,
        type: "unverified_appendix",
        title: c.title,
        description: "Uploaded appendix needs verification.",
        href: `/admin/contracts/${c.id}`,
        priority: "medium",
      });
    });

  // New questionnaires
  (questionnaires || []).forEach((q) => {
    actionItems.push({
      id: `q-${q.id}`,
      type: "new_questionnaire",
      title: q.company_name,
      description: `Submitted by ${q.contact_name} (${q.contact_email})`,
      href: `/admin/questionnaires/${q.id}`,
      priority: "medium",
    });
  });

  // Pending client requests — urgent/high appear as high priority
  pendingRequests.forEach((r) => {
    const docLabel = r.document_type.charAt(0).toUpperCase() + r.document_type.slice(1);
    const company = r.client?.company_name ?? "Client";
    actionItems.push({
      id: `req-${r.id}`,
      type: "client_request",
      title: `${company} — ${docLabel}`,
      description: r.content.slice(0, 80) + (r.content.length > 80 ? "…" : ""),
      href: `/admin/${r.document_type}s/${r.document_id}`,
      priority: r.priority === "urgent" || r.priority === "high" ? "high" : r.priority === "medium" ? "medium" : "low",
    });
  });

  const companyLabel = isCompanyAdmin
    ? (clients?.[0]?.company_name ?? "Your Company")
    : "Andy'K Group International LTD — A.D.A.M.";

  return (
    <div>
      <div className="mb-8">
        <p className="label-mono mb-2">{companyLabel}</p>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            {isCompanyAdmin ? "Dashboard" : "Admin Dashboard"}
          </h1>
          <ContextualHelp
            id="admin-dashboard"
            title="Admin Dashboard"
            description="This is your operational command center. Monitor active clients, pending actions, and implementation progress."
            position="right"
          />
        </div>
        <p className="text-muted text-sm mt-1">
          {isCompanyAdmin ? "Overview of your client operations." : "Overview of all operations."}
        </p>
      </div>

      {isCompanyAdmin && user?.auth_id && (
        <OnboardingChecklist
          authId={user.auth_id}
          companyName={clients?.[0]?.company_name ?? ""}
          proposals={proposals}
          contracts={contracts ?? []}
        />
      )}

      <StatsCards
        totalClients={totalClients}
        activeContracts={activeContracts}
        pendingActions={actionItems.length}
        newQuestionnaires={(questionnaires || []).length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-foreground">Action Items</h2>
            <ContextualHelp
              id="admin-action-items"
              title="Action Items"
              description="Action items require your immediate attention. These are implementation blockers or client requests that need a response."
              position="right"
            />
          </div>
          <ActionItems items={actionItems} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl border border-grid-300 p-4">
            <ActivityFeed activities={activities || []} />
          </div>
        </div>
      </div>

      {/* At Risk clients */}
      <AtRiskWidget clients={clients || []} />

      {/* Implementation Risks */}
      <RisksWidget risks={risks} />

      {/* Launch Applicants — admin only */}
      {!isCompanyAdmin && <LaunchApplicantsWidget leads={leads} />}
    </div>
  );
}
