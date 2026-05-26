"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { listAllInvoices } from "@/lib/supabase/queries/invoices";
import { listClients } from "@/lib/supabase/queries/clients";
import { listLeads } from "@/lib/supabase/queries/leads";
import { listAllContracts } from "@/lib/supabase/queries/contracts";
import { listProposals } from "@/lib/supabase/queries/proposals";
import { getHealthTier } from "@/components/admin/HealthScoreBadge";
import type { Invoice, Client, Lead, Contract, Proposal } from "@/lib/supabase/types";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, AlertCircle, Download, DollarSign,
  Users, Target, Activity, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClientWithHealth = Client & { primary_contact: { name: string; email: string } | null };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(n);
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function last6MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isThisMonth(dateStr: string | null | undefined) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportClients(clients: ClientWithHealth[]) {
  const headers = ["Client Ref", "Company", "Stage", "Contact Name", "Contact Email", "Health Score", "Created At"];
  const rows = clients.map((c) => [
    c.client_ref ?? "",
    c.company_name,
    c.stage,
    c.primary_contact?.name ?? c.contact_name,
    c.primary_contact?.email ?? c.contact_email,
    String(c.health_score ?? ""),
    formatDate(c.created_at),
  ]);
  downloadCSV(`adam-clients-${new Date().toISOString().slice(0, 10)}.csv`, rows, headers);
}

function exportInvoices(invoices: Invoice[], clients: ClientWithHealth[]) {
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.company_name]));
  const headers = ["Invoice Number", "Client", "Status", "Currency", "Total Amount", "Due Date", "Paid At", "Created At"];
  const rows = invoices.map((inv) => [
    inv.invoice_number,
    clientMap[inv.client_id] ?? inv.client_id,
    inv.status,
    inv.currency,
    String(inv.total_amount),
    inv.due_date ? formatDate(inv.due_date) : "",
    inv.paid_at ? formatDate(inv.paid_at) : "",
    formatDate(inv.created_at),
  ]);
  downloadCSV(`adam-invoices-${new Date().toISOString().slice(0, 10)}.csv`, rows, headers);
}

function exportPipeline(clients: ClientWithHealth[], proposals: Proposal[]) {
  const headers = ["Client Ref", "Company", "Stage", "Proposal Status", "Service Type", "Health Score", "Created At"];
  const proposalMap: Record<string, Proposal> = {};
  proposals.forEach((p) => { if (p.client_id) proposalMap[p.client_id] = p; });
  const rows = clients.map((c) => [
    c.client_ref ?? "",
    c.company_name,
    c.stage,
    proposalMap[c.id]?.status ?? "",
    proposalMap[c.id]?.service_type ?? c.strategy_type ?? "",
    String(c.health_score ?? ""),
    formatDate(c.created_at),
  ]);
  downloadCSV(`adam-pipeline-${new Date().toISOString().slice(0, 10)}.csv`, rows, headers);
}

// ─── Sub-components ───────────────────────────────────────���───────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-xs text-muted-2 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatCard({
  label, value, sub, accent = false, icon: Icon,
}: {
  label: string; value: string; sub?: string; accent?: boolean; icon?: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-xl border border-grid-300 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-2 font-mono uppercase tracking-wider mb-1">{label}</p>
          <p className={cn("text-2xl font-bold tracking-tight", accent ? "text-highlight" : "text-foreground")}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted-2 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-highlight/8 shrink-0">
            <Icon className="h-4 w-4 text-highlight" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-grid-300 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-highlight">{fmt(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

// ─── Donut label ──────────────────────────────────────────────────────────────

const HEALTH_COLORS: Record<string, string> = {
  Excellent: "#2e7d5e",
  Good:      "#d4a017",
  "At Risk": "#f97316",
  Critical:  "#c9707d",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [invoices,  setInvoices]  = useState<Invoice[] | undefined>(undefined);
  const [clients,   setClients]   = useState<ClientWithHealth[] | undefined>(undefined);
  const [leads,     setLeads]     = useState<Lead[] | undefined>(undefined);
  const [contracts, setContracts] = useState<Contract[] | undefined>(undefined);
  const [proposals, setProposals] = useState<Proposal[] | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      listAllInvoices(supabase).catch(() => [] as Invoice[]),
      listClients(supabase).catch(() => [] as ClientWithHealth[]),
      listLeads(supabase).catch(() => [] as Lead[]),
      listAllContracts(supabase).catch(() => [] as Contract[]),
      listProposals(supabase).catch(() => [] as Proposal[]),
    ]).then(([inv, cl, le, co, pr]) => {
      setInvoices(inv);
      setClients(cl as ClientWithHealth[]);
      setLeads(le);
      setContracts(co);
      setProposals(pr);
    });
  }, []);

  const loading = [invoices, clients, leads, contracts, proposals].some((d) => d === undefined);
  if (loading) return <LoadingSpinner className="min-h-[60vh]" />;

  const inv = invoices!;
  const cl  = clients!;
  const le  = leads!;
  const co  = contracts!;
  const pr  = proposals!;

  // ── Revenue ──
  const totalRevenue    = inv.filter((i) => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);
  const outstanding     = inv.filter((i) => i.status === "sent").reduce((s, i) => s + i.total_amount, 0);
  const overdueAmt      = inv.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total_amount, 0);
  const mrr             = inv.filter((i) => i.status === "sent").reduce((s, i) => s + i.total_amount, 0);

  const monthKeys = last6MonthKeys();
  const revenueByMonth = monthKeys.map((mk) => {
    const label = monthLabel(new Date(mk + "-01"));
    const amount = inv
      .filter((i) => i.status === "paid" && i.paid_at && monthKey(i.paid_at) === mk)
      .reduce((s, i) => s + i.total_amount, 0);
    return { month: label, amount };
  });

  // ── Pipeline ──
  const totalLeads         = le.length;
  const convertedLeads     = le.filter((l) => l.status === "converted").length;
  const conversionRate     = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const stageCount: Record<string, number> = {};
  cl.forEach((c) => { stageCount[c.stage] = (stageCount[c.stage] ?? 0) + 1; });
  const pipelineValue = pr
    .filter((p) => ["published", "sent", "changes_requested"].includes(p.status))
    .reduce((s, p) => {
      const recurring = (p.addons?.recurringItems ?? []).reduce((a, i) => a + (Number(i.monthly) || 0), 0);
      return s + recurring;
    }, 0);

  // Average days lead → client
  const convertedWithDates = le.filter((l) => l.status === "converted" && l.converted_to_client_id && l.created_at);
  let avgDaysToConvert = 0;
  if (convertedWithDates.length > 0) {
    const clientCreatedMap = Object.fromEntries(cl.map((c) => [c.id, c.created_at]));
    const totalDays = convertedWithDates.reduce((s, l) => {
      const clientDate = l.converted_to_client_id ? clientCreatedMap[l.converted_to_client_id] : null;
      if (!clientDate) return s;
      return s + Math.round((new Date(clientDate).getTime() - new Date(l.created_at).getTime()) / 86_400_000);
    }, 0);
    avgDaysToConvert = Math.round(totalDays / convertedWithDates.length);
  }

  // ── Client health ──
  const healthDist: Record<string, number> = { Excellent: 0, Good: 0, "At Risk": 0, Critical: 0 };
  const scoredClients = cl.filter((c) => c.health_score !== null);
  scoredClients.forEach((c) => { healthDist[getHealthTier(c.health_score!)]++; });
  const healthPieData = Object.entries(healthDist)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const atRiskClients = cl
    .filter((c) => c.health_score !== null && c.health_score < 60)
    .sort((a, b) => (a.health_score ?? 0) - (b.health_score ?? 0));

  // ── Activity this month ──
  const newLeadsMonth     = le.filter((l) => isThisMonth(l.created_at)).length;
  const newClientsMonth   = cl.filter((c) => isThisMonth(c.created_at)).length;
  const signedMonth       = co.filter((c) => isThisMonth(c.client_signed_at)).length;
  const invoicesSentMonth = inv.filter((i) => isThisMonth(i.created_at) && i.status !== "draft").length;
  const invoicesPaidMonth = inv.filter((i) => isThisMonth(i.paid_at)).length;

  const STAGE_LABELS: Record<string, string> = {
    questionnaire: "Questionnaire", proposal: "Proposal", strategy: "Strategy",
    contract: "Contract", invoice: "Invoice", kickoff: "Kick-off",
  };

  return (
    <div className="max-w-[1200px]">
      {/* Page header */}
      <div className="mb-8">
        <p className="label-mono mb-2">Andy'K Group International LTD — A.D.A.M.</p>
        <h1 className="text-2xl font-serif font-semibold text-foreground">Reports & Analytics</h1>
        <p className="text-muted text-sm mt-1">Live data across revenue, pipeline, and client health.</p>
      </div>

      {/* ── Section 1: Revenue ── */}
      <section className="mb-12">
        <SectionHeader title="Revenue Overview" subtitle="Based on all invoices in GBP" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Revenue" value={fmt(totalRevenue)} sub="all paid invoices" icon={DollarSign} />
          <StatCard label="Outstanding" value={fmt(outstanding)} sub="sent, not yet paid" />
          <StatCard label="Overdue" value={fmt(overdueAmt)} sub="past due date" accent={overdueAmt > 0} icon={overdueAmt > 0 ? AlertCircle : undefined} />
          <StatCard label="MRR (est.)" value={fmt(mrr)} sub="active sent invoices" icon={TrendingUp} />
        </div>

        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <p className="text-xs font-mono text-muted-2 uppercase tracking-wider mb-4">Revenue by Month (last 6 months)</p>
          {revenueByMonth.every((d) => d.amount === 0) ? (
            <p className="text-sm text-muted-2 text-center py-8">No paid invoices in the last 6 months.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByMonth} barSize={32} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fontFamily: "'Courier New', monospace", fill: "#8b93a8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fontFamily: "'Courier New', monospace", fill: "#8b93a8" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(201,112,125,0.06)" }} />
                <Bar dataKey="amount" fill="#c9707d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── Section 2: Pipeline ── */}
      <section className="mb-12">
        <SectionHeader title="Pipeline Overview" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Leads" value={String(totalLeads)} icon={Target} />
          <StatCard label="Conversion Rate" value={`${conversionRate}%`} sub={`${convertedLeads} of ${totalLeads} converted`} icon={TrendingUp} />
          <StatCard label="Avg. Days to Convert" value={avgDaysToConvert > 0 ? `${avgDaysToConvert}d` : "—"} sub="lead → client" />
          <StatCard label="Pipeline Value" value={pipelineValue > 0 ? fmt(pipelineValue) + "/mo" : "—"} sub="proposals in progress" />
        </div>

        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <p className="text-xs font-mono text-muted-2 uppercase tracking-wider mb-4">Clients by Stage</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(STAGE_LABELS).map(([key, label]) => {
              const count = stageCount[key] ?? 0;
              return (
                <div key={key} className="flex items-center gap-2 bg-grid-300/40 rounded-lg px-3 py-2 min-w-[120px]">
                  <span className="text-lg font-bold text-foreground tabular-nums">{count}</span>
                  <span className="text-xs text-muted-2">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: Client Health ── */}
      <section className="mb-12">
        <SectionHeader title="Client Health Overview" subtitle={`${scoredClients.length} of ${cl.length} clients have a health score`} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <p className="text-xs font-mono text-muted-2 uppercase tracking-wider mb-4">Score Distribution</p>
            {healthPieData.length === 0 ? (
              <p className="text-sm text-muted-2 text-center py-8">No health scores yet.<br />Use the Recalculate button on client pages.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={healthPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {healthPieData.map((entry) => (
                        <Cell key={entry.name} fill={HEALTH_COLORS[entry.name] ?? "#8b93a8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [v, name]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #ede8e2" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {healthPieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: HEALTH_COLORS[entry.name] }} />
                      <span className="text-xs text-muted-2">{entry.name}</span>
                      <span className="text-xs font-semibold text-foreground ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* At Risk list */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-grid-300 p-5">
            <p className="text-xs font-mono text-muted-2 uppercase tracking-wider mb-4">
              At Risk & Critical Clients
              <span className="ml-2 normal-case">({atRiskClients.length})</span>
            </p>
            {atRiskClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-8 w-8 text-success mb-2" />
                <p className="text-sm text-muted-2">All scored clients are healthy.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {atRiskClients.map((c) => {
                  const tier = getHealthTier(c.health_score!);
                  const tierColor = HEALTH_COLORS[tier] ?? "#8b93a8";
                  return (
                    <Link
                      key={c.id}
                      href={`/admin/clients/${c.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-grid-300 hover:border-grid-500 hover:bg-grid-300/20 transition-all group"
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: tierColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-highlight transition-colors">
                          {c.company_name}
                        </p>
                        <p className="text-xs text-muted-2">{STAGE_LABELS[c.stage] ?? c.stage}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className="text-xs font-mono font-bold"
                          style={{ color: tierColor }}
                        >
                          {c.health_score}
                        </span>
                        <p className="text-[10px] text-muted-2">{tier}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 4: Activity ── */}
      <section className="mb-12">
        <SectionHeader title="Activity This Month" subtitle={new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })} />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="New Leads" value={String(newLeadsMonth)} icon={Target} />
          <StatCard label="New Clients" value={String(newClientsMonth)} icon={Users} />
          <StatCard label="Contracts Signed" value={String(signedMonth)} icon={Activity} />
          <StatCard label="Invoices Sent" value={String(invoicesSentMonth)} icon={DollarSign} />
          <StatCard label="Invoices Paid" value={String(invoicesPaidMonth)} icon={CheckCircle} />
        </div>
      </section>

      {/* ── Section 5: Export ── */}
      <section className="mb-12">
        <SectionHeader title="Export Data" subtitle="Download CSV reports for offline analysis" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => exportClients(cl)}
            className="flex items-center gap-3 bg-white rounded-xl border border-grid-300 px-5 py-4 hover:border-highlight/40 hover:shadow-sm transition-all group text-left"
          >
            <div className="p-2 rounded-lg bg-highlight/8 shrink-0">
              <Download className="h-4 w-4 text-highlight" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-highlight transition-colors">All Clients</p>
              <p className="text-xs text-muted-2">{cl.length} records · CSV</p>
            </div>
          </button>

          <button
            onClick={() => exportInvoices(inv, cl)}
            className="flex items-center gap-3 bg-white rounded-xl border border-grid-300 px-5 py-4 hover:border-highlight/40 hover:shadow-sm transition-all group text-left"
          >
            <div className="p-2 rounded-lg bg-highlight/8 shrink-0">
              <Download className="h-4 w-4 text-highlight" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-highlight transition-colors">All Invoices</p>
              <p className="text-xs text-muted-2">{inv.length} records · CSV</p>
            </div>
          </button>

          <button
            onClick={() => exportPipeline(cl, pr)}
            className="flex items-center gap-3 bg-white rounded-xl border border-grid-300 px-5 py-4 hover:border-highlight/40 hover:shadow-sm transition-all group text-left"
          >
            <div className="p-2 rounded-lg bg-highlight/8 shrink-0">
              <Download className="h-4 w-4 text-highlight" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-highlight transition-colors">Pipeline Report</p>
              <p className="text-xs text-muted-2">{cl.length} clients · CSV</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
