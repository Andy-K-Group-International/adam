"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendSubscriptionActivated } from "@/app/actions/email";
import { getReferralInfoForClient, createCommissionForActivation, type ClientReferralInfo } from "@/app/actions/commissions";
import { pricingData } from "@/lib/data";
import type { Client } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Clock, XCircle, CreditCard, RefreshCw, ShieldCheck, Handshake } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  none:                       { label: "No subscription",             color: "text-muted-2 bg-grid-100 border-grid-300",    icon: XCircle },
  paid_pending_verification:  { label: "Paid — Pending Verification", color: "text-warning bg-warning/8 border-warning/25", icon: Clock },
  active:                     { label: "Active",                      color: "text-success bg-success/8 border-success/25", icon: CheckCircle2 },
  suspended:                  { label: "Suspended",                   color: "text-error bg-error/8 border-error/25",       icon: AlertCircle },
  cancelled:                  { label: "Cancelled",                   color: "text-muted-2 bg-grid-100 border-grid-300",    icon: XCircle },
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Best-effort only — plan names are ambiguous across pricingData categories
// (e.g. "Growth" is £699/mo under internal but £1,299/mo under whitelabel),
// so this only returns a value when every match agrees on the price. Always
// just a prefill; the admin confirms or corrects it before activation.
function guessDealValue(planName: string | null, billingCycle: string | null): number | null {
  if (!planName) return null;
  const key = billingCycle === "annual" ? "annualGBP" : "monthlyGBP";
  const matches = new Set<number>();
  for (const category of Object.values(pricingData)) {
    for (const plan of category.plans) {
      if (plan.name.toLowerCase() === planName.toLowerCase()) {
        const price = plan[key as "monthlyGBP" | "annualGBP"];
        if (price != null) matches.add(price);
      }
    }
  }
  return matches.size === 1 ? [...matches][0] : null;
}

function StatusBadge({ status }: { status: string | null }) {
  const cfg = STATUS_CONFIG[status ?? "none"] ?? STATUS_CONFIG.none;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 border", cfg.color)}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

interface Props {
  client: Client;
  onUpdate: (updated: Partial<Client>) => void;
}

export default function BillingTab({ client, onUpdate }: Props) {
  const [activating, setActivating] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paidUntilOverride, setPaidUntilOverride] = useState(client.paid_until ? client.paid_until.slice(0, 10) : "");
  const [savingOverride, setSavingOverride] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [bizVerified, setBizVerified] = useState<boolean | null>(null);
  const [referralInfo, setReferralInfo] = useState<ClientReferralInfo | null | undefined>(undefined);
  const [dealValue, setDealValue] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("business_verifications")
      .select("status")
      .eq("client_id", client.id)
      .maybeSingle()
      .then(({ data }) => {
        setBizVerified(data?.status === "verified");
      });

    getReferralInfoForClient(client.id).then((info) => {
      setReferralInfo(info);
      const guess = guessDealValue(client.plan_name, client.billing_cycle);
      if (info && guess != null) setDealValue(String(guess));
    });
  }, [client.id, client.plan_name, client.billing_cycle]);

  async function handleActivate() {
    if (!bizVerified) {
      setMsg({ text: "Business verification required before activation. Complete verification in the Business Verification tab.", ok: false });
      return;
    }
    const parsedDealValue = Number(dealValue);
    if (referralInfo && (!dealValue || !(parsedDealValue > 0))) {
      setMsg({ text: "This client was referred by a seller — enter a deal value before activating so their commission can be calculated.", ok: false });
      return;
    }
    setActivating(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const now = new Date();
      const activationDate = now.toISOString();
      const billingCycle = client.billing_cycle ?? "monthly";
      const paidUntil = new Date(
        billingCycle === "annual"
          ? now.setFullYear(now.getFullYear() + 1)
          : now.setDate(now.getDate() + 30)
      ).toISOString();

      const { error } = await supabase
        .from("clients")
        .update({
          subscription_status: "active",
          activation_date: activationDate,
          paid_until: paidUntil,
        })
        .eq("id", client.id);

      if (error) throw error;

      await supabase.from("activity_log").insert({
        client_id: client.id,
        type: "subscription_activated",
        metadata: {
          plan: client.plan_name ?? "unknown",
          billing_cycle: billingCycle,
          activation_date: activationDate,
          paid_until: paidUntil,
        },
        created_at: new Date().toISOString(),
      });

      if (client.contact_email && client.plan_name) {
        await sendSubscriptionActivated({
          clientEmail: client.contact_email,
          clientName: client.contact_name,
          companyName: client.company_name,
          planName: client.plan_name,
          billingCycle,
          activationDate,
          paidUntil,
        }).catch(() => {});
      }

      onUpdate({ subscription_status: "active", activation_date: activationDate, paid_until: paidUntil });
      setMsg({ text: "Subscription activated. Welcome email sent.", ok: true });

      // Commission creation must never block or fail activation above — it
      // has already succeeded by this point. Errors are logged, not thrown,
      // and surfaced as a follow-up note rather than overwriting the success
      // message, matching activateCompanyAction's non-fatal-step pattern.
      if (referralInfo) {
        try {
          const result = await createCommissionForActivation({
            clientId: client.id,
            dealValue: parsedDealValue,
          });
          if ("error" in result) {
            console.error("[BillingTab] commission creation error:", result.error);
            setMsg({
              text: `Subscription activated, but commission creation failed (${result.error}). Create it manually in the Commissions tab.`,
              ok: true,
            });
          }
        } catch (commissionErr) {
          console.error("[BillingTab] commission creation unexpected error:", commissionErr);
          setMsg({
            text: "Subscription activated, but commission creation failed unexpectedly. Create it manually in the Commissions tab.",
            ok: true,
          });
        }
      }
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : "Activation failed", ok: false });
    }
    setActivating(false);
  }

  async function handleStatusChange(newStatus: "suspended" | "cancelled") {
    if (newStatus === "suspended") setSuspending(true);
    else setCancelling(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("clients")
        .update({ subscription_status: newStatus })
        .eq("id", client.id);
      if (error) throw error;

      await supabase.from("activity_log").insert({
        client_id: client.id,
        type: `subscription_${newStatus}`,
        metadata: { by: "admin" },
        created_at: new Date().toISOString(),
      });

      onUpdate({ subscription_status: newStatus });
      setMsg({ text: `Subscription marked as ${newStatus}.`, ok: true });
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : "Update failed", ok: false });
    }
    setSuspending(false);
    setCancelling(false);
  }

  async function handleSavePaidUntil() {
    if (!paidUntilOverride) return;
    setSavingOverride(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const iso = new Date(paidUntilOverride).toISOString();
      const { error } = await supabase.from("clients").update({ paid_until: iso }).eq("id", client.id);
      if (error) throw error;
      onUpdate({ paid_until: iso });
      setMsg({ text: "Paid until date updated.", ok: true });
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : "Save failed", ok: false });
    }
    setSavingOverride(false);
  }

  const status = client.subscription_status ?? "none";
  const canActivate = status === "paid_pending_verification";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Subscription billing</h3>
        <p className="text-sm text-muted-2">Manage payment status, service period, and activation for this client.</p>
      </div>

      {/* Status + fields */}
      <div className="bg-white border border-grid-300 divide-y divide-grid-300">
        {[
          { label: "Status",         value: <StatusBadge status={status} /> },
          { label: "Plan",           value: client.plan_name ?? "—" },
          { label: "Billing cycle",  value: client.billing_cycle ?? "—" },
          { label: "Payment date",   value: fmt(client.payment_date) },
          { label: "Activation date",value: fmt(client.activation_date) },
          { label: "Service ends",   value: fmt(client.paid_until) },
          { label: "Revolut order",  value: client.revolut_order_id ?? "—" },
          { label: "Founding client",value: client.founding_client ? "⭐ Yes" : "No" },
          { label: "Founding code",  value: client.founding_code_used ?? "—" },
          { label: "Terms accepted", value: client.terms_accepted_at ? `${fmt(client.terms_accepted_at)} (${client.terms_version_accepted ?? "unknown version"})` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start gap-4 px-5 py-3">
            <span className="w-36 shrink-0 text-xs font-mono text-muted-2 pt-0.5">{label}</span>
            <span className="text-sm text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {/* Manual paid_until override */}
      <div className="border border-grid-300 bg-white p-5 space-y-3">
        <p className="text-xs font-mono text-muted-2 uppercase tracking-wider">Manual override — service end date</p>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={paidUntilOverride}
            onChange={(e) => setPaidUntilOverride(e.target.value)}
            className="border border-grid-500 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-highlight/30"
          />
          <button
            onClick={handleSavePaidUntil}
            disabled={savingOverride || !paidUntilOverride}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-white text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
          >
            {savingOverride && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            Save
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="border border-grid-300 bg-white p-5 space-y-4">
        <p className="text-xs font-mono text-muted-2 uppercase tracking-wider">Actions</p>

        {canActivate && (
          <div className={cn("border p-4", bizVerified === false ? "border-warning/25 bg-warning/5" : "border-success/25 bg-success/5")}>
            <p className="text-sm font-medium text-foreground mb-1">Activate subscription</p>
            {bizVerified === false ? (
              <div className="flex items-start gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning">
                  Business verification required before activation. Go to the Business Verification tab and verify this client&apos;s documents first.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-2 mb-3">
                Sets activation_date to now, calculates paid_until ({client.billing_cycle === "annual" ? "12 months" : "30 days"}), sends welcome email to client.
              </p>
            )}

            {referralInfo && bizVerified !== false && (
              <div className="border border-highlight/25 bg-highlight/5 p-3 mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Handshake className="h-3.5 w-3.5 text-highlight" />
                  <p className="text-xs font-medium text-foreground">
                    Referred by seller {referralInfo.referralCode} ({referralInfo.commissionRate}% commission)
                  </p>
                </div>
                <label className="block text-xs font-mono text-muted-2 uppercase tracking-wider mb-1">
                  Deal value (€) — required to calculate commission
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="0.00"
                  className="w-40 border border-grid-500 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-highlight/30"
                />
                {dealValue && Number(dealValue) > 0 && (
                  <p className="text-xs text-muted-2 mt-1.5">
                    → {new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(
                      Number(dealValue) * (referralInfo.commissionRate / 100)
                    )} commission (pending)
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={activating || bizVerified === false}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white text-sm font-medium hover:bg-success/90 disabled:opacity-50 transition-colors"
            >
              {activating && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <CheckCircle2 className="h-4 w-4" />
              {bizVerified === false ? "Verification Required" : "Activate Subscription"}
            </button>
          </div>
        )}

        {(status === "active" || status === "paid_pending_verification") && (
          <div className="border border-warning/25 bg-warning/5 p-4">
            <p className="text-sm font-medium text-foreground mb-1">Suspend access</p>
            <p className="text-xs text-muted-2 mb-3">Suspends access without cancelling the contract. Data is retained.</p>
            <button
              onClick={() => handleStatusChange("suspended")}
              disabled={suspending}
              className="flex items-center gap-2 px-4 py-2 bg-warning text-white text-sm font-medium hover:bg-warning/90 disabled:opacity-50 transition-colors"
            >
              {suspending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <AlertCircle className="h-4 w-4" />
              Suspend
            </button>
          </div>
        )}

        {status !== "cancelled" && status !== "none" && (
          <div className="border border-error/25 bg-error/5 p-4">
            <p className="text-sm font-medium text-foreground mb-1">Cancel subscription</p>
            <p className="text-xs text-muted-2 mb-3">Marks the subscription as cancelled. Does not delete data.</p>
            <button
              onClick={() => handleStatusChange("cancelled")}
              disabled={cancelling}
              className="flex items-center gap-2 px-4 py-2 bg-error text-white text-sm font-medium hover:bg-error/90 disabled:opacity-50 transition-colors"
            >
              {cancelling && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <XCircle className="h-4 w-4" />
              Cancel Subscription
            </button>
          </div>
        )}

        {(status === "none" || status === "cancelled" || status === "suspended") && (
          <p className="text-xs text-muted-2 font-mono">
            {status === "none" && "No payment recorded for this client."}
            {status === "suspended" && "Account is suspended. Activate to restore access."}
            {status === "cancelled" && "Subscription is cancelled."}
          </p>
        )}
      </div>

      {msg && (
        <p className={cn("text-sm font-mono", msg.ok ? "text-success" : "text-error")}>
          {msg.ok ? "✓ " : "✗ "}{msg.text}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-2 font-mono border-t border-grid-300 pt-4">
        <CreditCard className="h-3.5 w-3.5" />
        Payment processor: {client.payment_provider ?? "revolut"}
      </div>
    </div>
  );
}
