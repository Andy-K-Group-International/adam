"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { listSellers, suspendSeller, type SellerRow } from "@/app/actions/sellers";
import InviteSellerDialog from "@/components/admin/InviteSellerDialog";
import { cn, formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Ban } from "lucide-react";

function sellerStatusStyle(status: SellerRow["status"]): string {
  switch (status) {
    case "invited":     return "bg-info/10 text-info";
    case "pending_nda": return "bg-warning/10 text-warning";
    case "active":      return "bg-success/10 text-success";
    case "suspended":   return "bg-error/10 text-error";
  }
}

function sellerStatusLabel(status: SellerRow["status"]): string {
  switch (status) {
    case "invited":     return "Invited";
    case "pending_nda": return "Pending NDA";
    case "active":      return "Active";
    case "suspended":   return "Suspended";
  }
}

function fmtAmount(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(amount);
}

export default function SellersPage() {
  const { user } = useCurrentUser();
  const [sellers, setSellers] = useState<SellerRow[] | undefined>(undefined);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const refreshSellers = useCallback(() => {
    listSellers().then(setSellers).catch(() => setSellers([]));
  }, []);

  useEffect(() => {
    refreshSellers();
  }, [refreshSellers]);

  async function handleSuspend(sellerId: string) {
    setSuspendingId(sellerId);
    try {
      const result = await suspendSeller(sellerId);
      if ("error" in result) {
        console.error("suspendSeller error:", result.error);
      }
      refreshSellers();
    } finally {
      setSuspendingId(null);
      setConfirmingId(null);
    }
  }

  const invitedByName = user ? `${user.first_name} ${user.last_name}`.trim() : "";

  if (sellers === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Sellers</h1>
          <p className="text-muted text-sm mt-1">
            Manage seller partners and their referral access.
          </p>
        </div>
        {invitedByName && (
          <InviteSellerDialog invitedBy={invitedByName} onInvited={refreshSellers} />
        )}
      </div>

      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Referral Code</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Commission</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Leads</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Total Commissions</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Invited By</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Invited</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-2">
                    No sellers invited yet.
                  </td>
                </tr>
              ) : (
                sellers.map((seller) => (
                  <tr
                    key={seller.id}
                    className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{seller.full_name}</p>
                      <p className="text-xs text-muted-2 mt-0.5">{seller.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2 font-mono">
                      {seller.referral_code}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2 tabular-nums">
                      {seller.commission_rate}%
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", sellerStatusStyle(seller.status))}>
                        {sellerStatusLabel(seller.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2 tabular-nums">{seller.leadCount}</td>
                    <td className="px-5 py-4 text-sm text-foreground font-medium tabular-nums">
                      {fmtAmount(seller.totalCommissions)}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">{seller.invited_by}</td>
                    <td className="px-5 py-4 text-sm text-muted-2">{formatDate(seller.invited_at)}</td>
                    <td className="px-5 py-4">
                      {seller.status !== "suspended" && (
                        confirmingId === seller.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSuspend(seller.id)}
                              disabled={suspendingId === seller.id}
                              className="text-xs font-medium text-error hover:text-error/80 transition-colors disabled:opacity-50"
                            >
                              {suspendingId === seller.id ? "Suspending…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmingId(null)}
                              disabled={suspendingId === seller.id}
                              className="text-xs text-muted-2 hover:text-foreground transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingId(seller.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-error/80 hover:text-error transition-colors"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Suspend
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
