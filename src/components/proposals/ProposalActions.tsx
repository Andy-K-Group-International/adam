"use client";

import { cn } from "@/lib/utils";

interface ProposalActionsProps {
  status: string;
  onApprove?: () => void;
  onEdit?: () => void;
  onGenerateForFlagged?: () => void;
  onCreateContract?: () => void;
  isLoading?: boolean;
}

export default function ProposalActions({
  status,
  onApprove,
  onEdit,
  onGenerateForFlagged,
  onCreateContract,
  isLoading,
}: ProposalActionsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {status === "evaluating" && (
        <span className="text-sm text-muted-2">
          AI is evaluating this submission...
        </span>
      )}

      {status === "flagged" && onGenerateForFlagged && (
        <button
          onClick={onGenerateForFlagged}
          disabled={isLoading}
          className={cn(
            "bg-highlight text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? "Generating..." : "Generate Proposal Anyway"}
        </button>
      )}

      {status === "draft" && onApprove && (
        <button
          onClick={onApprove}
          disabled={isLoading}
          className={cn(
            "bg-info text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-info/90 transition-colors",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? "Sending..." : "Approve & Send to Client"}
        </button>
      )}

      {status === "changes_requested" && onApprove && (
        <button
          onClick={onApprove}
          disabled={isLoading}
          className={cn(
            "bg-info text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-info/90 transition-colors",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? "Sending..." : "Approve & Re-send"}
        </button>
      )}

      {status === "sent" && (
        <span className="text-sm text-muted-2">
          Waiting for client response...
        </span>
      )}

      {status === "approved" && onCreateContract && (
        <button
          onClick={onCreateContract}
          disabled={isLoading}
          className={cn(
            "bg-success text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-success/90 transition-colors",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? "Creating..." : "Create Contract"}
        </button>
      )}

      {status === "declined" && (
        <span className="text-sm text-red-500">
          This proposal was declined by the client.
        </span>
      )}
    </div>
  );
}
