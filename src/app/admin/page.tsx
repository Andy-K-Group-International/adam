"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listClients } from "@/lib/supabase/queries/clients";
import { listAllContracts } from "@/lib/supabase/queries/contracts";
import { listQuestionnaires } from "@/lib/supabase/queries/questionnaires";
import { listAll as listAllActivities } from "@/lib/supabase/queries/activity-log";
import type { Client, Contract, Questionnaire, ActivityLog } from "@/lib/supabase/types";
import StatsCards from "@/components/admin/StatsCards";
import ActionItems from "@/components/admin/ActionItems";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminDashboardPage() {
  const [clients, setClients] = useState<Client[] | undefined>(undefined);
  const [contracts, setContracts] = useState<Contract[] | undefined>(undefined);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[] | undefined>(undefined);
  const [activities, setActivities] = useState<ActivityLog[] | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [clientsData, contractsData, questionnairesData, activitiesData] =
        await Promise.all([
          listClients(supabase).catch(() => []),
          listAllContracts(supabase).catch(() => []),
          listQuestionnaires(supabase, { status: "submitted" }).catch(() => []),
          listAllActivities(supabase, 15).catch(() => []),
        ]);

      setClients(clientsData);
      setContracts(contractsData);
      setQuestionnaires(questionnairesData);
      setActivities(activitiesData);
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
    type: "unsigned_contract" | "unverified_appendix" | "change_request" | "new_questionnaire";
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted mt-1">Overview of all operations.</p>
      </div>

      <StatsCards
        totalClients={totalClients}
        activeContracts={activeContracts}
        pendingActions={actionItems.length}
        newQuestionnaires={(questionnaires || []).length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Action Items
          </h2>
          <ActionItems items={actionItems} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl border border-grid-300 p-4">
            <ActivityFeed activities={activities || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
