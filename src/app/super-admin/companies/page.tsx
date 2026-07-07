"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import { ExternalLink, Star, Zap, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/lib/supabase/types";
import { activateCompanyAction } from "@/app/actions/companies";

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
  | "onboarding_status"
  | "company_admin_email"
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

interface ModalState {
  company: CompanyRow;
  adminEmail: string;
  firstName: string;
  lastName: string;
  licenseTier: "trial" | "full" | "founding";
  confirmed: boolean;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRow[] | undefined>(undefined);
  const [stageFilter, setStageFilter] = useState<StageFilter>("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [actionResult, setActionResult] = useState<{ error?: string; success?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadCompanies();
  }, []);

  function loadCompanies() {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("clients")
        .select(
          "id, company_name, client_ref, contact_name, contact_email, stage, subscription_status, founding_client, activated_at, license_tier, plan_name, created_at, onboarding_status, company_admin_email"
        )
        .eq("archived", false)
        .order("created_at", { ascending: false }),
      supabase.from("kyc_verifications").select("client_id, status"),
    ]).then(([clientsRes, kycRes]) => {
      const clients = clientsRes.data ?? [];
      const kycMap: Record<string, string> = {};
      for (const row of (kycRes.data ?? [])) kycMap[row.client_id] = row.status;
      setCompanies(
        clients.map((c: any) => ({ ...c, kyc_status: kycMap[c.id] ?? null }))
      );
    });
  }

  function openModal(company: CompanyRow) {
    const nameParts = (company.contact_name ?? "").trim().split(/\s+/);
    setActionResult(null);
    setModal({
      company,
      adminEmail: company.contact_email ?? "",
      firstName: nameParts[0] ?? "",
      lastName: nameParts.slice(1).join(" ") || "",
      licenseTier: (company.license_tier as ModalState["licenseTier"]) ?? "trial",
      confirmed: false,
    });
  }

  function closeModal() {
    if (isPending) return;
    setModal(null);
    setActionResult(null);
  }

  function handleActivate() {
    if (!modal || !modal.confirmed || isPending) return;
    const { company, adminEmail, firstName, lastName, licenseTier } = modal;

    startTransition(async () => {
      const result = await activateCompanyAction(company.id, {
        adminEmail,
        firstName,
        lastName,
        licenseTier,
      });

      if (result.error) {
        setActionResult({ error: result.error });
      } else {
        setActionResult({ success: `Account created for ${adminEmail}. Activation email sent.` });
        loadCompanies();
      }
    });
  }

  if (companies === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  const filtered = stageFilter
    ? companies.filter((c) => c.stage === stageFilter)
    : companies;

  const isActivated = (c: CompanyRow) =>
    c.onboarding_status === "activated" || c.onboarding_status === "completed";

  const canActivate = (c: CompanyRow) =>
    c.onboarding_status === "pending";

  const canSubmit =
    modal !== null &&
    modal.confirmed &&
    modal.adminEmail.trim() !== "" &&
    modal.firstName.trim() !== "" &&
    modal.lastName.trim() !== "" &&
    !isPending;

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
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-2 uppercase tracking-wider">Actions</th>
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
                    <td className="px-4 py-3">
                      {isActivated(company) ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          Activated
                          {company.company_admin_email && (
                            <span className="text-muted-2 font-normal truncate max-w-[140px]" title={company.company_admin_email}>
                              · {company.company_admin_email}
                            </span>
                          )}
                        </span>
                      ) : canActivate(company) ? (
                        <button
                          onClick={() => openModal(company)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-highlight/10 text-highlight border border-highlight/30 hover:bg-highlight/20 transition-colors"
                        >
                          <Zap className="h-3 w-3" />
                          Activate Company
                        </button>
                      ) : (
                        <span className="text-xs text-muted-2">—</span>
                      )}
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

      {/* ── Activate Company Modal ─────────────────────────────────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl border border-grid-300 shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-grid-300">
              <div>
                <h2 className="text-lg font-serif font-semibold text-foreground">Activate Company</h2>
                <p className="text-sm text-muted mt-0.5">{modal.company.company_name}</p>
              </div>
              <button
                onClick={closeModal}
                disabled={isPending}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-grid-100 transition-colors disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Warning */}
              <div className="flex gap-3 bg-warning/8 border border-warning/30 rounded-xl p-4">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">This action is irreversible</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Clicking <strong>Activate</strong> will immediately create a live Supabase Auth account
                    and send a real activation email with a temporary password to the address below.
                    The account goes live the moment you confirm.
                  </p>
                </div>
              </div>

              {/* Result feedback */}
              {actionResult?.error && (
                <div className="flex gap-2 bg-error/8 border border-error/30 rounded-xl px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-error shrink-0 mt-0.5" />
                  <p className="text-sm text-error">{actionResult.error}</p>
                </div>
              )}
              {actionResult?.success && (
                <div className="flex gap-2 bg-success/8 border border-success/30 rounded-xl px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <p className="text-sm text-success">{actionResult.success}</p>
                </div>
              )}

              {!actionResult?.success && (
                <>
                  {/* Admin email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-muted-2 uppercase tracking-wider">
                      Admin Email <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      value={modal.adminEmail}
                      onChange={(e) => setModal({ ...modal, adminEmail: e.target.value })}
                      placeholder="admin@company.com"
                      disabled={isPending}
                      className="w-full px-3 py-2 text-sm border border-grid-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-highlight/40 focus:border-highlight disabled:opacity-50"
                    />
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-muted-2 uppercase tracking-wider">
                        First Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={modal.firstName}
                        onChange={(e) => setModal({ ...modal, firstName: e.target.value })}
                        placeholder="First"
                        disabled={isPending}
                        className="w-full px-3 py-2 text-sm border border-grid-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-highlight/40 focus:border-highlight disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-muted-2 uppercase tracking-wider">
                        Last Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={modal.lastName}
                        onChange={(e) => setModal({ ...modal, lastName: e.target.value })}
                        placeholder="Last"
                        disabled={isPending}
                        className="w-full px-3 py-2 text-sm border border-grid-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-highlight/40 focus:border-highlight disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* License tier */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-muted-2 uppercase tracking-wider">
                      License Tier <span className="text-error">*</span>
                    </label>
                    <select
                      value={modal.licenseTier}
                      onChange={(e) => setModal({ ...modal, licenseTier: e.target.value as ModalState["licenseTier"] })}
                      disabled={isPending}
                      className="w-full px-3 py-2 text-sm border border-grid-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-highlight/40 focus:border-highlight disabled:opacity-50"
                    >
                      <option value="trial">Trial License</option>
                      <option value="full">Full License</option>
                      <option value="founding">Founding Client License</option>
                    </select>
                  </div>

                  {/* Confirmation checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={modal.confirmed}
                      onChange={(e) => setModal({ ...modal, confirmed: e.target.checked })}
                      disabled={isPending}
                      className="mt-0.5 h-4 w-4 rounded border-grid-300 accent-highlight disabled:opacity-50 cursor-pointer"
                    />
                    <span className="text-xs text-muted leading-relaxed group-hover:text-foreground transition-colors">
                      I confirm that this will create a <strong className="text-foreground">live login account</strong> and
                      send a <strong className="text-foreground">real activation email</strong> to{" "}
                      <span className="font-mono text-highlight">{modal.adminEmail || "the address above"}</span> immediately.
                    </span>
                  </label>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-grid-300 bg-grid-100/50 rounded-b-2xl">
              {actionResult?.success ? (
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-highlight text-white hover:bg-highlight/90 transition-colors"
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    onClick={closeModal}
                    disabled={isPending}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-grid-300 text-muted hover:text-foreground hover:border-grid-500 transition-colors disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleActivate}
                    disabled={!canSubmit}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      canSubmit
                        ? "bg-highlight text-white hover:bg-highlight/90"
                        : "bg-grid-300 text-muted-2 cursor-not-allowed"
                    )}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {isPending ? "Activating…" : "Activate"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
