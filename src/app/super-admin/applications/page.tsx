"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listLeads, updateLead } from "@/lib/supabase/queries/leads";
import type { Lead, LeadStatus } from "@/lib/supabase/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import { Send, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new:       "New",
  contacted: "Reviewed",
  qualified: "Approved",
  rejected:  "Rejected",
  converted: "Converted",
};

const STATUS_CLS: Record<LeadStatus, string> = {
  new:       "bg-info/10 text-info border-info/20",
  contacted: "bg-warning/10 text-warning border-warning/20",
  qualified: "bg-success/10 text-success border-success/20",
  rejected:  "bg-error/10 text-error border-error/20",
  converted: "bg-highlight/10 text-highlight border-highlight/20",
};

type StatusFilter = "" | LeadStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "",          label: "All" },
  { value: "new",       label: "New" },
  { value: "contacted", label: "Reviewed" },
  { value: "qualified", label: "Approved" },
  { value: "rejected",  label: "Rejected" },
  { value: "converted", label: "Converted" },
];

export default function SuperAdminApplicationsPage() {
  const [leads, setLeads] = useState<Lead[] | undefined>(undefined);
  const [filter, setFilter] = useState<StatusFilter>("");
  const [sending, setSending] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    listLeads(supabase).then(setLeads).catch(() => setLeads([]));
  }, []);

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    const supabase = createClient();
    await updateLead(supabase, leadId, { status });
    setLeads((prev) =>
      prev?.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
  };

  const sendInvite = async (lead: Lead) => {
    setSending(lead.id);
    setResults((prev) => ({ ...prev, [lead.id]: "" }));
    try {
      const res = await fetch("/api/admin/launch-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          email: lead.email,
          name: lead.name,
          company: lead.company,
          plan: (lead.metadata as Record<string, unknown> | null)?.plan ?? null,
        }),
      });
      if (res.ok) {
        setResults((prev) => ({ ...prev, [lead.id]: "sent" }));
        setLeads((prev) =>
          prev?.map((l) =>
            l.id === lead.id
              ? { ...l, launch_invite_sent: true, status: "qualified" as LeadStatus }
              : l
          )
        );
      } else {
        const data = await res.json().catch(() => ({}));
        setResults((prev) => ({ ...prev, [lead.id]: data.error ?? "Failed" }));
      }
    } catch {
      setResults((prev) => ({ ...prev, [lead.id]: "Network error" }));
    }
    setSending(null);
  };

  if (leads === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  const filtered = filter ? leads.filter((l) => l.status === filter) : leads;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">Applications</h1>
        <p className="text-muted text-sm mt-1">
          All license applications and leads. {leads.length} total.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
              filter === f.value
                ? "bg-highlight text-white border-highlight"
                : "bg-white border-grid-300 text-muted-2 hover:border-highlight/40 hover:text-foreground"
            )}
          >
            {f.label}
            {f.value === ""
              ? ` (${leads.length})`
              : ` (${leads.filter((l) => l.status === f.value).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 py-16 text-center">
          <p className="text-muted-2 text-sm">No applications match this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grid-300 bg-grid-100">
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Company / Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-muted-2 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-300">
                {filtered.map((lead) => {
                  const result = results[lead.id];
                  const isSending = sending === lead.id;
                  return (
                    <tr key={lead.id} className="hover:bg-grid-100/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{lead.company || "—"}</p>
                        <p className="text-xs text-muted-2">{lead.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-xs font-mono text-highlight hover:underline"
                        >
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-2 font-mono">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex text-xs font-semibold px-2 py-0.5 rounded border",
                              STATUS_CLS[lead.status]
                            )}
                          >
                            {STATUS_LABEL[lead.status]}
                          </span>
                          {lead.launch_invite_sent && (
                            <span className="inline-flex items-center gap-1 text-xs text-highlight bg-highlight/5 px-2 py-0.5 rounded border border-highlight/20">
                              <Send className="h-3 w-3" />
                              Invited
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {lead.status === "new" && (
                            <button
                              onClick={() => updateStatus(lead.id, "contacted")}
                              className="text-xs px-2.5 py-1 border border-grid-500 text-muted hover:text-foreground hover:border-foreground transition-colors rounded"
                            >
                              Mark Reviewed
                            </button>
                          )}
                          {lead.status === "contacted" && (
                            <>
                              <button
                                onClick={() => updateStatus(lead.id, "qualified")}
                                className="text-xs px-2.5 py-1 border border-success/30 text-success hover:bg-success/5 transition-colors rounded"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(lead.id, "rejected")}
                                className="text-xs px-2.5 py-1 border border-error/30 text-error hover:bg-error/5 transition-colors rounded"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {lead.status === "qualified" && !lead.launch_invite_sent && (
                            <button
                              onClick={() => sendInvite(lead)}
                              disabled={isSending}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-highlight text-white hover:bg-highlight/90 disabled:opacity-50 transition-colors font-medium rounded"
                            >
                              <Send className="h-3 w-3" />
                              {isSending ? "Sending…" : "Send Invite"}
                            </button>
                          )}
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="inline-flex items-center gap-1 text-xs text-highlight hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </Link>
                          {result && result !== "sent" && (
                            <span className="text-xs text-error font-mono">{result}</span>
                          )}
                          {result === "sent" && (
                            <span className="text-xs text-success font-mono">✓ Sent</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
