"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/lib/supabase/types";

type FoundingClient = Client & { primary_contact: { name: string; email: string } | null };

function PaymentBadge({ status }: { status: Client["subscription_status"] }) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-success/10 text-success border-success/20">
          Paid
        </span>
      );
    case "paid_pending_verification":
      return (
        <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-warning/10 text-warning border-warning/20">
          Paid — Pending Verification
        </span>
      );
    case "suspended":
      return (
        <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-error/10 text-error border-error/20">
          Suspended
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-error/10 text-error border-error/20">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-grid-300 text-muted border-grid-500">
          Unpaid
        </span>
      );
  }
}

function ActivationBadge({ client }: { client: Client }) {
  if (client.stage === "active") {
    return (
      <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-success/10 text-success border-success/20">
        Active
      </span>
    );
  }
  if (client.activated_at) {
    return (
      <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-highlight/10 text-highlight border-highlight/20">
        Activated
      </span>
    );
  }
  return (
    <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded border bg-warning/10 text-warning border-warning/20">
      Pending
    </span>
  );
}

export default function FoundingClientsPage() {
  const [clients, setClients] = useState<FoundingClient[] | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    async function fetch() {
      const { data, error } = await supabase
        .from("clients")
        .select("*, contacts!left(name, email, is_primary)")
        .eq("founding_client", true)
        .eq("archived", false)
        .order("created_at", { ascending: true });

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

  if (clients === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-serif font-semibold text-foreground">Founding Clients</h1>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-highlight bg-highlight/8 border border-highlight/20 px-2 py-0.5 rounded">
            <Star className="h-3 w-3" />
            {clients.length} / 20
          </span>
        </div>
        <p className="text-muted text-sm">
          Founding Client Program — limited to 20 companies. Launch: 15 July 2026.
        </p>
      </div>

      {/* Program fill bar */}
      <div className="bg-white rounded-xl border border-grid-300 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Program capacity</p>
          <p className="text-sm font-mono text-muted-2">{clients.length} / 20 slots filled</p>
        </div>
        <div className="h-2 bg-grid-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-highlight rounded-full transition-all"
            style={{ width: `${Math.min((clients.length / 20) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs font-mono text-muted-2 mt-1.5">{20 - clients.length} slots remaining</p>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 py-16 text-center">
          <p className="text-muted-2 text-sm">No founding clients yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grid-300 bg-grid-100">
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Discount Code</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">License</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Activation</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-muted-2 uppercase tracking-wider">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-300">
                {clients.map((client, idx) => (
                  <tr key={client.id} className="hover:bg-grid-100/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-muted-2">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{client.company_name}</p>
                      {client.primary_contact && (
                        <p className="text-xs text-muted-2">{client.primary_contact.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {client.founding_code_used ? (
                        <span className="font-mono text-xs text-highlight bg-highlight/5 px-2 py-0.5 rounded border border-highlight/20">
                          {client.founding_code_used}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-2">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-foreground capitalize">
                        {client.license_tier ?? "trial"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActivationBadge client={client} />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={client.subscription_status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-2 font-mono">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="inline-flex items-center gap-1 text-xs text-highlight hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Admin View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
