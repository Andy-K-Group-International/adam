"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { listAllInvoices } from "@/lib/supabase/queries/invoices";
import { listClients } from "@/lib/supabase/queries/clients";
import type { Invoice, InvoiceStatus, Client } from "@/lib/supabase/types";
import Link from "next/link";
import { Plus, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ContextualHelp from "@/components/ui/ContextualHelp";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function statusStyle(status: InvoiceStatus): string {
  switch (status) {
    case "draft":     return "bg-grid-300 text-muted";
    case "sent":      return "bg-info/10 text-info";
    case "paid":      return "bg-success/10 text-success";
    case "overdue":   return "bg-error/10 text-error";
    case "cancelled": return "bg-grid-300 text-muted-2";
  }
}

function statusLabel(status: InvoiceStatus): string {
  switch (status) {
    case "draft":     return "Draft";
    case "sent":      return "Sent";
    case "paid":      return "Paid";
    case "overdue":   return "Overdue";
    case "cancelled": return "Cancelled";
  }
}

function fmtAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[] | undefined>(undefined);
  const [clients, setClients] = useState<Client[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const { user, isCompanyAdmin, isLoading: userLoading } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (userLoading) return;
    const supabase = createClient();
    const userId = isCompanyAdmin ? (user?.auth_id ?? undefined) : undefined;
    try {
      const [invData, clientData] = await Promise.all([
        listAllInvoices(supabase, {
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(clientFilter ? { clientId: clientFilter } : {}),
          userId,
        }),
        listClients(supabase, { userId }),
      ]);
      setInvoices(invData);
      setClients(clientData);
    } catch {
      setInvoices([]);
    }
  }, [statusFilter, clientFilter, userLoading, isCompanyAdmin, user?.auth_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (invoices === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  const clientMap = new Map(clients.map((c) => [c.id, c]));

  // Revenue summary
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total_amount), 0);
  const outstanding = invoices
    .filter((i) => i.status === "sent")
    .reduce((sum, i) => sum + Number(i.total_amount), 0);
  const overdueTotal = invoices
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + Number(i.total_amount), 0);
  const draftCount = invoices.filter((i) => i.status === "draft").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-semibold text-foreground">Invoices</h1>
            <ContextualHelp
              id="admin-invoices"
              title="Invoices"
              description="Invoices track all financial transactions. Implementation begins only after initial payment is confirmed."
              position="right"
            />
          </div>
          <p className="text-muted text-sm mt-1">Manage billing and payments.</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-grid-300 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="label-mono">Revenue Collected</p>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {fmtAmount(totalRevenue, "EUR")}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-grid-300 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-info" />
            <p className="label-mono">Outstanding</p>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {fmtAmount(outstanding, "EUR")}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-grid-300 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-error" />
            <p className="label-mono">Overdue</p>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {fmtAmount(overdueTotal, "EUR")}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-grid-300 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-2" />
            <p className="label-mono">Drafts</p>
          </div>
          <p className="text-xl font-semibold text-foreground">{draftCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-grid-500 rounded-lg px-3 h-10 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="text-sm border border-grid-500 rounded-lg px-3 h-10 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.company_name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                {["Invoice", "Client", "Amount", "Status", "Due Date", "Updated"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-2 text-sm">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const client = clientMap.get(inv.client_id);
                  return (
                    <tr key={inv.id} className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors">
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/invoices/${inv.id}`}
                          className="text-sm font-medium text-foreground hover:text-highlight transition-colors"
                        >
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-2">
                        {client?.company_name ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        {fmtAmount(inv.total_amount, inv.currency)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          statusStyle(inv.status)
                        )}>
                          {statusLabel(inv.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-2">
                        {inv.due_date
                          ? new Date(inv.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-2">
                        {formatDate(inv.updated_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
