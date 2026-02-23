"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ProposalStatusBadge from "@/components/proposals/ProposalStatusBadge";

type StatusFilter =
  | ""
  | "evaluating"
  | "flagged"
  | "draft"
  | "sent"
  | "changes_requested"
  | "approved"
  | "declined";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "evaluating", label: "Evaluating" },
  { value: "flagged", label: "Flagged" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent to Client" },
  { value: "changes_requested", label: "Changes Requested" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
];

export default function ProposalsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const proposals = useQuery(
    api.proposals.listAll,
    statusFilter
      ? {
          status: statusFilter as
            | "evaluating"
            | "flagged"
            | "draft"
            | "sent"
            | "changes_requested"
            | "approved"
            | "declined",
        }
      : {}
  );

  const questionnaires = useQuery(api.questionnaires.list, {
    status: "submitted",
  });
  const convertedQuestionnaires = useQuery(api.questionnaires.list, {
    status: "converted",
  });

  if (proposals === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  // Build questionnaire lookup for company names
  const questionnaireMap = new Map<string, string>();
  (questionnaires || []).forEach((q) => {
    questionnaireMap.set(q._id, q.companyName);
  });
  (convertedQuestionnaires || []).forEach((q) => {
    questionnaireMap.set(q._id, q.companyName);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
          <p className="text-muted mt-1">Manage AI-generated proposals.</p>
        </div>
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
                  Company
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  AI Score
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(proposals || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-2">
                    No proposals found.
                  </td>
                </tr>
              ) : (
                (proposals || []).map((proposal) => (
                  <tr
                    key={proposal._id}
                    className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/proposals/${proposal._id}`}
                        className="text-sm font-medium text-foreground hover:text-highlight transition-colors"
                      >
                        {questionnaireMap.get(proposal.questionnaireId) ||
                          proposal.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <ProposalStatusBadge status={proposal.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      {proposal.aiEvaluation
                        ? `${proposal.aiEvaluation.qualityScore}/100`
                        : "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      {formatDate(proposal.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/proposals/${proposal._id}`}
                        className="text-sm font-medium text-highlight hover:text-highlight/80 transition-colors"
                      >
                        View
                      </Link>
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
