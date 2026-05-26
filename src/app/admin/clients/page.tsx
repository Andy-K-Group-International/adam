"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { listClients } from "@/lib/supabase/queries/clients";
import type { Client } from "@/lib/supabase/types";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import HealthScoreBadge from "@/components/admin/HealthScoreBadge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const stageColors: Record<string, string> = {
  questionnaire: "bg-grid-300 text-muted",
  proposal: "bg-info/10 text-info",
  strategy: "bg-highlight/10 text-highlight",
  contract: "bg-warning/10 text-warning",
  invoice: "bg-success/10 text-success",
  kickoff: "bg-success/10 text-success",
};

const stageLabels: Record<string, string> = {
  questionnaire: "Questionnaire",
  proposal: "Proposal",
  strategy: "Strategy",
  contract: "Contract",
  invoice: "Invoice",
  kickoff: "Kick-off",
};

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  type ClientWithPrimary = Client & { primary_contact: { name: string; email: string } | null };
  const [clients, setClients] = useState<ClientWithPrimary[] | undefined>(undefined);

  const fetchClients = useCallback(async () => {
    const supabase = createClient();
    try {
      const data = await listClients(
        supabase,
        search.trim().length > 0 ? { search: search.trim() } : {}
      );
      setClients(data);
    } catch {
      setClients([]);
    }
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  if (clients === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Clients</h1>
          <p className="text-muted text-sm mt-1">
            Manage all clients and their accounts.
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient"
        >
          <Plus className="h-4 w-4" />
          Create Client
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
          <input
            type="text"
            placeholder="Search by company name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 text-sm border border-grid-500 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Company
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Primary Contact
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Stage
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Health
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {(clients || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-2">
                    {search ? "No clients found matching your search." : "No clients yet."}
                  </td>
                </tr>
              ) : (
                (clients || []).map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-sm font-medium text-foreground hover:text-highlight transition-colors"
                      >
                        {client.company_name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {client.primary_contact ? (
                        <>
                          <p className="text-sm text-foreground">{client.primary_contact.name}</p>
                          <p className="text-xs text-muted-2">{client.primary_contact.email}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-foreground">{client.contact_name}</p>
                          <p className="text-xs text-muted-2">{client.contact_email}</p>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full",
                          stageColors[client.stage] || "bg-grid-300 text-muted"
                        )}
                      >
                        {stageLabels[client.stage] || client.stage}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <HealthScoreBadge score={client.health_score ?? null} />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      {formatDate(client.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
