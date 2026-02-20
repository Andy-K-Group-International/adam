"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getContractsForClient } from "@/lib/supabase/queries/contracts";
import ContractCard from "@/components/dashboard/ContractCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const data = await getContractsForClient(supabase);
      setContracts(data);
    }

    fetchData();
  }, []);

  if (contracts === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
        <p className="text-muted mt-1">View and manage your contracts.</p>
      </div>

      {(contracts || []).length === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 p-12 text-center">
          <p className="text-muted-2">No contracts yet</p>
          <p className="text-sm text-muted-2 mt-1">
            Contracts will appear here once they are created for you.
          </p>
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
  );
}
