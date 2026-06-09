"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/lib/supabase/types";

type LicenseClient = Pick<
  Client,
  | "id"
  | "company_name"
  | "client_ref"
  | "license_tier"
  | "activation_date"
  | "paid_until"
  | "subscription_status"
  | "stage"
  | "created_at"
> & { primary_contact: { name: string; email: string } | null };

type LicenseTierFilter = "" | "trial" | "full" | "founding";

const TIER_FILTERS: { value: LicenseTierFilter; label: string }[] = [
  { value: "",         label: "All" },
  { value: "trial",    label: "Trial" },
  { value: "full",     label: "Full" },
  { value: "founding", label: "Founding" },
];

function licenseStatus(client: LicenseClient): { label: string; cls: string } {
  if (client.stage === "active" || client.subscription_status === "active") {
    return { label: "Active", cls: "bg-success/10 text-success border-success/20" };
  }
  if (client.subscription_status === "paid_pending_verification") {
    return { label: "Paid – Pending", cls: "bg-warning/10 text-warning border-warning/20" };
  }
  if (client.subscription_status === "suspended") {
    return { label: "Suspended", cls: "bg-error/10 text-error border-error/20" };
  }
  if (client.subscription_status === "cancelled") {
    return { label: "Cancelled", cls: "bg-error/10 text-error border-error/20" };
  }
  if (client.activation_date) {
    return { label: "Activated", cls: "bg-highlight/10 text-highlight border-highlight/20" };
  }
  return { label: "Pending", cls: "bg-grid-300 text-muted border-grid-500" };
}

function TierBadge({ tier }: { tier: Client["license_tier"] }) {
  switch (tier) {
    case "founding":
      return (
        <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-highlight/10 text-highlight border-highlight/20 capitalize">
          Founding
        </span>
      );
    case "full":
      return (
        <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-success/10 text-success border-success/20 capitalize">
          Full
        </span>
      );
    default:
      return (
        <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-grid-300 text-muted border-grid-500 capitalize">
          Trial
        </span>
      );
  }
}

export default function LicensesPage() {
  const [clients, setClients] = useState<LicenseClient[] | undefined>(undefined);
  const [tierFilter, setTierFilter] = useState<LicenseTierFilter>("");

  useEffect(() => {
    const supabase = createClient();

    async function fetch() {
      const { data, error } = await supabase
        .from("clients")
        .select(
          "id, company_name, client_ref, license_tier, activation_date, paid_until, subscription_status, stage, created_at, contacts!left(name, email, is_primary)"
        )
        .eq("archived", false)
        .order("created_at", { ascending: false });

      if (error || !data) { setClients([]); return; }

      setClients(
        data.map((row: any) => {
          const arr = Array.isArray(row.contacts) ? row.contacts : [];
          const primary = arr.find((c: any) => c.is_primary) ?? arr[0] ?? null;
          const { contacts: _, ...client } = row;
          return {
            ...client,
            primary_contact: primary ? { name: primary.name, email: primary.email } : null,
          };
        })
      );
    }

    fetch();
  }, []);

  const updateTier = async (clientId: string, tier: string) => {
    const supabase = createClient();
    await supabase.from("clients").update({ license_tier: tier, updated_at: new Date().toISOString() }).eq("id", clientId);
    setClients((prev) =>
      prev?.map((c) =>
        c.id === clientId ? { ...c, license_tier: tier as Client["license_tier"] } : c
      )
    );
  };

  if (clients === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  const filtered = tierFilter
    ? clients.filter((c) => (c.license_tier ?? "trial") === tierFilter)
    : clients;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">Licenses</h1>
        <p className="text-muted text-sm mt-1">
          All licensed companies. {clients.length} total.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TIER_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTierFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
              tierFilter === f.value
                ? "bg-highlight text-white border-highlight"
                : "bg-white border-grid-300 text-muted-2 hover:border-highlight/40 hover:text-foreground"
            )}
          >
            {f.label}
            {f.value === ""
              ? ` (${clients.length})`
              : ` (${clients.filter((c) => (c.license_tier ?? "trial") === f.value).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 py-16 text-center">
          <p className="text-muted-2 text-sm">No companies match this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grid-300 bg-grid-100">
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">License Type</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Activation Date</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Paid Until</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-muted-2 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-300">
                {filtered.map((client) => {
                  const status = licenseStatus(client);
                  return (
                    <tr key={client.id} className="hover:bg-grid-100/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{client.company_name}</p>
                        {client.client_ref && (
                          <p className="text-xs font-mono text-muted-2">{client.client_ref}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TierBadge tier={client.license_tier} />
                          <select
                            value={client.license_tier ?? "trial"}
                            onChange={(e) => updateTier(client.id, e.target.value)}
                            className="text-xs border border-grid-500 rounded px-1.5 py-0.5 text-muted bg-transparent focus:outline-none focus:border-highlight"
                          >
                            <option value="trial">Trial</option>
                            <option value="full">Full</option>
                            <option value="founding">Founding</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-2 font-mono">
                        {client.activation_date ? formatDate(client.activation_date) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-2 font-mono">
                        {client.paid_until ? formatDate(client.paid_until) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex text-xs font-semibold px-2 py-0.5 rounded border",
                            status.cls
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/clients/${client.id}?tab=billing`}
                          className="inline-flex items-center gap-1 text-xs text-highlight hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Billing
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
