"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { activateClientAction } from "@/app/actions/clients";
import type { Client, ActivationChecklistItem, KycVerification } from "@/lib/supabase/types";
import { CheckCircle2, Circle, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_CHECKLIST: ActivationChecklistItem[] = [
  { id: "kyc_verified",          label: "KYC verified",                      required: true,  checked: false },
  { id: "contract_signed",       label: "Contract signed by client",          required: true,  checked: false },
  { id: "contract_countersigned",label: "Contract countersigned by admin",    required: true,  checked: false },
  { id: "invoice_paid",          label: "Initial invoice paid",               required: true,  checked: false },
  { id: "onboarding_email",      label: "Onboarding welcome email sent",      required: true,  checked: false },
  { id: "system_configured",     label: "A.D.A.M. system configured",         required: true,  checked: false },
  { id: "strategy_published",    label: "Strategy document published",        required: false, checked: false },
  { id: "kickoff_scheduled",     label: "Kickoff call scheduled",             required: false, checked: false },
];

const AUTO_IDS = new Set(["kyc_verified", "contract_signed", "contract_countersigned", "invoice_paid"]);

export default function ActivationTab({
  client,
  onActivated,
}: {
  client: Client & { contracts: any[] };
  onActivated: (activatedAt: string) => void;
}) {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<ActivationChecklistItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  useEffect(() => {
    async function init() {
      const supabase = createClient();

      // Stored checklist or default
      const stored: ActivationChecklistItem[] =
        client.activation_checklist?.length
          ? client.activation_checklist
          : DEFAULT_CHECKLIST.map((i) => ({ ...i }));

      // Auto-derive states
      const kycRes = await supabase
        .from("kyc_verifications")
        .select("status")
        .eq("client_id", client.id)
        .maybeSingle();
      const kycVerified = (kycRes.data as KycVerification | null)?.status === "verified";

      const contracts: any[] = client.contracts ?? [];
      const serviceContract = contracts.find(
        (c) => c.contract_type !== "nda" && c.contract_type !== "amendment"
      ) ?? contracts[0] ?? null;
      const clientSigned = !!serviceContract?.client_signed_at;
      const countersigned = ["countersigned", "final"].includes(serviceContract?.status ?? "");

      const invoicesRes = await supabase
        .from("invoices")
        .select("status")
        .eq("client_id", client.id)
        .eq("status", "paid")
        .limit(1);
      const invoicePaid = (invoicesRes.data?.length ?? 0) > 0;

      const autoMap: Record<string, boolean> = {
        kyc_verified: kycVerified,
        contract_signed: clientSigned,
        contract_countersigned: countersigned,
        invoice_paid: invoicePaid,
      };

      const merged = stored.map((item) =>
        AUTO_IDS.has(item.id) ? { ...item, checked: autoMap[item.id] ?? item.checked } : item
      );

      setItems(merged);
    }
    init();
  }, [client.id, client.activation_checklist, client.contracts]);

  const toggle = (id: string) => {
    if (AUTO_IDS.has(id)) return; // auto-only
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const required = items.filter((i) => i.required);
  const checkedRequired = required.filter((i) => i.checked).length;
  const allRequiredDone = required.length > 0 && checkedRequired === required.length;
  const totalDone = items.filter((i) => i.checked).length;
  const progress = items.length > 0 ? Math.round((totalDone / items.length) * 100) : 0;

  const handleActivate = async () => {
    if (!allRequiredDone || !user) return;
    setSaving(true);
    setMsg("");
    const result = await activateClientAction(client.id, user.id, items);
    setSaving(false);
    if (result.error) {
      setMsg(result.error);
      setMsgType("error");
    } else {
      setMsg("Client activated successfully.");
      setMsgType("success");
      onActivated(new Date().toISOString());
    }
  };

  const alreadyActive = client.stage === "active";

  return (
    <div className="max-w-xl space-y-6">
      {alreadyActive && (
        <div className="flex items-center gap-2 rounded-lg bg-success/8 border border-success/20 px-4 py-3 text-sm text-success">
          <Zap className="h-4 w-4 shrink-0" />
          Client activated{client.activated_at ? ` on ${new Date(client.activated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
        </div>
      )}

      {msg && (
        <div className={cn("rounded-lg border px-4 py-3 text-sm", msgType === "error" ? "bg-error/8 border-error/20 text-error" : "bg-success/8 border-success/20 text-success")}>
          {msg}
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-xl border border-grid-300 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Activation Progress</h3>
          <span className="text-sm font-mono font-semibold text-foreground">{totalDone}/{items.length}</span>
        </div>
        <div className="h-2 rounded-full bg-grid-300">
          <div
            className={cn("h-2 rounded-full transition-all duration-500", allRequiredDone ? "bg-success" : "bg-highlight")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-2 mt-2">
          {checkedRequired}/{required.length} required items complete
        </p>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl border border-grid-300 divide-y divide-grid-300">
        {items.map((item) => {
          const isAuto = AUTO_IDS.has(item.id);
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 px-5 py-3.5",
                !isAuto && "cursor-pointer hover:bg-grid-300/20 transition-colors",
                isAuto && "opacity-90"
              )}
              onClick={() => toggle(item.id)}
            >
              {item.checked ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-2 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", item.checked ? "text-foreground" : "text-muted-2")}>
                  {item.label}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.required && (
                  <span className="text-[10px] font-mono font-semibold text-error bg-error/8 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Required
                  </span>
                )}
                {isAuto && (
                  <span className="text-[10px] font-mono text-muted-2 bg-grid-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Auto
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activate */}
      {!alreadyActive && (
        <div className="space-y-3">
          {!allRequiredDone && (
            <div className="flex items-start gap-2 text-xs text-warning">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              All required items must be checked before activating.
            </div>
          )}
          <button
            onClick={handleActivate}
            disabled={!allRequiredDone || saving}
            className={cn(
              "relative inline-flex items-center justify-center gap-2 h-10 px-6 text-sm font-medium rounded-lg transition-all",
              allRequiredDone
                ? "btn-primary-gradient text-foreground"
                : "bg-grid-300 text-muted-2 cursor-not-allowed"
            )}
          >
            <Zap className="h-4 w-4" />
            {saving ? "Activating…" : "Activate Client"}
          </button>
        </div>
      )}
    </div>
  );
}
