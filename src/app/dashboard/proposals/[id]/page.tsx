"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { cn, formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ProposalStatusBadge from "@/components/proposals/ProposalStatusBadge";
import { ArrowLeft, Check, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

const STAFF_EMAIL = "info@andykgroupinternational.com";

export default function ProposalPage() {
  const params = useParams();
  const proposalId = params.id as Id<"proposals">;

  const proposal = useQuery(api.proposals.getById, { id: proposalId });

  const clientApprove = useMutation(api.proposals.clientApprove);
  const clientRequestChanges = useMutation(api.proposals.clientRequestChanges);
  const sendChangesEmail = useAction(api.actions.email.sendProposalChangesRequested);

  const [isApproving, setIsApproving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [comment, setComment] = useState("");
  const [approvedSuccess, setApprovedSuccess] = useState(false);
  const [changesSubmitted, setChangesSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading state
  if (proposal === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  // Not found state
  if (!proposal) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Proposal not found</p>
        <Link
          href="/dashboard"
          className="text-highlight hover:underline text-sm mt-2 inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    try {
      await clientApprove({ id: proposalId });
      setApprovedSuccess(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve proposal");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!comment.trim()) return;
    setIsRequesting(true);
    setError(null);
    try {
      const result = await clientRequestChanges({ id: proposalId, comment: comment.trim() });
      setChangesSubmitted(true);
      setShowChangesForm(false);

      // Send notification email to staff
      try {
        await sendChangesEmail({
          staffEmail: STAFF_EMAIL,
          companyName: result.companyName || "",
          title: result.title || proposal.title,
          comment: comment.trim(),
          proposalId: proposalId,
        });
      } catch {
        // Email failure shouldn't block the UI
        console.error("Failed to send notification email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request changes");
    } finally {
      setIsRequesting(false);
    }
  };

  // Approved state (either from mutation success or already approved)
  if (approvedSuccess || proposal.status === "approved") {
    return (
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-grid-300 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Proposal Approved</h2>
          <p className="text-muted-2 text-sm max-w-md mx-auto">
            Thank you for approving the proposal. Your contract will be prepared shortly.
          </p>
          {proposal.clientApprovedAt && (
            <p className="text-muted text-xs mt-4">
              Approved on {formatDate(proposal.clientApprovedAt)}
            </p>
          )}
        </div>

        {/* Still show proposal sections for reference */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Proposal Details</h3>
          {proposal.sections
            .filter((s) => s.isVisible)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div
                key={section.key}
                className="bg-white rounded-xl border border-grid-300 p-6 mb-4"
              >
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  {section.title}
                </h4>
                <div className="text-sm text-muted-2 whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Changes requested state (either from mutation success or already in that status)
  if (changesSubmitted || proposal.status === "changes_requested") {
    return (
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-grid-300 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <AlertCircle className="h-8 w-8 text-warning" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Changes Requested</h2>
          <p className="text-muted-2 text-sm max-w-md mx-auto">
            Your feedback has been sent to our team. We&apos;ll update the proposal and get back to you shortly.
          </p>
          {proposal.clientComment && (
            <div className="mt-6 bg-bg-light rounded-lg p-4 text-left max-w-lg mx-auto">
              <p className="text-xs font-medium text-muted mb-1">Your comment:</p>
              <p className="text-sm text-muted-2 whitespace-pre-wrap">{proposal.clientComment}</p>
            </div>
          )}
        </div>

        {/* Still show proposal sections for reference */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Proposal Details</h3>
          {proposal.sections
            .filter((s) => s.isVisible)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div
                key={section.key}
                className="bg-white rounded-xl border border-grid-300 p-6 mb-4"
              >
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  {section.title}
                </h4>
                <div className="text-sm text-muted-2 whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Default: proposal view with actions (for "sent" status, or read-only for other statuses)
  const visibleSections = proposal.sections
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{proposal.title}</h1>
          {proposal.sentToClientAt && (
            <p className="text-muted text-sm mt-1">
              Sent on {formatDate(proposal.sentToClientAt)}
            </p>
          )}
        </div>
        <ProposalStatusBadge status={proposal.status} />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Sections */}
      {visibleSections.map((section) => (
        <div
          key={section.key}
          className="bg-white rounded-xl border border-grid-300 p-6 mb-4"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {section.title}
          </h3>
          <div className="text-sm text-muted-2 whitespace-pre-wrap">
            {section.content}
          </div>
        </div>
      ))}

      {/* Action buttons (only for "sent" status) */}
      {proposal.status === "sent" && (
        <div className="mt-8">
          {!showChangesForm ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors",
                  "bg-success text-white hover:bg-success/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Check className="h-4 w-4" />
                {isApproving ? "Approving..." : "Approve Proposal"}
              </button>
              <button
                onClick={() => setShowChangesForm(true)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors",
                  "bg-grid-300 text-foreground hover:bg-grid-300/80"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                Request Changes
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-grid-300 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Request Changes
              </h3>
              <p className="text-sm text-muted-2 mb-4">
                Please describe the changes you&apos;d like us to make to this proposal.
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe the changes you'd like..."
                rows={4}
                className="w-full rounded-lg border border-grid-300 bg-bg-light px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleRequestChanges}
                  disabled={isRequesting || !comment.trim()}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    "bg-highlight text-white hover:bg-highlight/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isRequesting ? "Submitting..." : "Submit Feedback"}
                </button>
                <button
                  onClick={() => {
                    setShowChangesForm(false);
                    setComment("");
                  }}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
