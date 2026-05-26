"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import type { ClientRequest, ClientRequestStatus, NoteDocumentType } from "@/lib/supabase/types";

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ClientRequestStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending:      { label: "Pending review",  icon: Clock,          color: "#d97706", bg: "#fffbeb" },
  acknowledged: { label: "Acknowledged",    icon: AlertCircle,    color: "#0369a1", bg: "#f0f9ff" },
  resolved:     { label: "Resolved",        icon: CheckCircle2,   color: "#16a34a", bg: "#f0fdf4" },
  declined:     { label: "Declined",        icon: XCircle,        color: "#dc2626", bg: "#fef2f2" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

interface RequestCardProps {
  request: ClientRequest;
}

function RequestCard({ request }: RequestCardProps) {
  const cfg = STATUS_CONFIG[request.status];
  const Icon = cfg.icon;

  return (
    <div className="rounded-xl border border-grid-300 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
          {request.section_id && (
            <span className="text-[11px] font-mono text-muted-2 bg-grid-300 px-1.5 py-0.5 rounded">
              §{request.section_id}
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-2 font-mono shrink-0">{formatDate(request.created_at)}</span>
      </div>

      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-3">{request.content}</p>

      {request.admin_response && (
        <div className="border-t border-grid-300 pt-3 mt-3">
          <p className="text-[11px] text-muted-2 font-semibold uppercase tracking-wider mb-1.5">Response from Andy&apos;K Group</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{request.admin_response}</p>
          {request.admin_responded_at && (
            <p className="text-[11px] text-muted-2 mt-1.5 font-mono">{formatDate(request.admin_responded_at)}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface ClientRequestFormProps {
  documentType: NoteDocumentType;
  documentId: string;
  sections?: { id: string; title: string }[];
}

export default function ClientRequestForm({
  documentType,
  documentId,
  sections,
}: ClientRequestFormProps) {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/client-requests?documentType=${documentType}&documentId=${documentId}`)
      .then((r) => r.json())
      .then((data) => { setRequests(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [documentType, documentId]);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/client-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_type: documentType,
        document_id: documentId,
        section_id: sectionId || undefined,
        content: content.trim(),
      }),
    });

    if (!res.ok) {
      setError("Failed to submit request. Please try again.");
      setSubmitting(false);
      return;
    }

    const created: ClientRequest = await res.json();
    setRequests((prev) => [created, ...prev]);
    setContent("");
    setSectionId("");
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div className="mt-6">
      <p className="label-mono mb-3">Request a Change</p>

      {/* Form */}
      <div className="rounded-xl border border-grid-300 bg-white p-4 mb-4">
        {sections && sections.length > 0 && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-muted-2 mb-1">Section (optional)</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full text-sm border border-grid-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 text-foreground"
            >
              <option value="">— General request —</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label className="block text-xs font-medium text-muted-2 mb-1">Your request</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe what you'd like changed or clarified…"
            rows={4}
            className="w-full text-sm border border-grid-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 text-foreground placeholder:text-muted-2 resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-2">Our team will review your request and respond within 2 business days.</p>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0",
              submitted
                ? "bg-green-600 text-white"
                : "bg-highlight text-white hover:bg-highlight/90 disabled:opacity-40",
            )}
          >
            {submitted ? "Submitted" : submitting ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </div>

      {/* Existing requests */}
      {loading ? (
        <p className="text-xs text-muted-2 py-4 text-center">Loading…</p>
      ) : requests.length > 0 ? (
        <div>
          <p className="label-mono mb-2">Previous Requests ({requests.length})</p>
          <div className="space-y-3">
            {requests.map((r) => <RequestCard key={r.id} request={r} />)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
