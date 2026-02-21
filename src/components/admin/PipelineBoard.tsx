"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listClients } from "@/lib/supabase/queries/clients";
import ClientCard from "./ClientCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const stages = [
  { key: "questionnaire", label: "Questionnaire", color: "bg-grid-500" },
  { key: "proposal", label: "Proposal", color: "bg-info" },
  { key: "strategy", label: "Strategy", color: "bg-highlight" },
  { key: "contract", label: "Contract", color: "bg-warning" },
  { key: "invoice", label: "Invoice", color: "bg-success" },
  { key: "kickoff", label: "Kick-off", color: "bg-success" },
] as const;

export default function PipelineBoard() {
  const [clients, setClients] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const data = await listClients(supabase);
      setClients(data);
    }

    fetchData();
  }, []);

  if (clients === undefined) {
    return <LoadingSpinner className="min-h-[40vh]" />;
  }

  const grouped = stages.map((stage) => ({
    ...stage,
    clients: (clients || []).filter((c) => c.stage === stage.key),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {grouped.map((column) => (
        <div key={column.key} className="min-w-0">
          {/* Column Header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className={`h-2 w-2 rounded-full ${column.color}`} />
            <h3 className="text-sm font-semibold text-foreground">
              {column.label}
            </h3>
            <span className="text-xs text-muted-2 bg-grid-300 px-1.5 py-0.5 rounded-full">
              {column.clients.length}
            </span>
          </div>

          {/* Column Body */}
          <div className="space-y-2 bg-grid-300/30 rounded-xl p-2 min-h-[200px]">
            {column.clients.length === 0 ? (
              <p className="text-xs text-muted-2 text-center py-8">
                No clients
              </p>
            ) : (
              column.clients.map((client) => (
                <ClientCard
                  key={client.id}
                  id={client.id}
                  companyName={client.company_name}
                  contactName={client.contact_name}
                  contactEmail={client.contact_email}
                  stage={client.stage}
                  contractCount={0}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
