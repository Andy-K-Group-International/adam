"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listClients } from "@/lib/supabase/queries/clients";
import { listAllContracts } from "@/lib/supabase/queries/contracts";
import { listQuestionnaires } from "@/lib/supabase/queries/questionnaires";
import { listAll as listAllActivities } from "@/lib/supabase/queries/activity-log";
import { listPendingClientRequests } from "@/lib/supabase/queries/client-requests";
import type { Client, Contract, Questionnaire, ActivityLog, ClientRequest } from "@/lib/supabase/types";
import StatsCards from "@/components/admin/StatsCards";
import ActionItems from "@/components/admin/ActionItems";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import HealthScoreBadge from "@/components/admin/HealthScoreBadge";
import ContextualHelp from "@/components/ui/ContextualHelp";
import Link from "next/link";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  type ClientWithHealth = Client & { primary_contact: { name: string; email: string } | null };
  const [clients, setClients] = useState<ClientWithHealth[] | undefined>(undefined);
  const [contracts, setContracts] = useState<Contract[] | undefined>(undefined);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[] | undefined>(undefined);
  const [activities, setActivities] = useState<ActivityLog[] | undefined>(undefined);
  const [pendingRequests, setPendingRequests] = useState<ClientRequest[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [clientsData, contractsData, questionnairesData, activitiesData, pendingRequestsData] =
        await Promise.all([
          listClients(supabase).catch(() => []),
          listAllContracts(supabase).catch(() => []),
          listQuestionnaires(supabase, { status: "submitted" }).catch(() => []),
          listAllActivities(supabase, 15).catch(() => []),
          listPendingClientRequests(supabase).catch(() => []),
        ]);

      setClients(clientsData);
      setContracts(contractsData);
      setQuestionnaires(questionnairesData);
      setActivities(activitiesData);
      setPendingRequests(pendingRequestsData);
    }

    fetchData();
  }, []);

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

  return (
    <div>
      <div className="mb-8">
        <p className="label-mono mb-2">Andy'K Group International LTD — A.D.A.M.</p>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif font-semibold text-foreground">Admin Dashboard</h1>
          <ContextualHelp
            id="admin-dashboard"
            title="Admin Dashboard"
            description="This is your operational command center. Monitor active clients, pending actions, and implementation progress."
            position="right"
          />
        </div>
        <p className="text-muted text-sm mt-1">Overview of all operations.</p>
      </div>

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
    </div>
  );
}
