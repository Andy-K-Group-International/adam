"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText } from "lucide-react";

interface Snapshot {
  id: string;
  email: string;
  terms_version: string | null;
  service_definition_version: string | null;
  plan_name: string | null;
  billing_cycle: string | null;
  price_gbp: number | null;
  ai_mode: string | null;
  accepted_at: string;
  accepted_by_email: string | null;
  business_verification_status: string | null;
  founding_client: boolean;
  founding_code: string | null;
  event_type: string;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export default function AgreementHistoryTab({ clientId }: { clientId: string }) {
  const [snapshots, setSnapshots] = useState<Snapshot[] | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("client_agreement_snapshots")
      .select("*")
      .eq("client_id", clientId)
      .order("accepted_at", { ascending: false })
      .then(({ data }) => setSnapshots(data ?? []));
  }, [clientId]);

  if (snapshots === undefined) return <div className="py-8 text-center text-muted-2 text-sm">Loading…</div>;

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h3 className="text-base font-semibold text-foreground">Agreement History</h3>
        <p className="text-sm text-muted-2 mt-0.5">
          Immutable record of terms and plan accepted at each billing event.
        </p>
      </div>

      {snapshots.length === 0 ? (
        <div className="border border-grid-300 bg-grid-100 px-5 py-10 text-center">
          <FileText className="h-8 w-8 text-muted-2 mx-auto mb-3" />
          <p className="text-sm text-muted-2">No agreement snapshots recorded yet.</p>
          <p className="text-xs text-muted-2 mt-1">Snapshots are created at payment and activation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {snapshots.map((s) => (
            <div key={s.id} className="border border-grid-300 bg-white divide-y divide-grid-300">
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-2 uppercase tracking-wider">
                  {s.event_type} — {fmt(s.accepted_at)}
                </span>
                {s.founding_client && (
                  <span className="text-xs font-mono text-highlight">⭐ Founding Client</span>
                )}
              </div>
              {[
                { label: "Email",                    value: s.email },
                { label: "Plan",                     value: s.plan_name },
                { label: "Billing cycle",            value: s.billing_cycle },
                { label: "Price (GBP)",              value: s.price_gbp ? `£${s.price_gbp}` : null },
                { label: "Terms version",            value: s.terms_version },
                { label: "Service definition",       value: s.service_definition_version },
                { label: "AI mode at acceptance",    value: s.ai_mode },
                { label: "Biz verification status",  value: s.business_verification_status },
                { label: "Accepted by",              value: s.accepted_by_email },
                { label: "Founding code",            value: s.founding_code },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex items-start gap-4 px-5 py-2">
                  <span className="w-44 shrink-0 text-xs font-mono text-muted-2 pt-0.5">{label}</span>
                  <span className="text-sm text-foreground">{value}</span>
                </div>
              ) : null)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
