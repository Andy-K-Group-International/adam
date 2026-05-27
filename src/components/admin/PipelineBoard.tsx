"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { listLeads, updateLead } from "@/lib/supabase/queries/leads";
import { updateClientStage } from "@/lib/supabase/queries/clients";
import type { Lead, StrategyType } from "@/lib/supabase/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import PipelineColumn from "./pipeline/PipelineColumn";
import PipelineCard from "./pipeline/PipelineCard";
import { PIPELINE_COLUMNS, type PipelineItem, type PipelineStage } from "./pipeline/types";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Extended client row from joined query ──────────────────────────────────

interface RawProposal {
  id: string;
  addons: {
    currency: string;
    billingCycle: string;
    recurringItems: { name: string; monthly: number }[];
    oneTimeItems: { name: string; amount: number }[];
  } | null;
  status: string;
}

interface RawInvoice {
  id: string;
  total_amount: number;
  currency: string;
  status: string;
}

interface ClientWithExtras {
  id: string;
  client_ref: string | null;
  company_name: string;
  contact_name: string;
  stage: string;
  strategy_type: StrategyType | null;
  billing_currency: string | null;
  assigned_to: string | null;
  updated_at: string;
  proposals: RawProposal[];
  invoices: RawInvoice[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000));
}

function computeDealValue(client: ClientWithExtras): { value: number; currency: string } | undefined {
  const invoiceTotal = client.invoices
    .filter((i) => i.status !== "cancelled")
    .reduce((s, i) => s + (i.total_amount ?? 0), 0);
  if (invoiceTotal > 0) {
    const currency = client.invoices.find((i) => i.status !== "cancelled")?.currency ?? "EUR";
    return { value: invoiceTotal, currency };
  }

  const active = client.proposals.find((p) =>
    ["confirmed", "published", "sent", "approved"].includes(p.status)
  );
  if (active?.addons) {
    const { billingCycle, recurringItems, oneTimeItems, currency } = active.addons;
    const monthly = (recurringItems ?? []).reduce((s, i) => s + (i.monthly ?? 0), 0);
    const oneTime = (oneTimeItems ?? []).reduce((s, i) => s + (i.amount ?? 0), 0);
    const mult = billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1;
    const value = monthly * mult + oneTime;
    if (value > 0) return { value, currency: currency ?? "EUR" };
  }

  return undefined;
}

function leadToItem(lead: Lead): PipelineItem {
  const stage: PipelineStage =
    lead.status === "qualified" ? "qualified" : "lead";
  return {
    id: `lead-${lead.id}`,
    itemType: "lead",
    companyName: lead.company ?? lead.name,
    contactName: lead.name,
    stage,
    serviceType: lead.service_interest ?? undefined,
    leadScore: lead.metadata?.score,
    daysInStage: daysSince(lead.updated_at),
    assignedTo: null,
    href: `/admin/leads/${lead.id}`,
  };
}

function clientToItem(client: ClientWithExtras): PipelineItem {
  const deal = computeDealValue(client);
  const stage = (client.stage as PipelineStage) ?? "questionnaire";
  return {
    id: `client-${client.id}`,
    itemType: "client",
    companyName: client.company_name,
    contactName: client.contact_name,
    clientRef: client.client_ref ?? undefined,
    stage,
    serviceType: client.strategy_type ?? undefined,
    daysInStage: daysSince(client.updated_at),
    dealValue: deal?.value,
    currency: deal?.currency ?? client.billing_currency ?? "EUR",
    assignedTo: client.assigned_to,
    href: `/admin/clients/${client.id}`,
  };
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PipelineBoard() {
  const [items, setItems] = useState<PipelineItem[] | undefined>(undefined);
  const [activeItem, setActiveItem] = useState<PipelineItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = useRef(createSupabaseClient()).current;

  const fetchData = useCallback(async () => {
    try {
      const [leadsData, clientsResult] = await Promise.all([
        listLeads(supabase).catch(() => [] as Lead[]),
        supabase
          .from("clients")
          .select("id, client_ref, company_name, contact_name, stage, strategy_type, billing_currency, assigned_to, updated_at, proposals(id, addons, status), invoices(id, total_amount, currency, status)")
          .order("updated_at", { ascending: false }),
      ]);

      if (clientsResult.error) {
        throw new Error(`Clients query failed: ${clientsResult.error.message}`);
      }

      const clientsData = (clientsResult.data ?? []) as ClientWithExtras[];

      const activeLeads = leadsData.filter(
        (l) => !["rejected", "converted"].includes(l.status)
      );

      setItems([
        ...activeLeads.map(leadToItem),
        ...clientsData.map(clientToItem),
      ]);
    } catch {
      setErrorMsg("Failed to load pipeline data.");
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ── Filtered + grouped ───────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.toLowerCase();
    return items.filter((item) => {
      if (q && !item.companyName.toLowerCase().includes(q)) return false;
      if (filterService && item.serviceType !== filterService) return false;
      return true;
    });
  }, [items, search, filterService]);

  const grouped = useMemo(() =>
    PIPELINE_COLUMNS.map((col) => {
      const colItems = filtered.filter((i) => i.stage === col.id);
      const revenue = colItems.reduce((s, i) => s + (i.dealValue ?? 0), 0);
      return { ...col, items: colItems, revenue };
    }),
    [filtered]
  );

  // ── DnD handlers ─────────────────────────────────────────────────────────

  function onDragStart({ active }: DragStartEvent) {
    setActiveItem(filtered.find((i) => i.id === active.id) ?? null);
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveItem(null);
    if (!over) return;

    const itemId = active.id as string;
    const newStage = over.id as PipelineStage;
    const currentItem = items?.find((i) => i.id === itemId);
    if (!currentItem || currentItem.stage === newStage) return;

    // Optimistic update
    setItems((prev) =>
      prev?.map((i) => (i.id === itemId ? { ...i, stage: newStage } : i))
    );

    try {
      if (itemId.startsWith("lead-")) {
        const rawId = itemId.slice(5);
        if (newStage === "qualified") {
          await updateLead(supabase, rawId, { status: "qualified" });
        } else if (newStage === "lead") {
          await updateLead(supabase, rawId, { status: "contacted" });
        }
        // Moving a lead to client stages requires conversion — no-op here
      } else {
        const rawId = itemId.slice(7); // strip "client-"
        // Only update if it's a valid ClientStage or extended stage
        if (!["lead", "qualified"].includes(newStage)) {
          await updateClientStage(supabase, rawId, newStage);
        }
      }
    } catch {
      // Revert
      setErrorMsg("Failed to update stage — refreshing.");
      await fetchData();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (items === undefined) {
    return <LoadingSpinner className="min-h-[40vh]" />;
  }

  const hasFilters = search !== "" || filterService !== "";

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm bg-white border border-grid-300 rounded-lg text-foreground placeholder:text-muted-2 focus:outline-none focus:border-grid-700 w-52"
          />
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </div>

        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="text-sm bg-white border border-grid-300 rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-grid-700"
        >
          <option value="">All services</option>
          <option value="b2b">B2B</option>
          <option value="b2g">B2G</option>
          <option value="adam_license">ADAM</option>
          <option value="end_to_end">E2E</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilterService(""); }}
            className="flex items-center gap-1 text-xs text-muted-2 hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-muted-2 font-mono">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="flex items-center justify-between text-sm text-error bg-error/8 border border-error/20 px-3 py-2 rounded-lg">
          {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-3 text-error/60 hover:text-error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="overflow-x-auto pb-4 -mx-1 px-1">
          <div className="flex gap-3" style={{ minWidth: "max-content" }}>
            {grouped.map((col) => (
              <div key={col.id} className="w-[196px] flex-shrink-0 flex flex-col">
                <PipelineColumn
                  id={col.id}
                  label={col.label}
                  accentColor={col.accent}
                  items={col.items}
                  revenue={col.revenue}
                />
              </div>
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeItem ? <PipelineCard item={activeItem} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
