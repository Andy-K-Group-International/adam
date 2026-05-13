"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getLeadById, updateLead, convertLeadToClient } from "@/lib/supabase/queries/leads";
import { qualifyLead, rejectLead } from "@/app/actions/leads";
import { scoreTier } from "@/lib/lead-scoring";
import type { Lead, LeadStatus, LeadSource } from "@/lib/supabase/types";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, User, Mail, Phone, Building2,
  Globe, CheckCircle2, XCircle, AlertTriangle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const STATUS_OPTS: { value: LeadStatus; label: string }[] = [
  { value: "new",       label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "rejected",  label: "Rejected" },
  { value: "converted", label: "Converted" },
];

const SOURCE_OPTS: { value: LeadSource; label: string }[] = [
  { value: "website",     label: "Website" },
  { value: "referral",    label: "Referral" },
  { value: "outreach",    label: "Outreach" },
  { value: "direct",      label: "Direct" },
  { value: "social",      label: "Social Media" },
  { value: "partnership", label: "Partnership" },
];

function statusStyle(s: LeadStatus) {
  switch (s) {
    case "new":       return "bg-info/10 text-info";
    case "contacted": return "bg-warning/10 text-warning";
    case "qualified": return "bg-success/10 text-success";
    case "rejected":  return "bg-error/10 text-error";
    case "converted": return "bg-success/10 text-success";
  }
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-grid-500 rounded-full overflow-hidden">
        <div
          className="h-full bg-highlight rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-foreground w-10 text-right">
        {score}/{max}
      </span>
    </div>
  );
}

function QuestionnaireAnswers({ data }: { data: Record<string, unknown> }) {
  const services = Array.isArray(data.services) ? (data.services as string[]).join(", ") : null;

  const rows: { label: string; value: string | null | undefined }[] = [
    { label: "Services interested in", value: services },
    { label: "Revenue range",          value: data.revenue as string },
    { label: "Timeline",               value: data.timeline as string },
    { label: "Decision authority",     value: data.decision_authority as string },
    { label: "Website",                value: data.website as string },
  ];

  const longFields: { label: string; value: string | null | undefined }[] = [
    { label: "Business description", value: data.business_description as string },
    { label: "Biggest challenge",    value: data.biggest_challenge as string },
  ];

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        {rows.filter((r) => r.value).map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
              {row.label}
            </dt>
            <dd className="text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      {longFields.filter((f) => f.value).map((field) => (
        <div key={field.label}>
          <dt className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            {field.label}
          </dt>
          <dd className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {field.value}
          </dd>
        </div>
      ))}
    </div>
  );
}

export default function LeadDetailPage() {
  const { id: leadId } = useParams<{ id: string }>();
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    getLeadById(supabase, leadId)
      .then((data) => {
        setLead(data);
        setNotes(data.notes || "");
        setStatus(data.status);
      })
      .catch(() => setLead(null));
  }, [leadId]);

  if (lead === undefined) return <LoadingSpinner className="min-h-[60vh]" />;
  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Lead not found.</p>
      </div>
    );
  }

  const meta = lead.metadata;
  const tier = meta ? scoreTier(meta.score) : null;
  const questionnaire = meta?.questionnaire ?? null;
  const canQualify = !["qualified", "rejected", "converted"].includes(lead.status);
  const canConvert = lead.status !== "converted" && lead.status !== "rejected";
  const isRejected = lead.status === "rejected";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const updated = await updateLead(supabase, leadId, {
        notes: notes.trim() || null,
        status,
      });
      setLead(updated);
    } catch (err) {
      console.error("Failed to save lead:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const supabase = createClient();
      const client = await convertLeadToClient(supabase, leadId);
      router.push(`/admin/clients/${client.id}`);
    } catch (err) {
      console.error("Failed to convert lead:", err);
      setIsConverting(false);
    }
  };

  const handleQualify = () => {
    startTransition(async () => {
      await qualifyLead(leadId);
      setLead((l) => l ? { ...l, status: "qualified" } : l);
      setStatus("qualified");
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      await rejectLead(leadId, rejectReason);
      const coolingUntil = new Date();
      coolingUntil.setMonth(coolingUntil.getMonth() + 6);
      setLead((l) => l ? {
        ...l,
        status: "rejected",
        rejected_at: new Date().toISOString(),
        cooling_period_until: coolingUntil.toISOString(),
      } : l);
      setStatus("rejected");
      setShowRejectModal(false);
      setRejectReason("");
    });
  };

  const sourceLabel = SOURCE_OPTS.find((s) => s.value === lead.source)?.label ?? lead.source;

  return (
    <>
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <Link href="/admin/leads" className="text-muted-2 hover:text-foreground transition-colors mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{lead.name}</h1>
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                  statusStyle(lead.status)
                )}>
                  {STATUS_OPTS.find((s) => s.value === lead.status)?.label}
                </span>
              </div>
              <p className="text-sm text-muted-2 mt-0.5">
                {lead.company && <span className="font-medium text-muted">{lead.company} · </span>}
                Added {formatDate(lead.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canQualify && (
              <>
                <button
                  onClick={handleQualify}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 bg-success/10 text-success border border-success/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-success/20 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Qualify
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 bg-error/10 text-error border border-error/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-error/20 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </>
            )}
            {canConvert && lead.status === "qualified" && (
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="inline-flex items-center gap-2 bg-highlight text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors disabled:opacity-50"
              >
                {isConverting ? "Converting..." : (<>Convert to Client <ArrowRight className="h-4 w-4" /></>)}
              </button>
            )}
            {lead.converted_to_client_id && (
              <Link
                href={`/admin/clients/${lead.converted_to_client_id}`}
                className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
              >
                View Client <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Cooling period banner */}
          {isRejected && lead.cooling_period_until && (
            <div className="flex items-center gap-3 bg-error/5 border border-error/20 rounded-xl px-5 py-4">
              <Clock className="h-5 w-5 text-error shrink-0" />
              <div>
                <p className="text-sm font-semibold text-error">Cooling period active</p>
                <p className="text-xs text-muted-2 mt-0.5">
                  New submissions from {lead.email} are blocked until{" "}
                  <strong className="text-muted">{formatDate(lead.cooling_period_until)}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Score card */}
          {meta && tier ? (
            <div className="bg-white rounded-xl border border-grid-300 p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">Lead Score</h3>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                  tier.color === "success" && "bg-success/10 text-success",
                  tier.color === "warning" && "bg-warning/10 text-warning",
                  tier.color === "error"   && "bg-error/10 text-error",
                )}>
                  {tier.label}
                </span>
              </div>

              <div className="flex items-end gap-6 mb-6">
                <div>
                  <p className={cn(
                    "text-5xl font-bold leading-none tabular-nums",
                    tier.color === "success" && "text-success",
                    tier.color === "warning" && "text-warning",
                    tier.color === "error"   && "text-error",
                  )}>
                    {meta.score}
                  </p>
                  <p className="text-xs text-muted-2 mt-1">out of 100</p>
                </div>
                <div className="flex-1 pb-1">
                  <div className="h-2 bg-grid-500 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        tier.color === "success" && "bg-success",
                        tier.color === "warning" && "bg-warning",
                        tier.color === "error"   && "bg-error",
                      )}
                      style={{ width: `${meta.score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {(["revenue", "timeline", "decision_authority"] as const).map((key) => {
                  const dim = meta.breakdown[key];
                  const labels: Record<string, string> = {
                    revenue:            "Revenue",
                    timeline:           "Timeline",
                    decision_authority: "Decision Authority",
                  };
                  return (
                    <div key={key} className="grid grid-cols-[160px_1fr] items-center gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider leading-none mb-0.5">
                          {labels[key]}
                        </p>
                        <p className="text-xs text-muted-2">{dim.label}</p>
                      </div>
                      <ScoreBar score={dim.score} max={dim.max} />
                    </div>
                  );
                })}
              </div>

              {meta.scored_at && (
                <p className="text-xs text-muted-2 mt-4 pt-4 border-t border-grid-300">
                  Scored {formatDate(meta.scored_at)}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-grid-300/50 rounded-xl border border-grid-300 border-dashed px-5 py-6 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-muted-2 shrink-0" />
              <p className="text-sm text-muted-2">No auto-score — this lead was entered manually.</p>
            </div>
          )}

          {/* Contact info */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Contact</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-2 shrink-0" />
                <span className="text-sm text-foreground">{lead.name}</span>
              </div>
              {lead.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-2 shrink-0" />
                  <span className="text-sm text-foreground">{lead.company}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-2 shrink-0" />
                <a href={`mailto:${lead.email}`} className="text-sm text-highlight hover:underline">
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-2 shrink-0" />
                  <span className="text-sm text-foreground">{lead.phone}</span>
                </div>
              )}
              {Boolean(questionnaire?.website) && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-2 shrink-0" />
                  <a
                    href={String(questionnaire!.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-highlight hover:underline truncate"
                  >
                    {String(questionnaire!.website)}
                  </a>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-grid-300">
              <span className="text-xs text-muted-2">Source: </span>
              <span className="text-xs font-medium text-foreground">{sourceLabel}</span>
            </div>
          </div>

          {/* Questionnaire answers */}
          {questionnaire && Object.keys(questionnaire).length > 0 && (
            <div className="bg-white rounded-xl border border-grid-300 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Questionnaire Answers</h3>
              <QuestionnaireAnswers data={questionnaire} />
            </div>
          )}

          {/* Status override */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    status === opt.value
                      ? "bg-highlight text-white border-highlight"
                      : "bg-white text-muted border-grid-500 hover:bg-grid-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Internal notes */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Conversation notes, follow-up actions, context..."
              rows={6}
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
            />
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pb-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-highlight text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/leads" className="text-sm text-muted-2 hover:text-foreground transition-colors px-4 py-2.5">
              Back to Leads
            </Link>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="relative bg-white rounded-2xl border border-grid-300 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-full bg-error/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-error" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Reject Lead</h2>
                <p className="text-xs text-muted-2">A rejection email will be sent to {lead.email}</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Reason <span className="normal-case font-normal text-muted-2">(optional — shown in email)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Budget doesn't align with our minimum engagement, or not our target market at this stage..."
                rows={4}
                autoFocus
                className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-error/30"
              />
            </div>

            <div className="bg-error/5 border border-error/20 rounded-lg px-4 py-3 mb-5">
              <p className="text-xs text-error">
                This lead will be blocked from re-submitting for <strong>6 months</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={isPending}
                className="flex-1 bg-error text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                className="flex-1 bg-grid-300 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
