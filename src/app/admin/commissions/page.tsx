"use client";

import { useState, useEffect, useCallback } from "react";
import { listCommissions, approveCommission, markCommissionPaid, type CommissionRow } from "@/app/actions/commissions";
import { cn, formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { CheckCircle2, Banknote } from "lucide-react";

type StatusFilter = "" | CommissionRow["status"];

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "",          label: "All Statuses" },
  { value: "pending",   label: "Pending" },
  { value: "approved",  label: "Approved" },
  { value: "paid",      label: "Paid" },
  { value: "disputed",  label: "Disputed" },
];

function commissionStatusStyle(status: CommissionRow["status"]): string {
  switch (status) {
    case "pending":   return "bg-warning/10 text-warning";
    case "approved":  return "bg-info/10 text-info";
    case "paid":      return "bg-success/10 text-success";
    case "disputed":  return "bg-error/10 text-error";
  }
}

function fmtAmount(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(amount);
}

export default function CommissionsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [commissions, setCommissions] = useState<CommissionRow[] | undefined>(undefined);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [payModalCommission, setPayModalCommission] = useState<CommissionRow | null>(null);
  const [confirmingPaid, setConfirmingPaid] = useState(false);

  const fetchCommissions = useCallback(() => {
    listCommissions(statusFilter || undefined).then(setCommissions);
  }, [statusFilter]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  async function handleApprove(commissionId: string) {
    setApprovingId(commissionId);
    try {
      const result = await approveCommission(commissionId);
      if ("error" in result) console.error("approveCommission error:", result.error);
      fetchCommissions();
    } finally {
      setApprovingId(null);
    }
  }

  async function handleConfirmPaid() {
    if (!payModalCommission) return;
    setConfirmingPaid(true);
    try {
      const result = await markCommissionPaid(payModalCommission.id);
      if ("error" in result) console.error("markCommissionPaid error:", result.error);
      fetchCommissions();
    } finally {
      setConfirmingPaid(false);
      setPayModalCommission(null);
    }
  }

  if (commissions === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">Commissions</h1>
        <p className="text-muted text-sm mt-1">Review and pay out seller referral commissions.</p>
      </div>

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
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Seller</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Client</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Deal Value</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Commission</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-2">
                    No commissions found.
                  </td>
                </tr>
              ) : (
                commissions.map((c) => (
                  <tr key={c.id} className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{c.seller_name}</p>
                      <p className="text-xs text-muted-2 font-mono mt-0.5">{c.seller_referral_code}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">{c.client_company_name}</td>
                    <td className="px-5 py-4 text-sm text-muted-2 tabular-nums">{fmtAmount(c.deal_value)}</td>
                    <td className="px-5 py-4 text-sm text-foreground font-medium tabular-nums">{fmtAmount(c.commission_amount)}</td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", commissionStatusStyle(c.status))}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-4">
                      {c.status === "pending" && (
                        <button
                          onClick={() => handleApprove(c.id)}
                          disabled={approvingId === c.id}
                          className="inline-flex items-center gap-1.5 bg-info/10 text-info border border-info/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-info/20 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {approvingId === c.id ? "Approving…" : "Approve"}
                        </button>
                      )}
                      {c.status === "approved" && (
                        <button
                          onClick={() => setPayModalCommission(c)}
                          className="inline-flex items-center gap-1.5 bg-success/10 text-success border border-success/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-success/20 transition-colors"
                        >
                          <Banknote className="h-3.5 w-3.5" />
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark-as-paid confirmation modal — payments are never automated in
          this app; this is the explicit "I actually sent this" step. */}
      {payModalCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl border border-grid-300 p-6 max-w-md w-full shadow-xl">
            <h3 className="text-base font-semibold text-foreground mb-1">Confirm Payment Sent</h3>
            <p className="text-sm text-muted-2 mb-4">
              This only records that payment has already happened — it does not send any money.
            </p>
            <div className="rounded-lg bg-grid-300/30 border border-grid-300 px-4 py-3 mb-4">
              <p className="text-sm text-foreground">
                I confirm I have manually sent{" "}
                <strong>{fmtAmount(payModalCommission.commission_amount)}</strong> to{" "}
                <strong>{payModalCommission.seller_name}</strong> ({payModalCommission.seller_referral_code}) via Revolut.
              </p>
            </div>
            <p className="text-xs text-muted-2 mb-4">This cannot be undone from here.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPayModalCommission(null)}
                disabled={confirmingPaid}
                className="px-4 py-2 text-sm text-muted-2 hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPaid}
                disabled={confirmingPaid}
                className="inline-flex items-center gap-2 bg-success/10 text-success border border-success/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-success/20 transition-colors disabled:opacity-50"
              >
                <Banknote className="h-4 w-4" />
                {confirmingPaid ? "Confirming…" : "Confirm Payment Sent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
