"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-2">
          Question {current} of {total}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-2">
          {percentage}%
        </span>
      </div>
      <div className="relative w-full h-1.5 bg-grid-300 rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            "bg-gradient-to-r from-highlight to-[#b8606c]",
            "transition-all duration-500 ease-out"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
