"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Copy, Check, Users, Link2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface ReferredClient {
  id: string;
  company_name: string;
  contact_name: string;
  stage: string;
  created_at: string;
}

interface Props {
  clientId: string;
  referralCode: string | null;
}

const stageColors: Record<string, string> = {
  questionnaire: "bg-grid-300 text-muted",
  proposal:      "bg-info/10 text-info",
  strategy:      "bg-highlight/10 text-highlight",
  contract:      "bg-warning/10 text-warning",
  invoice:       "bg-success/10 text-success",
  kickoff:       "bg-success/10 text-success",
  active:        "bg-success/20 text-success font-semibold",
};

export default function ReferralTab({ clientId, referralCode: initialCode }: Props) {
  const [code, setCode]             = useState<string | null>(initialCode);
  const [copied, setCopied]         = useState(false);
  const [generating, setGenerating] = useState(false);
  const [referrals, setReferrals]   = useState<ReferredClient[]>([]);
  const [loading, setLoading]       = useState(true);

  const referralLink = code ? `https://adam.andykgroup.com/r/${code}` : null;

  useEffect(() => {
    fetchReferrals();
  }, [clientId]);

  async function fetchReferrals() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("clients")
      .select("id, company_name, contact_name, stage, created_at")
      .eq("referred_by", clientId)
      .order("created_at", { ascending: false });
    setReferrals(data ?? []);
    setLoading(false);
  }

  async function generateCode() {
    setGenerating(true);
    const supabase = createClient();
    const newCode = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32])
      .join("");

    const { data, error } = await supabase
      .from("clients")
      .update({ referral_code: newCode })
      .eq("id", clientId)
      .select("referral_code")
      .single();

    if (!error && data) setCode(data.referral_code);
    setGenerating(false);
  }

  async function copyLink() {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const converted = referrals.filter((r) => r.stage === "active" || r.stage === "kickoff").length;
  const pending   = referrals.filter((r) => !["active", "kickoff"].includes(r.stage)).length;

  return (
    <div className="space-y-6">
      {/* Referral link card */}
      <div className="bg-white rounded-xl border border-grid-300 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-4 w-4 text-highlight" />
          <h3 className="text-sm font-semibold text-foreground">Referral Link</h3>
        </div>

        {code ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-grid-200 border border-grid-300 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground truncate">
                {referralLink}
              </div>
              <button
                onClick={copyLink}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border",
                  copied
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-white text-muted border-grid-500 hover:bg-grid-300"
                )}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-muted-2">
              Share this link with the client. When someone clicks it, they are directed to the questionnaire with this client&#8217;s referral tracked automatically.
            </p>
            <button
              onClick={generateCode}
              disabled={generating}
              className="flex items-center gap-1.5 text-xs text-muted-2 hover:text-foreground transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", generating && "animate-spin")} />
              Regenerate code
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Link2 className="h-8 w-8 text-muted-2 mx-auto mb-3" />
            <p className="text-sm text-muted-2 mb-4">No referral link generated yet.</p>
            <button
              onClick={generateCode}
              disabled={generating}
              className="relative inline-flex items-center justify-center gap-2 h-9 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
            >
              {generating ? "Generating…" : "Generate Referral Link"}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {code && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Referred",  value: referrals.length },
            { label: "Converted",       value: converted },
            { label: "In Progress",     value: pending },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-grid-300 p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-2 mt-1 font-mono uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Referred clients list */}
      {code && (
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-highlight" />
            <h3 className="text-sm font-semibold text-foreground">Referred Clients</h3>
          </div>

          {loading ? (
            <div className="text-sm text-muted-2 py-4 text-center">Loading…</div>
          ) : referrals.length === 0 ? (
            <div className="text-sm text-muted-2 py-6 text-center">No referrals yet.</div>
          ) : (
            <div className="divide-y divide-grid-200">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-sm font-medium text-foreground">{r.company_name}</div>
                    <div className="text-xs text-muted-2">{r.contact_name} · {formatDate(r.created_at)}</div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs capitalize", stageColors[r.stage] ?? "bg-grid-300 text-muted")}>
                    {r.stage}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
