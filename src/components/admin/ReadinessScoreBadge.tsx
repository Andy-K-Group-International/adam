"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { readinessTier, readinessTierStyle } from "@/lib/readiness-score";
import type { ReadinessBreakdown } from "@/lib/readiness-score";

interface Props {
  score: number | null;
  breakdown?: ReadinessBreakdown | null;
  showBar?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function ReadinessScoreBadge({ score, breakdown, showBar = false, size = "sm", className }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (score === null || score === undefined) {
    return (
      <span className={cn("text-[10px] font-mono text-muted-2 px-2 py-0.5 rounded-full border border-grid-300 bg-grid-300/40", className)}>
        —
      </span>
    );
  }

  const tier = readinessTier(score);
  const styles = readinessTierStyle(tier);

  return (
    <div className={cn("inline-flex flex-col gap-1 relative", className)}>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "inline-flex items-center gap-1.5 font-mono font-semibold rounded-full border cursor-default",
          size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
          styles.badge
        )}
      >
        <span className="tabular-nums">{score}</span>
        <span className="opacity-70">· {tier}</span>
      </button>
      {showBar && (
        <div className="h-1 w-full rounded-full bg-grid-300 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", styles.bar)}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
      {showTooltip && breakdown && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-64 bg-white border border-grid-300 rounded-xl shadow-lg p-3 pointer-events-none">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2.5">
            Implementation Readiness
          </p>
          {[
            {
              label: "Documentation",
              data: breakdown.documentation,
              items: [
                { k: "Questionnaire", v: breakdown.documentation.questionnaire },
                { k: "KYC verified", v: breakdown.documentation.kyc },
                { k: "Document uploaded", v: breakdown.documentation.document },
              ],
            },
            {
              label: "Responsiveness",
              data: breakdown.responsiveness,
              items: [
                { k: "Proposal reply <48h", v: breakdown.responsiveness.proposalResponse },
                { k: "Contract reply <48h", v: breakdown.responsiveness.contractResponse },
                { k: "No stale requests", v: breakdown.responsiveness.noPendingRequests },
              ],
            },
            {
              label: "Maturity",
              data: breakdown.maturity,
              items: [
                { k: "Has website", v: breakdown.maturity.website },
                { k: "Team size 11+", v: breakdown.maturity.companySize },
                { k: "Revenue 250k+", v: breakdown.maturity.revenue },
              ],
            },
            {
              label: "Cooperation",
              data: breakdown.cooperation,
              items: [
                { k: "2+ contacts", v: breakdown.cooperation.contacts },
                { k: "Primary has phone", v: breakdown.cooperation.primaryPhone },
                { k: "Strategy type set", v: breakdown.cooperation.strategyType },
              ],
            },
          ].map(({ label, data, items }) => (
            <div key={label} className="mb-2.5 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
                <span className="text-[10px] font-mono text-muted-2">{data.score}/{data.max}</span>
              </div>
              <div className="space-y-0.5">
                {items.map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-2">{k}</span>
                    <span className={cn("text-[10px] font-mono font-semibold", v > 0 ? "text-success" : "text-muted-2/50")}>
                      {v > 0 ? `+${v}` : "0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
