"use client";

import { useState } from "react";
import type { ProposalVersion } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";
import { History, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  versions: ProposalVersion[];
  onRestore: (version: ProposalVersion) => Promise<void>;
}

export default function ProposalVersionHistory({ versions, onRestore }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  if (versions.length === 0) return null;

  const latestStable = versions[0];

  const handleRestore = async (v: ProposalVersion) => {
    setRestoring(v.id);
    try {
      await onRestore(v);
    } finally {
      setRestoring(null);
      setConfirming(null);
    }
  };

  return (
    <div className="mt-8 border-t border-grid-300 pt-6">
      <button
        onClick={() => setExpanded((x) => !x)}
        className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-highlight transition-colors mb-1"
      >
        <History className="h-4 w-4" />
        Version History
        <span className="text-xs font-mono font-normal text-muted-2">
          ({versions.length} snapshot{versions.length !== 1 ? "s" : ""})
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-2 ml-auto" /> : <ChevronDown className="h-4 w-4 text-muted-2 ml-auto" />}
      </button>
      <p className="text-xs text-muted-2 mb-4">
        Last stable: <span className="font-semibold text-muted">v{latestStable.version} — {latestStable.snapshot_label ?? "Snapshot"}</span>
      </p>

      {expanded && (
        <div className="space-y-2">
          {versions.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-xl border border-grid-300 px-4 py-3 flex items-center gap-4"
            >
              <div className="shrink-0">
                <span className="inline-flex items-center font-mono text-xs font-bold text-highlight bg-highlight/8 px-2 py-0.5 rounded">
                  v{v.version}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {v.snapshot_label ?? `Version ${v.version}`}
                </p>
                <p className="text-xs text-muted-2 mt-0.5">
                  {formatDate(v.created_at)}
                  {v.service_type && (
                    <> · <span className="capitalize">{v.service_type.replace("_", " ")}</span></>
                  )}
                  {Array.isArray(v.sections) && (
                    <> · {(v.sections as unknown[]).length} section{(v.sections as unknown[]).length !== 1 ? "s" : ""}</>
                  )}
                </p>
              </div>
              <div className="shrink-0">
                {confirming === v.id ? (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-warning font-medium">Replace current content with v{v.version}?</p>
                    <button
                      onClick={() => handleRestore(v)}
                      disabled={restoring === v.id}
                      className="text-xs font-semibold text-error hover:text-error/80 transition-colors disabled:opacity-50"
                    >
                      {restoring === v.id ? "Restoring…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirming(null)}
                      className="text-xs text-muted-2 hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirming(v.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
                      v.id === latestStable.id
                        ? "border-highlight/30 text-highlight hover:bg-highlight/8"
                        : "border-grid-500 text-muted-2 hover:text-foreground hover:border-grid-500"
                    )}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
