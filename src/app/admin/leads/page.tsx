"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { listLeads, convertLeadToClient } from "@/lib/supabase/queries/leads";
import type { Lead, LeadStatus } from "@/lib/supabase/types";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type StatusFilter = "" | LeadStatus;

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "rejected", label: "Rejected" },
  { value: "converted", label: "Converted" },
];

function leadStatusStyle(status: LeadStatus): string {
  switch (status) {
    case "new":        return "bg-info/10 text-info";
    case "contacted":  return "bg-warning/10 text-warning";
    case "qualified":  return "bg-success/10 text-success";
    case "rejected":   return "bg-error/10 text-error";
    case "converted":  return "bg-success/10 text-success";
  }
}

function leadStatusLabel(status: LeadStatus): string {
  switch (status) {
    case "new":        return "New";
    case "contacted":  return "Contacted";
    case "qualified":  return "Qualified";
    case "rejected":   return "Rejected";
    case "converted":  return "Converted";
  }
}

function sourceStyle(source: string): string {
  switch (source) {
    case "website":     return "bg-grid-300 text-muted";
    case "referral":    return "bg-highlight/10 text-highlight";
    case "outreach":    return "bg-info/10 text-info";
    case "direct":      return "bg-grid-500 text-foreground";
    case "social":      return "bg-warning/10 text-warning";
    case "partnership": return "bg-success/10 text-success";
    default:            return "bg-grid-300 text-muted";
  }
}

function sourceLabel(source: string): string {
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export default function LeadsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [leads, setLeads] = useState<Lead[] | undefined>(undefined);
  const [converting, setConverting] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    const supabase = createClient();
    try {
      const data = await listLeads(supabase, statusFilter ? { status: statusFilter } : {});
      setLeads(data);
    } catch {
      setLeads([]);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleConvert = async (leadId: string) => {
    setConverting(leadId);
    try {
      const supabase = createClient();
      const client = await convertLeadToClient(supabase, leadId);
      router.push(`/admin/clients/${client.id}`);
    } catch (err) {
      console.error("Failed to convert lead:", err);
      setConverting(null);
    }
  };

  if (leads === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted mt-1">Track and qualify inbound leads.</p>
        </div>
        <Link
          href="/admin/leads/new"
          className="inline-flex items-center gap-2 bg-highlight text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Link>
      </div>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="text-sm border border-grid-500 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Company</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Source</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-2">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-sm font-medium text-foreground hover:text-highlight transition-colors"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-muted-2 mt-0.5">{lead.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      {lead.company || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          sourceStyle(lead.source)
                        )}
                      >
                        {sourceLabel(lead.source)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          leadStatusStyle(lead.status)
                        )}
                      >
                        {leadStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      {lead.status !== "converted" && lead.status !== "rejected" && (
                        <button
                          onClick={() => handleConvert(lead.id)}
                          disabled={converting === lead.id}
                          className="inline-flex items-center gap-1 text-xs font-medium text-highlight hover:text-highlight/80 transition-colors disabled:opacity-50"
                        >
                          {converting === lead.id ? "Converting..." : (
                            <>Convert <ArrowRight className="h-3 w-3" /></>
                          )}
                        </button>
                      )}
                      {lead.converted_to_client_id && (
                        <Link
                          href={`/admin/clients/${lead.converted_to_client_id}`}
                          className="text-xs text-muted-2 hover:text-highlight transition-colors"
                        >
                          View Client
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
