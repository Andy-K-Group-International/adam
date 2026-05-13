"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listProposals } from "@/lib/supabase/queries/proposals";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Proposal, ProposalStatus } from "@/lib/supabase/types";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

function statusStyle(status: ProposalStatus): string {
  switch (status) {
    case "draft":
    case "evaluating":
      return "bg-grid-300 text-muted";
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

function statusLabel(status: ProposalStatus): string {
  switch (status) {
    case "draft":
    case "evaluating":
      return "Under Review";
    case "flagged":
      return "Flagged";
    case "sent":
      return "Awaiting Response";
    case "changes_requested":
      return "Changes Requested";
    case "approved":
      return "Approved";
    case "declined":
      return "Declined";
  }
}

export default function ProposalsPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [proposals, setProposals] = useState<Proposal[] | undefined>(undefined);

  useEffect(() => {
    if (!user?.client_id) return;
    const supabase = createClient();
    listProposals(supabase, { clientId: user.client_id })
      .then(setProposals)
      .catch(() => setProposals([]));
  }, [user]);

  if (userLoading || proposals === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
        <p className="text-muted mt-1">Review proposals from Andy&apos;K Group.</p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 p-12 text-center">
          <Lightbulb className="h-10 w-10 text-muted-2 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No proposals yet</p>
          <p className="text-sm text-muted-2 mt-1">
            When a proposal is ready for your review, you&apos;ll receive an email with a direct link.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Link
              key={proposal.id}
              href={`/dashboard/proposals/${proposal.id}`}
              className="block bg-white rounded-xl border border-grid-300 p-4 hover:border-highlight/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {proposal.title}
                  </p>
                  {proposal.proposal_ref && (
                    <p className="text-xs text-muted-2 mt-0.5">{proposal.proposal_ref}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      statusStyle(proposal.status)
                    )}
                  >
                    {statusLabel(proposal.status)}
                  </span>
                  <span className="text-xs text-muted-2">
                    {formatDate(proposal.updated_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
