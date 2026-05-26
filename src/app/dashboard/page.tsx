"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listContractsForClient } from "@/lib/supabase/queries/contracts";
import { listForCurrentClient } from "@/lib/supabase/queries/activity-log";
import StatusCards from "@/components/dashboard/StatusCards";
import ContractCard from "@/components/dashboard/ContractCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ContextualHelp from "@/components/ui/ContextualHelp";
import WelcomePopover from "@/components/dashboard/WelcomePopover";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function DashboardPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [contracts, setContracts] = useState<any[] | undefined>(undefined);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.client_id) return;
    const supabase = createClient();

    async function fetchData() {
      const [contractsData, activitiesData] = await Promise.all([
        listContractsForClient(supabase, user!.client_id!),
        listForCurrentClient(supabase, user!.client_id!, 10),
      ]);
      setContracts(contractsData);
      setActivities(activitiesData);
    }

    fetchData();
  }, [user]);

  if (userLoading || contracts === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const pendingActions = (contracts || []).filter(
    (c) =>
      c.status === "published" ||
      c.status === "viewed" ||
      c.status === "changes_requested"
  ).length;

  const completed = (contracts || []).filter(
    (c) => c.status === "final"
  ).length;

  return (
    <div>
      <WelcomePopover />
      <div className="mb-8">
        <p className="label-mono mb-2">A.D.A.M. Client Portal</p>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif font-semibold text-foreground">Your Dashboard</h1>
          <ContextualHelp
            id="client-dashboard"
            title="Your Dashboard"
            description="Welcome to your A.D.A.M. client portal. Here you can track your onboarding progress and access your documents."
            position="right"
          />
        </div>
        <p className="text-muted text-sm mt-1">Welcome back. Here&apos;s your overview.</p>
      </div>

      <StatusCards
        totalContracts={(contracts || []).length}
        pendingActions={pendingActions}
        completed={completed}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-foreground">Your Contracts</h2>
            <ContextualHelp
              id="client-contracts"
              title="Contracts"
              description="Your contract formalises the agreed terms. Please read all sections before signing."
              position="right"
            />
          </div>
          {(contracts || []).length === 0 ? (
            <div className="bg-white rounded-xl border border-grid-300 p-8 text-center">
              <p className="text-muted-2">No contracts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(contracts || []).map((contract) => (
                <ContractCard
                  key={contract.id}
                  id={contract.id}
                  title={contract.title}
                  status={contract.status}
                  stage="contract"
                  updatedAt={contract.updated_at}
                />
              ))}
            </div>
          )}
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
    </div>
  );
}
