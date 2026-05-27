"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { listLeads, convertLeadToClient } from "@/lib/supabase/queries/leads";
import { approveDemoForNda, rejectDemoRequest } from "@/app/actions/leads";
import type { Lead, LeadStatus } from "@/lib/supabase/types";
import { scoreTier } from "@/lib/lead-scoring";
import Link from "next/link";
import { Plus, ArrowRight, Send, XCircle, Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type StatusFilter = "" | LeadStatus;
type TabView = "leads" | "demo_requests";

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

// ─── Demo Requests Tab ────────────────────────────────────────────────────────

function DemoRequestsTab({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) {
  const demoLeads = leads.filter((l) => l.metadata?.demo_request === true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async (leadId: string) => {
    setActioningId(leadId);
    try {
      await approveDemoForNda(leadId);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    setActioningId(showRejectModal);
    try {
      await rejectDemoRequest(showRejectModal, rejectReason.trim() || undefined);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
      setShowRejectModal(null);
      setRejectReason("");
    }
  };

  if (demoLeads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-grid-300 py-16 text-center">
        <p className="text-muted-2 text-sm">No demo requests yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {demoLeads.map((lead) => {
          const meta = lead.metadata;
          const q = (meta?.questionnaire ?? {}) as Record<string, string>;
          const canAct = lead.status === "new" || lead.status === "contacted";
          const isApproved = lead.status === "qualified";

          return (
            <div key={lead.id} className="bg-white rounded-xl border border-grid-300 overflow-hidden">
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-sm font-semibold text-foreground hover:text-highlight transition-colors"
                    >
                      {lead.name}
                    </Link>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      leadStatusStyle(lead.status)
                    )}>
                      {leadStatusLabel(lead.status)}
                    </span>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded">
                        <Send className="h-3 w-3" /> NDA invite sent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-2 mb-2">{lead.email}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1.5">
                    {lead.company && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-2">Company</p>
                        <p className="text-xs text-foreground">{lead.company}</p>
                      </div>
                    )}
                    {q.website && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-2">Website</p>
                        <a href={q.website.startsWith("http") ? q.website : `https://${q.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-highlight hover:underline inline-flex items-center gap-1">
                          <Globe className="h-3 w-3" />{q.website}
                        </a>
                      </div>
                    )}
                    {q.role && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-2">Role</p>
                        <p className="text-xs text-foreground">{q.role}</p>
                      </div>
                    )}
                    {q.company_size && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-2">Size</p>
                        <p className="text-xs text-foreground inline-flex items-center gap-1"><Users className="h-3 w-3 text-muted-2" />{q.company_size}</p>
                      </div>
                    )}
                    {q.country && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-2">Country</p>
                        <p className="text-xs text-foreground">{q.country}</p>
                      </div>
                    )}
                    {q.use_case && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-2">Use Case</p>
                        <p className="text-xs text-foreground">{q.use_case}</p>
                      </div>
                    )}
                    {q.how_heard && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-2">Source</p>
                        <p className="text-xs text-foreground">{q.how_heard}</p>
                      </div>
                    )}
                  </div>

                  {q.challenge && (
                    <div className="mt-2 p-3 bg-grid-300/30 rounded-lg border-l-2 border-highlight/30">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-2 mb-1">Challenge</p>
                      <p className="text-xs text-muted leading-relaxed">{q.challenge}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-muted-2">{formatDate(lead.created_at)}</span>
                  {canAct && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(lead.id)}
                        disabled={actioningId === lead.id}
                        className="inline-flex items-center gap-1.5 bg-success/10 text-success border border-success/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-success/20 transition-colors disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {actioningId === lead.id ? "Sending…" : "Approve for NDA"}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(lead.id)}
                        disabled={actioningId === lead.id}
                        className="inline-flex items-center gap-1.5 bg-error/10 text-error border border-error/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-error/20 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl border border-grid-300 p-6 max-w-md w-full shadow-xl">
            <h3 className="text-base font-semibold text-foreground mb-1">Reject Demo Request</h3>
            <p className="text-sm text-muted-2 mb-4">A polite rejection email will be sent to the applicant.</p>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Reason (optional — shown to applicant)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. The use case is not aligned with our current implementation focus."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-grid-500 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(""); }}
                className="px-4 py-2 text-sm text-muted-2 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!!actioningId}
                className="inline-flex items-center gap-2 bg-error/10 text-error border border-error/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-error/20 transition-colors disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {actioningId ? "Rejecting…" : "Send Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabView>("leads");
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

  const demoRequestCount = leads.filter((l) => l.metadata?.demo_request === true && (l.status === "new" || l.status === "contacted")).length;
  const regularLeads = leads.filter((l) => !l.metadata?.demo_request);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Leads</h1>
          <p className="text-muted text-sm mt-1">Track and qualify inbound leads.</p>
        </div>
        <Link
          href="/admin/leads/new"
          className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-grid-300">
        <button
          onClick={() => setTab("leads")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            tab === "leads"
              ? "border-highlight text-highlight"
              : "border-transparent text-muted-2 hover:text-foreground"
          )}
        >
          All Leads
        </button>
        <button
          onClick={() => setTab("demo_requests")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-2",
            tab === "demo_requests"
              ? "border-highlight text-highlight"
              : "border-transparent text-muted-2 hover:text-foreground"
          )}
        >
          Demo Requests
          {demoRequestCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-error text-white rounded-full">
              {demoRequestCount}
            </span>
          )}
        </button>
      </div>

      {tab === "demo_requests" ? (
        <DemoRequestsTab leads={leads} onRefresh={fetchLeads} />
      ) : (
        <>
          <div className="mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-sm border border-grid-500 rounded-lg px-3 h-10 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
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
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Score</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Created</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {regularLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-2">
                        No leads found.
                      </td>
                    </tr>
                  ) : (
                    regularLeads.map((lead) => (
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
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", sourceStyle(lead.source))}>
                            {sourceLabel(lead.source)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {lead.metadata?.score != null ? (() => {
                            const tier = scoreTier(lead.metadata!.score);
                            return (
                              <span className={cn(
                                "inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
                                tier.color === "success" && "text-success",
                                tier.color === "warning" && "text-warning",
                                tier.color === "error"   && "text-error",
                              )}>
                                {lead.metadata!.score}
                                <span className="font-normal text-muted-2">/100</span>
                              </span>
                            );
                          })() : <span className="text-xs text-muted-2">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", leadStatusStyle(lead.status))}>
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
        </>
      )}
    </div>
  );
}
