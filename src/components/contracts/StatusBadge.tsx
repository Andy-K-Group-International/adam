"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-grid-300 text-muted" },
  published: { label: "Published", className: "bg-info/10 text-info" },
  viewed: { label: "Viewed", className: "bg-info/10 text-info" },
  changes_requested: {
    label: "Changes Requested",
    className: "bg-warning/10 text-warning",
  },
  client_signed: {
    label: "Client Signed",
    className: "bg-highlight/10 text-highlight",
  },
  countersigned: {
    label: "Countersigned",
    className: "bg-success/10 text-success",
  },
  final: { label: "Final", className: "bg-success/10 text-success" },
};

export default function StatusBadge({ status }: { status: string }) {
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
