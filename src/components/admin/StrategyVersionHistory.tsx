"use client";

import { useState } from "react";
import type { StrategyVersion } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";
import { History, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  versions: StrategyVersion[];
  onRestore: (v: StrategyVersion) => void;
}

export default function StrategyVersionHistory({ versions, onRestore }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  if (versions.length === 0) return null;

  const displayVersions = versions.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
      <button
        onClick={() => setExpanded((x) => !x)}
        className="w-full flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-grid-300/20 transition-colors text-left"
      >
        <History className="h-4 w-4 text-muted-2 shrink-0" />
        <span className="flex-1">Version History</span>
        <span className="text-xs font-mono font-normal text-muted-2">
          {versions.length} snapshot{versions.length !== 1 ? "s" : ""}
        </span>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-2 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-2 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="border-t border-grid-300 divide-y divide-grid-300">
          {displayVersions.map((v) => {
            const preview = (v.strategy_notes ?? "").slice(0, 60).replace(/\n/g, " ").trim();
            return (
              <div key={v.id} className="px-5 py-3 flex items-start gap-3">
                <span className="inline-flex items-center font-mono text-xs font-bold text-highlight bg-highlight/8 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                  v{v.version}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {v.snapshot_label ?? `Version ${v.version}`}
                  </p>
                  <p className="text-xs text-muted-2 mt-0.5">
                    {formatDate(v.created_at)}
                    {v.strategy_type && <> · {v.strategy_type}</>}
                  </p>
                  {preview && (
                    <p className="text-xs text-muted-2 mt-1 font-mono truncate">
                      {preview}{(v.strategy_notes ?? "").length > 60 ? "…" : ""}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {confirming === v.id ? (
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-warning font-medium whitespace-nowrap">Replace with v{v.version}?</p>
                      <button
                        onClick={() => { onRestore(v); setConfirming(null); }}
                        className="text-xs font-semibold text-error hover:text-error/80 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirming(null)}
                        className="text-xs text-muted-2 hover:text-foreground transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirming(v.id)}
                      className="inline-flex items-center gap-1 text-xs text-muted-2 hover:text-foreground border border-grid-500 hover:border-grid-500 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {versions.length > 5 && (
            <div className="px-5 py-2.5">
              <p className="text-xs text-muted-2 font-mono">
                Showing last 5 of {versions.length} versions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
