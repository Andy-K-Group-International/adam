"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import StatsCards from "@/components/admin/StatsCards";
import ActionItems from "@/components/admin/ActionItems";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminDashboardPage() {
  const clients = useQuery(api.clients.list, {});
  const contracts = useQuery(api.contracts.listAll, {});
  const questionnaires = useQuery(api.questionnaires.list, { status: "submitted" });
  const activities = useQuery(api.activityLog.listAll, { limit: 15 });

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
        id: `cs-${c._id}`,
        type: "unsigned_contract",
        title: c.title,
        description: "Client has signed. Awaiting your countersignature.",
        href: `/admin/contracts/${c._id}`,
        priority: "high",
      });
    });

  // Change requests
  (contracts || [])
    .filter((c) => c.status === "changes_requested")
    .forEach((c) => {
      actionItems.push({
        id: `cr-${c._id}`,
        type: "change_request",
        title: c.title,
        description: "Client has requested changes to this contract.",
        href: `/admin/contracts/${c._id}`,
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
        id: `ap-${c._id}`,
        type: "unverified_appendix",
        title: c.title,
        description: "Uploaded appendix needs verification.",
        href: `/admin/contracts/${c._id}`,
        priority: "medium",
      });
    });

  // New questionnaires
  (questionnaires || []).forEach((q) => {
    actionItems.push({
      id: `q-${q._id}`,
      type: "new_questionnaire",
      title: q.companyName,
      description: `Submitted by ${q.contactName} (${q.contactEmail})`,
      href: `/admin/questionnaires/${q._id}`,
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
