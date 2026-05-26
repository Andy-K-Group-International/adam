"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getKycByClientId } from "@/lib/supabase/queries/kyc";
import { verifyKycAction, rejectKycAction } from "@/app/actions/kyc";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { KycVerification, KycStatus, KycDocumentType } from "@/lib/supabase/types";
import { Check, X, Download, ShieldCheck, ShieldX, Clock, AlertTriangle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const STATUS_CONFIG: Record<KycStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending:  { label: "Pending Review",  bg: "bg-warning/10",  text: "text-warning", icon: <Clock className="h-4 w-4" /> },
  verified: { label: "Verified",        bg: "bg-success/10",  text: "text-success", icon: <ShieldCheck className="h-4 w-4" /> },
  rejected: { label: "Rejected",        bg: "bg-error/10",    text: "text-error",   icon: <ShieldX className="h-4 w-4" /> },
  expired:  { label: "Expired",         bg: "bg-grid-300/60", text: "text-muted",   icon: <AlertTriangle className="h-4 w-4" /> },
};

const DOC_LABELS: Record<KycDocumentType, string> = {
  registry_extract:   "Company Registry Extract",
  id_passport:        "ID / Passport",
  power_of_attorney:  "Power of Attorney",
};

function KycStatusBadge({ status }: { status: KycStatus }) {
  const s = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full", s.bg, s.text)}>
      {s.icon}
      {s.label}
    </span>
  );
}

export default function KycTab({ clientId }: { clientId: string }) {
  const { user } = useCurrentUser();
  const [kyc, setKyc] = useState<KycVerification | null | undefined>(undefined);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const supabase = createClient();
    getKycByClientId(supabase, clientId)
      .then((data) => setKyc(data))
      .catch(() => setKyc(null));
  }, [clientId]);

  const openDocument = async (path: string) => {
    const res = await fetch(`/api/kyc/signed-url?path=${encodeURIComponent(path)}`);
    const json = await res.json();
    if (json.url) window.open(json.url, "_blank");
  };

  const handleVerify = async () => {
    if (!kyc) return;
    setSubmitting(true);
    setMsg("");
    const result = await verifyKycAction(kyc.id, user?.id ?? "");
    if (result.error) {
      setMsg(result.error);
    } else {
      setKyc((prev) => prev ? { ...prev, status: "verified", verified_at: new Date().toISOString() } : prev);
      setMsg("KYC verified. Confirmation email sent.");
    }
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!kyc || !rejectReason.trim()) return;
    setSubmitting(true);
    setMsg("");
    const result = await rejectKycAction(kyc.id, rejectReason.trim());
    if (result.error) {
      setMsg(result.error);
    } else {
      setKyc((prev) => prev ? { ...prev, status: "rejected", rejection_reason: rejectReason.trim() } : prev);
      setRejectOpen(false);
      setRejectReason("");
      setMsg("KYC rejected. Client notified by email.");
    }
    setSubmitting(false);
  };

  if (kyc === undefined) return <LoadingSpinner className="py-12" />;

  if (!kyc) {
    return (
      <div className="text-center py-16">
        <div className="h-14 w-14 rounded-full bg-grid-300/50 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-7 w-7 text-muted-2" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No KYC submitted</p>
        <p className="text-xs text-muted-2">The client has not yet submitted KYC verification documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status card */}
      <div className="bg-white rounded-xl border border-grid-300 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-2 mb-2">KYC Status</p>
            <KycStatusBadge status={kyc.status} />
            {kyc.verified_at && (
              <p className="text-xs text-muted-2 mt-2">
                Verified {new Date(kyc.verified_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
          {(kyc.status === "pending" || kyc.status === "rejected") && (
            <div className="flex gap-2">
              <button
                onClick={handleVerify}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-success/10 border border-success/30 text-success text-sm font-medium hover:bg-success/15 transition-colors disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                Verify
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-error/10 border border-error/30 text-error text-sm font-medium hover:bg-error/15 transition-colors disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>
            </div>
          )}
          {kyc.status === "verified" && (
            <button
              onClick={() => setRejectOpen(true)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-grid-500 text-muted-2 text-sm font-medium hover:text-foreground hover:border-highlight/40 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Revoke
            </button>
          )}
        </div>

        {msg && (
          <p className={cn("mt-3 text-sm", msg.includes("error") || msg.includes("Error") ? "text-error" : "text-success")}>
            {msg}
          </p>
        )}

        {kyc.rejection_reason && (
          <div className="mt-4 rounded-lg bg-error/6 border border-error/15 p-3">
            <p className="text-xs font-mono uppercase tracking-wider text-error mb-1">Rejection Reason</p>
            <p className="text-sm text-foreground">{kyc.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Company details */}
      <div className="bg-white rounded-xl border border-grid-300 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Company Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Company Name",        value: kyc.company_name },
            { label: "Registration Number", value: kyc.company_reg_number },
            { label: "VAT Number",          value: kyc.vat_number },
            { label: "Country",             value: kyc.country },
            { label: "Director Name",       value: kyc.director_name },
            { label: "Director Email",      value: kyc.director_email },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-2 mb-0.5">{label}</p>
              <p className="text-sm text-foreground">{value || <span className="text-muted-2">—</span>}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-grid-300 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Documents
          <span className="ml-2 text-xs font-normal text-muted-2">({kyc.documents.length} uploaded)</span>
        </h3>
        {kyc.documents.length === 0 ? (
          <p className="text-sm text-muted-2">No documents uploaded.</p>
        ) : (
          <div className="space-y-2">
            {kyc.documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-grid-300 hover:border-highlight/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-highlight/8 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-highlight" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-2">{DOC_LABELS[doc.type as KycDocumentType] ?? doc.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => openDocument(doc.path)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-grid-500 text-xs text-muted-2 hover:text-foreground hover:border-highlight/40 transition-colors flex-shrink-0 ml-3"
                >
                  <Download className="h-3.5 w-3.5" />
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setRejectOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-grid-300 shadow-xl p-7 w-full max-w-md">
            <h2 className="text-lg font-serif font-semibold text-foreground mb-1">
              {kyc.status === "verified" ? "Revoke KYC" : "Reject KYC"}
            </h2>
            <p className="text-sm text-muted-2 mb-5">
              Provide a reason — this will be emailed to the client with instructions to resubmit.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. The company registry extract is expired. Please provide a document issued within the last 3 months."
              className="w-full rounded-lg border border-grid-500 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={submitting || !rejectReason.trim()}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-error text-white text-sm font-semibold hover:bg-error/90 transition-colors disabled:opacity-50 flex-1"
              >
                <X className="h-4 w-4" />
                {submitting ? "Submitting…" : kyc.status === "verified" ? "Revoke & Notify" : "Reject & Notify"}
              </button>
              <button
                onClick={() => { setRejectOpen(false); setRejectReason(""); }}
                className="h-10 px-4 rounded-xl border border-grid-500 text-sm text-muted-2 hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
