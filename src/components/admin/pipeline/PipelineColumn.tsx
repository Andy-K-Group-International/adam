"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import PipelineCard from "./PipelineCard";
import type { PipelineItem } from "./types";

interface Props {
  id: string;
  label: string;
  accentColor: string;
  items: PipelineItem[];
  revenue: number;
}

function formatRevenue(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export default function PipelineColumn({ id, label, accentColor, items, revenue }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const primaryCurrency =
    items.find((i) => i.currency)?.currency ?? "EUR";

  return (
    <div className="flex flex-col w-full">
      {/* Column header */}
      <div className="flex items-center gap-1.5 mb-1 px-0.5">
        <div className={cn("h-2 w-2 rounded-full shrink-0", accentColor)} />
        <h3 className="text-xs font-semibold text-foreground truncate flex-1">{label}</h3>
        <span className="text-[10px] text-muted-2 bg-grid-300 px-1.5 py-0.5 rounded-full shrink-0 font-mono">
          {items.length}
        </span>
      </div>

      {/* Revenue sub-header */}
      <div className="h-5 mb-2 px-0.5">
        {revenue > 0 && (
          <p className="text-[10px] font-mono text-muted-2">
            {formatRevenue(revenue, primaryCurrency)}
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl p-2 space-y-2 min-h-[240px] transition-all duration-150",
          isOver
            ? "bg-highlight/8 ring-1 ring-inset ring-highlight/20"
            : "bg-grid-300/30"
        )}
      >
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[180px]">
            <p className="text-[11px] text-muted-2">Empty</p>
          </div>
        ) : (
          items.map((item) => <PipelineCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
