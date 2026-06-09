"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, RefreshCw, ShieldCheck } from "lucide-react";

type BVStatus = "pending" | "verified" | "rejected";

interface BusinessVerification {
  id: string;
  client_id: string;
  company_name: string | null;
  registration_number: string | null;
  country: string | null;
  business_email: string | null;
  website: string | null;
  legal_representative_confirmed: boolean;
  status: BVStatus;
  admin_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<BVStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: "Pending",  color: "text-warning bg-warning/8 border-warning/25",  icon: Clock },
  verified: { label: "Verified", color: "text-success bg-success/8 border-success/25",  icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-error bg-error/8 border-error/25",        icon: XCircle },
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface Props {
  clientId: string;
  adminEmail?: string;
  onVerificationChange?: (status: BVStatus) => void;
}

export default function BusinessVerificationTab({ clientId, adminEmail, onVerificationChange }: Props) {
  const [bv, setBv] = useState<BusinessVerification | null | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("business_verifications")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setBv(data ?? null));
  }, [clientId]);

  async function updateStatus(newStatus: "verified" | "rejected") {
    if (newStatus === "rejected" && !notes.trim()) {
      setMsg({ text: "Admin notes are required when rejecting.", ok: false });
      return;
    }
    if (newStatus === "verified") setVerifying(true);
    else setRejecting(true);
    setMsg(null);

    const supabase = createClient();
    const now = new Date().toISOString();

    if (bv?.id) {
      const { error } = await supabase
        .from("business_verifications")
        .update({
          status: newStatus,
          admin_notes: notes || null,
          verified_by: adminEmail ?? null,
          verified_at: newStatus === "verified" ? now : null,
          updated_at: now,
        })
        .eq("id", bv.id);

      if (!error) {
        setBv((prev) => prev ? { ...prev, status: newStatus, admin_notes: notes || null, verified_by: adminEmail ?? null, verified_at: newStatus === "verified" ? now : null } : prev);
        onVerificationChange?.(newStatus);
        setMsg({ text: `Business verification ${newStatus}.`, ok: true });
      } else {
        setMsg({ text: error.message, ok: false });
      }
    } else {
      setMsg({ text: "No verification record found.", ok: false });
    }

    setVerifying(false);
    setRejecting(false);
  }

  if (bv === undefined) return <div className="py-8 text-center text-muted-2 text-sm">Loading…</div>;

  if (!bv) {
    return (
      <div className="max-w-2xl space-y-4">
        <h3 className="text-base font-semibold text-foreground">Business Verification</h3>
        <div className="border border-grid-300 bg-grid-100 px-5 py-8 text-center">
          <ShieldCheck className="h-8 w-8 text-muted-2 mx-auto mb-3" />
          <p className="text-sm text-muted-2">No business verification record submitted yet.</p>
          <p className="text-xs text-muted-2 mt-1">Verification data is collected at questionnaire intake.</p>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[bv.status];
  const Icon = cfg.icon;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Business Verification</h3>
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 border", cfg.color)}>
          <Icon className="h-3.5 w-3.5" />
          {cfg.label}
        </span>
      </div>

      <div className="bg-white border border-grid-300 divide-y divide-grid-300">
        {[
          { label: "Company name",         value: bv.company_name },
          { label: "Registration number",  value: bv.registration_number },
          { label: "Country",              value: bv.country },
          { label: "Business email",       value: bv.business_email },
          { label: "Website",              value: bv.website },
          { label: "Legal rep confirmed",  value: bv.legal_representative_confirmed ? "Yes" : "No" },
          { label: "Submitted",            value: fmt(bv.created_at) },
          { label: "Verified by",          value: bv.verified_by ?? "—" },
          { label: "Verified at",          value: fmt(bv.verified_at) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start gap-4 px-5 py-3">
            <span className="w-40 shrink-0 text-xs font-mono text-muted-2 pt-0.5">{label}</span>
            <span className="text-sm text-foreground">{value ?? "—"}</span>
          </div>
        ))}
        {bv.admin_notes && (
          <div className="flex items-start gap-4 px-5 py-3">
            <span className="w-40 shrink-0 text-xs font-mono text-muted-2 pt-0.5">Admin notes</span>
            <span className="text-sm text-muted">{bv.admin_notes}</span>
          </div>
        )}
      </div>

      {bv.status === "pending" && (
        <div className="border border-grid-300 bg-white p-5 space-y-4">
          <p className="text-xs font-mono text-muted-2 uppercase tracking-wider">Admin decision</p>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-2 block">Admin notes (required for rejection)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes visible to internal team only…"
              className="w-full border border-grid-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-highlight/30 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => updateStatus("verified")}
              disabled={verifying}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white text-sm font-medium hover:bg-success/90 disabled:opacity-50 transition-colors"
            >
              {verifying && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <CheckCircle2 className="h-4 w-4" />
              Verify Business
            </button>
            <button
              onClick={() => updateStatus("rejected")}
              disabled={rejecting}
              className="flex items-center gap-2 px-4 py-2 bg-error text-white text-sm font-medium hover:bg-error/90 disabled:opacity-50 transition-colors"
            >
              {rejecting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p className={cn("text-sm font-mono", msg.ok ? "text-success" : "text-error")}>
          {msg.ok ? "✓ " : "✗ "}{msg.text}
        </p>
      )}
    </div>
  );
}
