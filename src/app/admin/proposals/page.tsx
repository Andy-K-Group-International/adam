"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { listProposals } from "@/lib/supabase/queries/proposals";
import { listClients } from "@/lib/supabase/queries/clients";
import type { Proposal, Client, ProposalStatus } from "@/lib/supabase/types";
import Link from "next/link";
import { Plus, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type StatusFilter = "" | ProposalStatus;

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "evaluating", label: "Evaluating" },
  { value: "flagged", label: "Flagged" },
  { value: "sent", label: "Sent to Client" },
  { value: "changes_requested", label: "Changes Requested" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
];

function proposalStatusStyle(status: ProposalStatus): string {
  switch (status) {
    case "draft":
      return "bg-grid-300 text-muted";
    case "evaluating":
      return "bg-info/10 text-info";
    case "flagged":
      return "bg-warning/10 text-warning";
    case "sent":
      return "bg-info/10 text-info";
    case "changes_requested":
      return "bg-warning/10 text-warning";
    case "approved":
      return "bg-success/10 text-success";
    case "declined":
      return "bg-error/10 text-error";
  }
}

function proposalStatusLabel(status: ProposalStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "evaluating":
      return "Evaluating";
    case "flagged":
      return "Flagged";
    case "sent":
      return "Sent to Client";
    case "changes_requested":
      return "Changes Requested";
    case "approved":
      return "Approved";
    case "declined":
      return "Declined";
  }
}

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (proposals === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const clientMap = new Map<string, Client>();
  clients.forEach((c) => clientMap.set(c.id, c));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
          <p className="text-muted mt-1">Manage all client proposals.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/proposals/templates"
            className="inline-flex items-center gap-2 border border-grid-500 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-grid-300 transition-colors"
          >
            <FileSearch className="h-4 w-4" />
            Templates
          </Link>
          <Link
            href="/admin/proposals/new"
            className="inline-flex items-center gap-2 bg-highlight text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Proposal
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="text-sm border border-grid-500 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Title
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Ref
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Client
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-2">
                    No proposals found.
                  </td>
                </tr>
              ) : (
                proposals.map((proposal) => {
                  const client = proposal.client_id
                    ? clientMap.get(proposal.client_id)
                    : null;
                  return (
                    <tr
                      key={proposal.id}
                      className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/proposals/${proposal.id}`}
                          className="text-sm font-medium text-foreground hover:text-highlight transition-colors"
                        >
                          {proposal.title}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-2">
                        {proposal.proposal_ref || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {client ? (
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="text-sm text-muted-2 hover:text-highlight transition-colors"
                          >
                            {client.company_name}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-2">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                            proposalStatusStyle(proposal.status)
                          )}
                        >
                          {proposalStatusLabel(proposal.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-2">
                        {formatDate(proposal.created_at)}
                      </td>
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
