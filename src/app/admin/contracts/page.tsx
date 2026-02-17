"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import StatusBadge from "@/components/contracts/StatusBadge";

type StatusFilter = "" | "draft" | "published" | "viewed" | "changes_requested" | "client_signed" | "countersigned" | "final";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "viewed", label: "Viewed" },
  { value: "changes_requested", label: "Changes Requested" },
  { value: "client_signed", label: "Client Signed" },
  { value: "countersigned", label: "Countersigned" },
  { value: "final", label: "Final" },
];

export default function ContractsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const contracts = useQuery(
    api.contracts.listAll,
    statusFilter ? { status: statusFilter as "draft" | "published" | "viewed" | "changes_requested" | "client_signed" | "countersigned" | "final" } : {}
  );
  const clients = useQuery(api.clients.list, {});

  if (contracts === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  // Build client lookup
  const clientMap = new Map<string, string>();
  (clients || []).forEach((c) => {
    clientMap.set(c._id, c.companyName);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
          <p className="text-muted mt-1">
            Manage all client contracts.
          </p>
        </div>
        <Link
          href="/admin/contracts/new"
          className="inline-flex items-center gap-2 bg-highlight text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Contract
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="text-sm border border-grid-500 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Title
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Client
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Version
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {(contracts || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-2">
                    No contracts found.
                  </td>
                </tr>
              ) : (
                (contracts || []).map((contract) => (
                  <tr
                    key={contract._id}
                    className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/contracts/${contract._id}`}
                        className="text-sm font-medium text-foreground hover:text-highlight transition-colors"
                      >
                        {contract.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      {clientMap.get(contract.clientId) || "Unknown Client"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={contract.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      v{contract.version}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      {formatDate(contract.updatedAt)}
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
