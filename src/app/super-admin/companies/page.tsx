"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/lib/supabase/types";

type CompanyRow = Pick<
  Client,
  | "id"
  | "company_name"
  | "client_ref"
  | "contact_name"
  | "contact_email"
  | "stage"
  | "subscription_status"
  | "founding_client"
  | "activated_at"
  | "license_tier"
  | "plan_name"
  | "created_at"
> & {
  kyc_status: string | null;
};

const STAGE_LABELS: Record<string, string> = {
  questionnaire: "Questionnaire",
  proposal:      "Proposal",
  strategy:      "Strategy",
  contract:      "Contract",
  invoice:       "Invoice",
  kickoff:       "Kick-off",
  active:        "Active",
};

const STAGE_CLS: Record<string, string> = {
  questionnaire: "bg-grid-300 text-muted border-grid-500",
  proposal:      "bg-info/10 text-info border-info/20",
  strategy:      "bg-highlight/10 text-highlight border-highlight/20",
  contract:      "bg-warning/10 text-warning border-warning/20",
  invoice:       "bg-success/10 text-success border-success/20",
  kickoff:       "bg-success/10 text-success border-success/20",
  active:        "bg-success/20 text-success border-success/30",
};

const KYC_CLS: Record<string, string> = {
  verified: "bg-success/10 text-success border-success/20",
  pending:  "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-error/10 text-error border-error/20",
  expired:  "bg-error/10 text-error border-error/20",
};

type StageFilter = "" | Client["stage"];

const STAGE_FILTERS: { value: StageFilter; label: string }[] = [
  { value: "",              label: "All" },
  { value: "questionnaire", label: "Questionnaire" },
  { value: "proposal",      label: "Proposal" },
  { value: "strategy",      label: "Strategy" },
  { value: "contract",      label: "Contract" },
  { value: "invoice",       label: "Invoice" },
  { value: "active",        label: "Active" },
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRow[] | undefined>(undefined);
  const [stageFilter, setStageFilter] = useState<StageFilter>("");

  useEffect(() => {
    const supabase = createClient();

    async function fetch() {
      const [clientsRes, kycRes] = await Promise.all([
        supabase
          .from("clients")
          .select(
            "id, company_name, client_ref, contact_name, contact_email, stage, subscription_status, founding_client, activated_at, license_tier, plan_name, created_at"
          )
          .eq("archived", false)
          .order("created_at", { ascending: false }),
        supabase
          .from("kyc_verifications")
          .select("client_id, status"),
      ]);

      const clients = clientsRes.data ?? [];
      const kycMap: Record<string, string> = {};
      for (const row of (kycRes.data ?? [])) kycMap[row.client_id] = row.status;

      setCompanies(
        clients.map((c: any) => ({
          ...c,
          kyc_status: kycMap[c.id] ?? null,
        }))
      );
    }

    fetch();
  }, []);

  if (companies === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  const filtered = stageFilter
    ? companies.filter((c) => c.stage === stageFilter)
    : companies;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">Companies</h1>
        <p className="text-muted text-sm mt-1">
          All client companies across the full pipeline. {companies.length} total.
        </p>
      </div>

      {/* Stage filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STAGE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStageFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
              stageFilter === f.value
                ? "bg-highlight text-white border-highlight"
                : "bg-white border-grid-300 text-muted-2 hover:border-highlight/40 hover:text-foreground"
            )}
          >
            {f.label}
            {` (${f.value === "" ? companies.length : companies.filter((c) => c.stage === f.value).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 py-16 text-center">
          <p className="text-muted-2 text-sm">No companies in this stage.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grid-300 bg-grid-100">
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">KYC</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Activation</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Since</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-muted-2 uppercase tracking-wider">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-300">
                {filtered.map((company) => (
                  <tr key={company.id} className="hover:bg-grid-100/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground">{company.company_name}</p>
                        {company.founding_client && (
                          <span title="Founding Client">
                            <Star className="h-3 w-3 text-highlight shrink-0" />
                          </span>
                        )}
                      </div>
                      {company.client_ref && (
                        <p className="text-xs font-mono text-muted-2">{company.client_ref}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{company.contact_name}</p>
                      <a
                        href={`mailto:${company.contact_email}`}
                        className="text-xs font-mono text-highlight hover:underline"
                      >
                        {company.contact_email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex text-xs font-semibold px-2 py-0.5 rounded border",
                          STAGE_CLS[company.stage] ?? "bg-grid-300 text-muted border-grid-500"
                        )}
                      >
                        {STAGE_LABELS[company.stage] ?? company.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground capitalize">{company.license_tier ?? "trial"}</p>
                      {company.plan_name && (
                        <p className="text-xs text-muted-2">{company.plan_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {company.kyc_status ? (
                        <span
                          className={cn(
                            "inline-flex text-xs font-semibold px-2 py-0.5 rounded border capitalize",
                            KYC_CLS[company.kyc_status] ?? "bg-grid-300 text-muted border-grid-500"
                          )}
                        >
                          {company.kyc_status}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-2">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-2 font-mono">
                      {company.activated_at ? formatDate(company.activated_at) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-2 font-mono">
                      {formatDate(company.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clients/${company.id}`}
                        className="inline-flex items-center gap-1 text-xs text-highlight hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Full Record
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
