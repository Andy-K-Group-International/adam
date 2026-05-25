"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import { User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineItem } from "./types";

const SERVICE_LABELS: Record<string, string> = {
  b2b: "B2B",
  b2g: "B2G",
  adam_license: "ADAM",
  end_to_end: "E2E",
};

const SERVICE_COLORS: Record<string, string> = {
  b2b: "bg-info/10 text-info",
  b2g: "bg-highlight/10 text-highlight",
  adam_license: "bg-eggplant/10 text-eggplant",
  end_to_end: "bg-success/10 text-success",
};

function StatusDot({ days }: { days: number }) {
  const color =
    days < 7 ? "bg-success" : days < 14 ? "bg-warning" : "bg-error";
  return (
    <span
      className={cn("h-2 w-2 rounded-full shrink-0 mt-0.5", color)}
      title={`${days} day${days !== 1 ? "s" : ""} in stage`}
    />
  );
}

function LeadScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-success/10 text-success"
      : score >= 40
      ? "bg-warning/10 text-warning"
      : "bg-error/10 text-error";
  return (
    <span className={cn("text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full", color)}>
      {score}
    </span>
  );
}

interface Props {
  item: PipelineItem;
  overlay?: boolean;
}

export default function PipelineCard({ item, overlay = false }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "touch-none cursor-grab active:cursor-grabbing",
        isDragging && !overlay && "opacity-30"
      )}
    >
      <Link
        href={item.href}
        onClick={(e) => {
          if (isDragging) e.preventDefault();
        }}
        className={cn(
          "block bg-white rounded-lg border border-grid-300 p-3 hover:border-grid-500 transition-all select-none",
          overlay && "shadow-xl border-grid-500 rotate-1"
        )}
      >
        {/* Top row: status dot + company name */}
        <div className="flex items-start gap-2 mb-2">
          <StatusDot days={item.daysInStage} />
          <p className="text-sm font-semibold text-foreground leading-tight truncate flex-1 min-w-0">
            {item.companyName}
          </p>
        </div>

        {/* Contact name */}
        <div className="flex items-center gap-1.5 text-xs text-muted-2 mb-1.5">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{item.contactName}</span>
        </div>

        {/* Client ref */}
        {item.clientRef && (
          <p className="text-[10px] font-mono text-muted-2 mb-2 pl-0.5">
            {item.clientRef}
          </p>
        )}

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {item.leadScore !== undefined && (
            <LeadScoreBadge score={item.leadScore} />
          )}
          {item.serviceType && (
            <span
              className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                SERVICE_COLORS[item.serviceType] ?? "bg-grid-300 text-muted"
              )}
            >
              {SERVICE_LABELS[item.serviceType] ?? item.serviceType}
            </span>
          )}
          <span className="text-[10px] text-muted-2 flex items-center gap-0.5 ml-auto">
            <Clock className="h-2.5 w-2.5" />
            {item.daysInStage}d
          </span>
        </div>
      </Link>
    </div>
  );
}
