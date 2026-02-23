"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PipelineDots from "./PipelineDots";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

const statusColors: Record<string, string> = {
  draft: "bg-grid-300 text-muted",
  published: "bg-info/10 text-info",
  viewed: "bg-info/10 text-info",
  changes_requested: "bg-warning/10 text-warning",
  client_signed: "bg-highlight/10 text-highlight",
  countersigned: "bg-success/10 text-success",
  final: "bg-success/10 text-success",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  viewed: "Viewed",
  changes_requested: "Changes Requested",
  client_signed: "Client Signed",
  countersigned: "Countersigned",
  final: "Final",
};

interface ContractCardProps {
  id: string;
  title: string;
  status: string;
  stage: string;
  updatedAt: string | number;
  isAdmin?: boolean;
}

export default function ContractCard({
  id,
  title,
  status,
  stage,
  updatedAt,
  isAdmin,
}: ContractCardProps) {
  const href = isAdmin ? `/admin/contracts/${id}` : `/dashboard/contracts/${id}`;

  return (
    <Link
      href={href}
      className="block bg-white rounded-xl border border-grid-300 p-5 hover:border-grid-500 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span
          className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-full",
            statusColors[status] || "bg-grid-300 text-muted"
          )}
        >
          {statusLabels[status] || status}
        </span>
      </div>

      <div className="mb-3">
        <PipelineDots currentStage={stage} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-2">
          Updated {formatRelativeTime(updatedAt)}
        </span>
        <span className="text-xs text-highlight flex items-center gap-1">
          View Contract <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
