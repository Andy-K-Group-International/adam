"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getProposalById, updateProposal } from "@/lib/supabase/queries/proposals";
import { sendProposalResponse } from "@/app/actions/email";
import type { Proposal, ProposalStatus } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { siteConfig } from "@/lib/data";

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
      return "Awaiting Your Response";
    case "changes_requested":
      return "Changes Requested";
    case "approved":
      return "Approved";
    case "declined":
      return "Declined";
  }
}

export default function ClientProposalPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const { user } = useCurrentUser();

  const [proposal, setProposal] = useState<Proposal | null | undefined>(undefined);
  const [isDeclineMode, setIsDeclineMode] = useState(false);
  const [declineComment, setDeclineComment] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    getProposalById(supabase, proposalId)
      .then(setProposal)
      .catch(() => setProposal(null));
  }, [proposalId]);

  if (proposal === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (!proposal) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Proposal not found.</p>
      </div>
    );
  }

  const canRespond = proposal.status === "sent";
  const sortedSections = [...proposal.sections]
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  const handleApprove = async () => {
    if (!user) return;
    setIsApproving(true);
    try {
      const supabase = createClient();
      const updated = await updateProposal(supabase, proposalId, {
        status: "approved",
        client_approved_at: new Date().toISOString(),
        client_comment: null,
      });
      setProposal(updated);
      await sendProposalResponse({
        staffEmail: siteConfig.email,
        clientName: user.first_name + " " + user.last_name,
        proposalTitle: proposal.title,
        proposalId: proposal.id,
        decision: "approved",
      });
    } catch (err) {
      console.error("Failed to approve proposal:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    if (!user) return;
    setIsDeclining(true);
    try {
      const supabase = createClient();
      const updated = await updateProposal(supabase, proposalId, {
        status: "declined",
        client_comment: declineComment.trim() || null,
      });
      setProposal(updated);
      await sendProposalResponse({
        staffEmail: siteConfig.email,
        clientName: user.first_name + " " + user.last_name,
        proposalTitle: proposal.title,
        proposalId: proposal.id,
        decision: "declined",
        comment: declineComment.trim() || undefined,
      });
      setIsDeclineMode(false);
    } catch (err) {
      console.error("Failed to decline proposal:", err);
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/proposals"
          className="text-muted-2 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{proposal.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            {proposal.proposal_ref && (
              <span className="text-xs text-muted-2">{proposal.proposal_ref}</span>
            )}
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                statusStyle(proposal.status)
              )}
            >
              {statusLabel(proposal.status)}
            </span>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-2 hover:text-foreground border border-grid-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          Print / PDF
        </button>
      </div>

      {/* Status card for responded proposals */}
      {(proposal.status === "approved" || proposal.status === "declined") && (
        <div
          className={cn(
            "rounded-xl border p-5 mb-6 flex items-start gap-3",
            proposal.status === "approved"
              ? "bg-success/5 border-success/20"
              : "bg-error/5 border-error/20"
          )}
        >
          {proposal.status === "approved" ? (
            <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-error mt-0.5 shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">
              You {proposal.status === "approved" ? "approved" : "declined"} this proposal
              {proposal.client_approved_at
                ? ` on ${formatDate(proposal.client_approved_at)}`
                : ""}
              .
            </p>
            {proposal.client_comment && (
              <p className="text-sm text-muted-2 mt-1 whitespace-pre-wrap">
                Your comment: {proposal.client_comment}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Proposal sections */}
        <div className="space-y-4">
          {sortedSections.length === 0 ? (
            <div className="bg-white rounded-xl border border-grid-300 p-12 text-center">
              <p className="text-muted-2">No content available yet.</p>
            </div>
          ) : (
            sortedSections.map((section) => (
              <div key={section.key} className="bg-white rounded-xl border border-grid-300 p-5">
                <h2 className="text-sm font-semibold text-foreground mb-3">{section.title}</h2>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Action panel */}
        {canRespond && (
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Your Decision
            </h3>
            <p className="text-sm text-muted mb-4">
              Please review the proposal carefully before responding. Your decision will notify our team immediately.
            </p>

            {!isDeclineMode ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="inline-flex items-center gap-2 bg-success text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isApproving ? "Approving..." : "Approve Proposal"}
                </button>
                <button
                  onClick={() => setIsDeclineMode(true)}
                  className="inline-flex items-center gap-2 border border-error text-error px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-error/5 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={declineComment}
                  onChange={(e) => setDeclineComment(e.target.value)}
                  placeholder="Please share your reason for declining (optional but helpful)..."
                  rows={4}
                  className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-highlight/30"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDecline}
                    disabled={isDeclining}
                    className="inline-flex items-center gap-2 bg-error text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-error/90 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    {isDeclining ? "Declining..." : "Confirm Decline"}
                  </button>
                  <button
                    onClick={() => {
                      setIsDeclineMode(false);
                      setDeclineComment("");
                    }}
                    className="text-sm text-muted-2 hover:text-foreground transition-colors px-4 py-2.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
