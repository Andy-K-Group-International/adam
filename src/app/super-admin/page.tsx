"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
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
  const [stats, setStats] = useState<Stats | null>(null);

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

  return (
    <div>
      <div className="mb-8">
        <p className="label-mono mb-2">Andy'K Group International LTD — A.D.A.M.</p>
        <h1 className="text-2xl font-serif font-semibold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted text-sm mt-1">
          CEO-level overview of the Controlled License Launch.
        </p>
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
    </div>
  );
}
