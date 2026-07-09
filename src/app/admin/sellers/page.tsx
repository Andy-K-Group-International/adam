"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { listSellers, suspendSeller, unsuspendSeller, type SellerRow } from "@/app/actions/sellers";
import { listSellerApplications, type SellerApplicationRow } from "@/app/actions/seller-applications";
import InviteSellerDialog from "@/components/admin/InviteSellerDialog";
import ApproveApplicationDialog from "@/components/admin/ApproveApplicationDialog";
import RejectApplicationDialog from "@/components/admin/RejectApplicationDialog";
import { cn, formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Ban, RotateCcw } from "lucide-react";

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

function applicationStatusStyle(status: SellerApplicationRow["status"]): string {
  switch (status) {
    case "pending":  return "bg-warning/10 text-warning";
    case "approved": return "bg-success/10 text-success";
    case "rejected": return "bg-error/10 text-error";
  }
}

function applicationStatusLabel(status: SellerApplicationRow["status"]): string {
  switch (status) {
    case "pending":  return "Pending";
    case "approved": return "Approved";
    case "rejected": return "Rejected";
  }
}

function fmtAmount(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(amount);
}

type ApplicationStatusFilter = "" | SellerApplicationRow["status"];

const applicationStatusOptions: { value: ApplicationStatusFilter; label: string }[] = [
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "",         label: "All" },
];

function SellerApplicationsSection() {
  const [applications, setApplications] = useState<SellerApplicationRow[] | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilter>("pending");

  const refreshApplications = useCallback(() => {
    listSellerApplications(statusFilter || undefined).then(setApplications).catch(() => setApplications([]));
  }, [statusFilter]);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-serif font-semibold text-foreground">Seller Applications</h2>
          <p className="text-muted text-sm mt-1">
            Public applications from /become-a-seller, awaiting manual review.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatusFilter)}
          className="text-sm border border-grid-500 rounded-lg px-3 h-9 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
        >
          {applicationStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Message</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Submitted</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {applications === undefined ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-2">Loading…</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-2">No applications found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{app.full_name}</p>
                      <p className="text-xs text-muted-2 mt-0.5">{app.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">{app.phone}</td>
                    <td className="px-5 py-4 text-sm text-muted-2 max-w-xs truncate" title={app.message ?? undefined}>
                      {app.message || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", applicationStatusStyle(app.status))}>
                        {applicationStatusLabel(app.status)}
                      </span>
                      {app.status === "rejected" && app.rejection_reason && (
                        <p className="text-xs text-muted-2 mt-1 max-w-xs">{app.rejection_reason}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">{formatDate(app.created_at)}</td>
                    <td className="px-5 py-4">
                      {app.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <ApproveApplicationDialog
                            applicationId={app.id}
                            applicantName={app.full_name}
                            applicantEmail={app.email}
                            onApproved={refreshApplications}
                          />
                          <RejectApplicationDialog
                            applicationId={app.id}
                            applicantName={app.full_name}
                            onRejected={refreshApplications}
                          />
                        </div>
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

export default function SellersPage() {
  const { user } = useCurrentUser();
  const [sellers, setSellers] = useState<SellerRow[] | undefined>(undefined);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const refreshSellers = useCallback(() => {
    listSellers().then(setSellers).catch(() => setSellers([]));
  }, []);

  useEffect(() => {
    refreshSellers();
  }, [refreshSellers]);

  async function handleSuspend(sellerId: string) {
    setActioningId(sellerId);
    try {
      const result = await suspendSeller(sellerId);
      if ("error" in result) {
        console.error("suspendSeller error:", result.error);
      }
      refreshSellers();
    } finally {
      setActioningId(null);
      setConfirmingId(null);
    }
  }

  async function handleReactivate(sellerId: string) {
    setActioningId(sellerId);
    try {
      const result = await unsuspendSeller(sellerId);
      if ("error" in result) {
        console.error("unsuspendSeller error:", result.error);
      }
      refreshSellers();
    } finally {
      setActioningId(null);
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

      <SellerApplicationsSection />

      <h2 className="text-lg font-serif font-semibold text-foreground mb-4">Sellers</h2>
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
                sellers.map((seller) => {
                  const isSuspended = seller.status === "suspended";
                  return (
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
                        {confirmingId === seller.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => (isSuspended ? handleReactivate(seller.id) : handleSuspend(seller.id))}
                              disabled={actioningId === seller.id}
                              className={cn(
                                "text-xs font-medium transition-colors disabled:opacity-50",
                                isSuspended ? "text-success hover:text-success/80" : "text-error hover:text-error/80"
                              )}
                            >
                              {actioningId === seller.id ? "Working…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmingId(null)}
                              disabled={actioningId === seller.id}
                              className="text-xs text-muted-2 hover:text-foreground transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : isSuspended ? (
                          <button
                            onClick={() => setConfirmingId(seller.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-success/80 hover:text-success transition-colors"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmingId(seller.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-error/80 hover:text-error transition-colors"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
