"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getContractsForClient } from "@/lib/supabase/queries/contracts";
import { getActivityLogForCurrentClient } from "@/lib/supabase/queries/activityLog";
import StatusCards from "@/components/dashboard/StatusCards";
import ContractCard from "@/components/dashboard/ContractCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function DashboardPage() {
  const [contracts, setContracts] = useState<any[] | undefined>(undefined);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [contractsData, activitiesData] = await Promise.all([
        getContractsForClient(supabase),
        getActivityLogForCurrentClient(supabase, { limit: 10 }),
      ]);
      setContracts(contractsData);
      setActivities(activitiesData);
    }

    fetchData();
  }, []);

  if (contracts === undefined) {
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted mt-1">Welcome back. Here&apos;s your overview.</p>
      </div>

      <StatusCards
        totalContracts={(contracts || []).length}
        pendingActions={pendingActions}
        completed={completed}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your Contracts
          </h2>
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
