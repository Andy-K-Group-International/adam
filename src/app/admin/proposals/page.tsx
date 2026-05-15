"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { listProposals } from "@/lib/supabase/queries/proposals";
import { listClients } from "@/lib/supabase/queries/clients";
import { proposalStatusStyle, proposalStatusLabel } from "@/lib/proposal-content";
import type { Proposal, Client, ProposalStatus } from "@/lib/supabase/types";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type StatusFilter = "" | ProposalStatus;

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "changes_requested", label: "Changes Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "unlocked", label: "Unlocked" },
];

const SERVICE_LABELS: Record<string, string> = {
  b2b: "B2B",
  b2g: "B2G",
  adam_license: "A.D.A.M.",
  end_to_end: "E2E",
};

const SERVICE_COLORS: Record<string, string> = {
  b2b: "bg-info/10 text-info",
  b2g: "bg-violet-500/10 text-violet-600",
  adam_license: "bg-highlight/10 text-highlight",
  end_to_end: "bg-success/10 text-success",
};

export default function ProposalsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [proposals, setProposals] = useState<Proposal[] | undefined>(undefined);
  const [clients, setClients] = useState<Client[]>([]);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    try {
      const [proposalsData, clientsData] = await Promise.all([
        listProposals(supabase, statusFilter ? { status: statusFilter } : {}),
        listClients(supabase),
      ]);
      setProposals(proposalsData);
      setClients(clientsData);
    } catch {
      setProposals([]);
    }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (proposals === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  const clientMap = new Map<string, Client>();
  clients.forEach((c) => clientMap.set(c.id, c));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Proposals</h1>
          <p className="text-muted text-sm mt-1">{proposals.length} proposal{proposals.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/proposals/new"
          className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient"
        >
          <span className="relative z-10 flex items-center gap-2"><Plus className="h-4 w-4" />New Proposal</span>
        </Link>
      </div>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="text-sm border border-grid-500 rounded-lg px-3 h-10 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Ref / Title</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Client</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Service</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Valid Until</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-2">No proposals found.</td>
                </tr>
              ) : (
                proposals.map((proposal) => {
                  const client = proposal.client_id ? clientMap.get(proposal.client_id) : null;
                  return (
                    <tr key={proposal.id} className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/admin/proposals/${proposal.id}`} className="text-sm font-medium text-foreground hover:text-highlight transition-colors">
                          {proposal.title}
                        </Link>
                        {proposal.proposal_ref && (
                          <p className="text-xs font-mono text-muted-2 mt-0.5">{proposal.proposal_ref}</p>
                        )}
                        {proposal.commercials_locked && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded mt-1">LOCKED</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {client ? (
                          <Link href={`/admin/clients/${client.id}`} className="text-sm text-muted-2 hover:text-highlight transition-colors">
                            {client.company_name}
                          </Link>
                        ) : <span className="text-sm text-muted-2">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {proposal.service_type ? (
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", SERVICE_COLORS[proposal.service_type] ?? "bg-grid-300 text-muted")}>
                            {SERVICE_LABELS[proposal.service_type] ?? proposal.service_type}
                          </span>
                        ) : <span className="text-sm text-muted-2">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", proposalStatusStyle(proposal.status))}>
                          {proposalStatusLabel(proposal.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-2">
                        {proposal.valid_until
                          ? new Date(proposal.valid_until).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-2">{formatDate(proposal.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
