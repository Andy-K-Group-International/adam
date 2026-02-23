"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  evaluating: { label: "Evaluating", className: "bg-info/10 text-info" },
  flagged: { label: "Flagged", className: "bg-warning/10 text-warning" },
  draft: { label: "Draft", className: "bg-grid-300 text-muted" },
  sent: { label: "Sent to Client", className: "bg-info/10 text-info" },
  changes_requested: {
    label: "Changes Requested",
    className: "bg-warning/10 text-warning",
  },
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  declined: { label: "Declined", className: "bg-red-500/10 text-red-500" },
};

export default function ProposalStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-grid-300 text-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
