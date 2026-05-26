"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { listClients } from "@/lib/supabase/queries/clients";
import { serviceTypeLabel, serviceTypeStyle } from "@/lib/contract-templates";
import { STRATEGY_TEMPLATE_LABELS } from "@/lib/strategy-templates";
import type { Client, StrategyType } from "@/lib/supabase/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Search, FileText, ArrowRight, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import ContextualHelp from "@/components/ui/ContextualHelp";

type FilterType = "all" | StrategyType;

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all",          label: "All" },
  { value: "end_to_end",   label: "End-to-End" },
  { value: "b2g",          label: "B2G" },
  { value: "adam_license", label: "A.D.A.M. License" },
];

export default function StrategyPage() {
  const [clients, setClients] = useState<Client[] | undefined>(undefined);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = createClient();
    listClients(supabase)
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  if (clients === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  const withStrategy = clients.filter((c) => !c.archived);

  const filtered = withStrategy.filter((c) => {
    const matchesFilter =
      filter === "all" || c.strategy_type === filter;
    const matchesSearch =
      !search.trim() ||
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts: Record<FilterType, number> = {
    all:          withStrategy.length,
    end_to_end:   withStrategy.filter((c) => c.strategy_type === "end_to_end").length,
    b2g:          withStrategy.filter((c) => c.strategy_type === "b2g").length,
    adam_license: withStrategy.filter((c) => c.strategy_type === "adam_license").length,
    b2b:          withStrategy.filter((c) => c.strategy_type === "b2b").length,
  };

  const hasStrategy   = filtered.filter((c) => c.strategy_notes?.trim());
  const noStrategy    = filtered.filter((c) => !c.strategy_notes?.trim());

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-serif font-semibold text-foreground">Strategy</h1>
            <ContextualHelp
              id="admin-strategy"
              title="Strategy"
              description="Strategies are implementation-focused operational blueprints. They define HOW each client engagement will be executed."
              why="Strategies exist to reduce implementation chaos and align operational direction before contract activation."
              position="right"
            />
          </div>
          <p className="text-sm text-muted-2 mt-0.5">
            Strategic plans and templates for all active clients
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-2 font-mono bg-white border border-grid-300 rounded-lg px-3 py-2">
          <GitBranch className="h-3.5 w-3.5" />
          {withStrategy.length} clients
        </div>
      </div>

      {/* Template Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {(Object.entries(STRATEGY_TEMPLATE_LABELS) as [StrategyType, string][]).map(([key, label]) => (
          <div key={key} className="bg-white rounded-xl border border-grid-300 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider", serviceTypeStyle(key))}>
                {key === "adam_license" ? "A.D.A.M." : key === "b2g" ? "B2G" : "E2E"}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-2 mt-1">
              {key === "end_to_end" && "11 sections — strategy, revenue, ops, roadmap"}
              {key === "b2g"         && "11 sections — procurement, CPV, pipeline, compliance"}
              {key === "adam_license" && "12 sections — implementation, workflows, KPIs"}
            </p>
            <p className="text-[11px] text-muted-2 mt-2 font-mono">
              {counts[key]} client{counts[key] !== 1 ? "s" : ""} on this track
            </p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-grid-300 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                filter === f.value
                  ? "bg-highlight text-white"
                  : "text-muted hover:text-foreground hover:bg-grid-300"
              )}
            >
              {f.label}
              <span className={cn("ml-1.5 font-mono", filter === f.value ? "opacity-80" : "text-muted-2")}>
                {counts[f.value as FilterType] ?? counts.all}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full h-9 pl-9 pr-3 text-sm border border-grid-500 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
          />
        </div>
      </div>

      {/* With Strategy */}
      {hasStrategy.length > 0 && (
        <div className="mb-6">
          <p className="label-mono px-1 mb-3">Strategy documented ({hasStrategy.length})</p>
          <div className="space-y-2">
            {hasStrategy.map((client) => (
              <StrategyRow key={client.id} client={client} />
            ))}
          </div>
        </div>
      )}

      {/* No Strategy Yet */}
      {noStrategy.length > 0 && (
        <div>
          <p className="label-mono px-1 mb-3">No strategy yet ({noStrategy.length})</p>
          <div className="space-y-2">
            {noStrategy.map((client) => (
              <StrategyRow key={client.id} client={client} empty />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-grid-300 p-10 text-center">
          <p className="text-sm text-muted-2">No clients match your filters.</p>
        </div>
      )}
    </div>
  );
}

function StrategyRow({ client, empty = false }: { client: Client; empty?: boolean }) {
  const preview = client.strategy_notes
    ?.split("\n")
    .find((l) => l.trim() && !l.startsWith("#"))
    ?.slice(0, 120);

  const updatedDate = new Date(client.updated_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Link
      href={`/admin/clients/${client.id}?tab=strategy`}
      className="group flex items-center gap-4 bg-white rounded-xl border border-grid-300 px-5 py-3.5 hover:border-highlight/30 hover:shadow-sm transition-all"
    >
      {/* Icon */}
      <div className="shrink-0 w-8 h-8 rounded-lg bg-grid-300 flex items-center justify-center">
        <FileText className={cn("h-4 w-4", empty ? "text-muted-2" : "text-highlight")} />
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground truncate">{client.company_name}</span>
          {client.strategy_type && (
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider shrink-0", serviceTypeStyle(client.strategy_type))}>
              {serviceTypeLabel(client.strategy_type)}
            </span>
          )}
          {!client.strategy_type && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-grid-300 text-muted-2 shrink-0">
              No type set
            </span>
          )}
        </div>
        {!empty && preview && (
          <p className="text-xs text-muted-2 mt-0.5 truncate">{preview}</p>
        )}
        {empty && (
          <p className="text-xs text-muted-2 mt-0.5 italic">No strategy notes — click to load template</p>
        )}
      </div>

      {/* Meta */}
      <div className="shrink-0 text-right hidden sm:block">
        <p className="text-xs text-muted-2 font-mono">{client.client_ref ?? "—"}</p>
        <p className="text-[11px] text-muted-2 mt-0.5">Updated {updatedDate}</p>
      </div>

      <ArrowRight className="h-4 w-4 text-muted-2 shrink-0 group-hover:text-highlight transition-colors" />
    </Link>
  );
}
