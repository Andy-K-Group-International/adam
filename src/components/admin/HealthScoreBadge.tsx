"use client";

import { cn } from "@/lib/utils";

export type HealthTier = "Excellent" | "Good" | "At Risk" | "Critical";

export function getHealthTier(score: number): HealthTier {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "At Risk";
  return "Critical";
}

const tierStyles: Record<HealthTier, { badge: string; bar: string }> = {
  Excellent: {
    badge: "bg-success/10 text-success border-success/20",
    bar:   "bg-success",
  },
  Good: {
    badge: "bg-warning/10 text-warning border-warning/20",
    bar:   "bg-warning",
  },
  "At Risk": {
    badge: "bg-orange-50 text-orange-600 border-orange-200",
    bar:   "bg-orange-400",
  },
  Critical: {
    badge: "bg-error/10 text-error border-error/20",
    bar:   "bg-error",
  },
};

interface HealthScoreBadgeProps {
  score: number | null;
  showBar?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function HealthScoreBadge({
  score,
  showBar = false,
  size = "sm",
  className,
}: HealthScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span className={cn("text-[10px] font-mono text-muted-2 px-2 py-0.5 rounded-full border border-grid-300 bg-grid-300/40", className)}>
        —
      </span>
    );
  }

  const tier = getHealthTier(score);
  const styles = tierStyles[tier];

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-mono font-semibold rounded-full border",
          size === "sm"
            ? "text-[10px] px-2 py-0.5"
            : "text-xs px-2.5 py-1",
          styles.badge
        )}
      >
        <span className="tabular-nums">{score}</span>
        <span className="opacity-70">· {tier}</span>
      </span>
      {showBar && (
        <div className="h-1 w-full rounded-full bg-grid-300 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", styles.bar)}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}
