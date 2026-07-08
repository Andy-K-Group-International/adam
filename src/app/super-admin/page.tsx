"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import InviteCompanyToDemoDialog from "@/components/super-admin/InviteCompanyToDemoDialog";
import { listDemoInvites, type DemoInviteRow } from "@/app/actions/demo-invites";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Star,
  Zap,
  Hourglass,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface Stats {
  totalApplications: number;
  pendingReviews: number;
  approvedCompanies: number;
  foundingClients: number;
  activeLicenses: number;
  pendingActivations: number;
  kycVerified: number;
  kycTotal: number;
  invoicesPaid: number;
  invoicesOverdue: number;
  invoicesTotal: number;
}

const statCards = [
  {
    key: "totalApplications",
    label: "Total Applications",
    icon: ClipboardList,
    color: "text-highlight",
    bg: "bg-highlight/10",
    format: (s: Stats) => s.totalApplications,
  },
  {
    key: "pendingReviews",
    label: "Pending Reviews",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    format: (s: Stats) => s.pendingReviews,
  },
  {
    key: "approvedCompanies",
    label: "Approved",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    format: (s: Stats) => s.approvedCompanies,
  },
  {
    key: "foundingClients",
    label: "Founding Clients",
    icon: Star,
    color: "text-highlight",
    bg: "bg-highlight/10",
    format: (s: Stats) => s.foundingClients,
  },
  {
    key: "activeLicenses",
    label: "Active Licenses",
    icon: Zap,
    color: "text-success",
    bg: "bg-success/10",
    format: (s: Stats) => s.activeLicenses,
  },
  {
    key: "pendingActivations",
    label: "Pending Activations",
    icon: Hourglass,
    color: "text-warning",
    bg: "bg-warning/10",
    format: (s: Stats) => s.pendingActivations,
  },
  {
    key: "kyc",
    label: "Business Verified",
    icon: ShieldCheck,
    color: "text-highlight",
    bg: "bg-highlight/10",
    format: (s: Stats) => `${s.kycVerified} / ${s.kycTotal}`,
  },
  {
    key: "payments",
    label: "Invoices Paid",
    icon: Receipt,
    color: "text-success",
    bg: "bg-success/10",
    format: (s: Stats) =>
      `${s.invoicesPaid} / ${s.invoicesTotal}${s.invoicesOverdue > 0 ? ` · ${s.invoicesOverdue} overdue` : ""}`,
    sub: (s: Stats) =>
      s.invoicesOverdue > 0
        ? `${s.invoicesOverdue} overdue`
        : "No overdue invoices",
  },
];

export default function SuperAdminDashboard() {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [invites, setInvites] = useState<DemoInviteRow[] | null>(null);

  const refreshInvites = useCallback(() => {
    listDemoInvites().then(setInvites).catch(() => setInvites([]));
  }, []);

  useEffect(() => {
    refreshInvites();
  }, [refreshInvites]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchStats() {
      const [
        leadsRes,
        clientsRes,
        kycRes,
        invoicesRes,
      ] = await Promise.all([
        supabase.from("leads").select("id, status"),
        supabase.from("clients").select("id, stage, subscription_status, founding_client, archived").eq("archived", false),
        supabase.from("kyc_verifications").select("id, status"),
        supabase.from("invoices").select("id, status"),
      ]);

      const leads = leadsRes.data ?? [];
      const clients = clientsRes.data ?? [];
      const kycs = kycRes.data ?? [];
      const invoices = invoicesRes.data ?? [];

      setStats({
        totalApplications: leads.length,
        pendingReviews: leads.filter((l) => l.status === "new").length,
        approvedCompanies: leads.filter(
          (l) => l.status === "qualified" || l.status === "converted"
        ).length,
        foundingClients: clients.filter((c) => c.founding_client).length,
        activeLicenses: clients.filter((c) => c.stage === "active").length,
        pendingActivations: clients.filter(
          (c) => c.subscription_status === "paid_pending_verification"
        ).length,
        kycVerified: kycs.filter((k) => k.status === "verified").length,
        kycTotal: kycs.length,
        invoicesPaid: invoices.filter((i) => i.status === "paid").length,
        invoicesOverdue: invoices.filter((i) => i.status === "overdue").length,
        invoicesTotal: invoices.filter((i) => i.status !== "draft").length,
      });
    }

    fetchStats();
  }, []);

  if (!stats) return <LoadingSpinner className="min-h-[60vh]" />;

  const invitedByName = user ? `${user.first_name} ${user.last_name}`.trim() : "";

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-mono mb-2">Andy'K Group International LTD — A.D.A.M.</p>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted text-sm mt-1">
            CEO-level overview of the Controlled License Launch.
          </p>
        </div>
        {invitedByName && (
          <InviteCompanyToDemoDialog invitedBy={invitedByName} onInvited={refreshInvites} />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-grid-300 p-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", card.bg)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground leading-tight">
                  {card.format(stats)}
                </p>
                <p className="text-sm text-muted-2 mt-0.5">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Founding Client Program bar */}
      <div className="mt-8 bg-white rounded-xl border border-grid-300 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Founding Client Program</h2>
            <p className="text-sm text-muted-2 mt-0.5">Limited to 20 companies · Launch: 15 July 2026</p>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {stats.foundingClients}
            <span className="text-base font-normal text-muted-2"> / 20</span>
          </span>
        </div>
        <div className="h-2 bg-grid-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-highlight rounded-full transition-all"
            style={{ width: `${Math.min((stats.foundingClients / 20) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs font-mono text-muted-2 mt-2">
          {20 - stats.foundingClients} slots remaining
        </p>
      </div>

      {/* Demo invites */}
      <div className="mt-8 bg-white rounded-xl border border-grid-300 p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Personal Demo Invites</h2>
          <p className="text-sm text-muted-2 mt-0.5">
            Companies invited directly by the CEO. NDA signature is still required before demo access is granted.
          </p>
        </div>
        {!invites ? (
          <LoadingSpinner className="py-8" />
        ) : invites.length === 0 ? (
          <p className="text-sm text-muted-2 py-4">No invites sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono uppercase tracking-[0.1em] text-muted-2 border-b border-grid-300">
                  <th className="py-2 pr-4 font-medium">Company</th>
                  <th className="py-2 pr-4 font-medium">Contact</th>
                  <th className="py-2 pr-4 font-medium">Invited</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b border-grid-300 last:border-0">
                    <td className="py-2.5 pr-4 text-foreground">{invite.company_name}</td>
                    <td className="py-2.5 pr-4 text-muted">
                      {invite.contact_name}
                      <span className="text-muted-2"> · {invite.contact_email}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-2 font-mono text-xs">
                      {formatDate(invite.invited_at)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={cn(
                          "inline-flex text-xs font-semibold px-2 py-0.5 rounded border",
                          invite.signed
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        )}
                      >
                        {invite.signed ? "NDA Signed" : "Awaiting NDA"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
