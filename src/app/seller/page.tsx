"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Link2, BookOpen, Tag, Video } from "lucide-react";
import { getMySellerDashboard, type SellerDashboardData } from "@/app/actions/sellers";
import { cn, formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ElevatorPitch from "@/components/seller/ElevatorPitch";
import PricingReference from "@/components/seller/PricingReference";

function fmtAmount(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(amount);
}

function leadStatusStyle(status: string): string {
  switch (status) {
    case "new":        return "bg-info/10 text-info";
    case "contacted":  return "bg-warning/10 text-warning";
    case "qualified":  return "bg-success/10 text-success";
    case "rejected":   return "bg-error/10 text-error";
    case "converted":  return "bg-success/10 text-success";
    default:           return "bg-grid-300 text-muted";
  }
}

function commissionStatusStyle(status: string): string {
  switch (status) {
    case "pending":   return "bg-warning/10 text-warning";
    case "approved":  return "bg-info/10 text-info";
    case "paid":       return "bg-success/10 text-success";
    case "disputed":  return "bg-error/10 text-error";
    default:          return "bg-grid-300 text-muted";
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SellerDashboardPage() {
  const [data, setData] = useState<SellerDashboardData | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getMySellerDashboard().then(setData);
  }, []);

  async function copyLink() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (data === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }
  if (!data) {
    return <p className="text-muted-2 text-sm">Unable to load your dashboard. Please sign in again.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">Seller Dashboard</h1>
        <p className="text-muted text-sm mt-1">
          Your referral link, referred leads, and commission history. Commission rate: {data.commissionRate}%.
        </p>
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-xl border border-grid-300 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-4 w-4 text-highlight" />
          <h3 className="text-sm font-semibold text-foreground">My Referral Link</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-grid-200 border border-grid-300 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground truncate">
            {data.referralUrl}
          </div>
          <button
            onClick={copyLink}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border shrink-0",
              copied
                ? "bg-success/10 text-success border-success/20"
                : "bg-white text-muted border-grid-500 hover:bg-grid-300"
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-muted-2 mt-3">
          Share this link with prospective clients. Submissions through it are automatically tagged with your referral code.
        </p>
      </div>

      {/* Commission summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending",           value: data.totals.pending },
          { label: "Approved",          value: data.totals.approved },
          { label: "Paid (Lifetime)",   value: data.totals.paid },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-grid-300 p-4 text-center">
            <div className="text-2xl font-bold text-foreground tabular-nums">{fmtAmount(stat.value)}</div>
            <div className="text-xs text-muted-2 mt-1 font-mono uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* My Leads */}
      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="px-5 py-4 border-b border-grid-300">
          <h3 className="text-sm font-semibold text-foreground">My Leads</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Company</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-muted-2">
                    No referred leads yet. Share your link above to get started.
                  </td>
                </tr>
              ) : (
                data.leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-grid-300 last:border-b-0">
                    <td className="px-5 py-4 text-sm text-foreground">{lead.name}</td>
                    <td className="px-5 py-4 text-sm text-muted-2">{lead.company || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", leadStatusStyle(lead.status))}>
                        {capitalize(lead.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">{formatDate(lead.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Commissions */}
      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="px-5 py-4 border-b border-grid-300">
          <h3 className="text-sm font-semibold text-foreground">My Commissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Deal Value</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Commission</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Created</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Paid</th>
              </tr>
            </thead>
            <tbody>
              {data.commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-2">
                    No commissions yet.
                  </td>
                </tr>
              ) : (
                data.commissions.map((c) => (
                  <tr key={c.id} className="border-b border-grid-300 last:border-b-0">
                    <td className="px-5 py-4 text-sm text-muted-2 tabular-nums">{fmtAmount(c.deal_value)}</td>
                    <td className="px-5 py-4 text-sm text-foreground font-medium tabular-nums">{fmtAmount(c.commission_amount)}</td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", commissionStatusStyle(c.status))}>
                        {capitalize(c.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-4 text-sm text-muted-2">{c.paid_at ? formatDate(c.paid_at) : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h2 className="text-lg font-serif font-semibold text-foreground mb-4">Resources</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-highlight" />
              <h3 className="text-sm font-semibold text-foreground">Elevator Pitch</h3>
            </div>
            <ElevatorPitch />
          </div>

          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-highlight" />
              <h3 className="text-sm font-semibold text-foreground">Pricing Reference</h3>
            </div>
            <PricingReference />
          </div>

          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-4 w-4 text-highlight" />
              <h3 className="text-sm font-semibold text-foreground">Company Video</h3>
            </div>
            <video controls preload="metadata" className="w-full rounded-lg border border-grid-300">
              <source src="/videos/seller-intro.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
