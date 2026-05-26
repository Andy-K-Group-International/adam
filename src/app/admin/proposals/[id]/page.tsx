"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getProposalById, updateProposal } from "@/lib/supabase/queries/proposals";
import { getClientById } from "@/lib/supabase/queries/clients";
import { createContract } from "@/lib/supabase/queries/contracts";
import { sendProposalPublished } from "@/app/actions/email";
import {
  proposalStatusStyle, proposalStatusLabel, calcTotals, formatCurrency,
  buildRecommendedServicesContent, SECTION_KEYS,
} from "@/lib/proposal-content";
import { getContractTemplate } from "@/lib/contract-templates";
import type { Proposal, Client, ProposalInvestment, ProposalRecurringItem, ProposalOneTimeItem, StrategyType } from "@/lib/supabase/types";
import Link from "next/link";
import {
  ArrowLeft, Send, FileText, Save, Sparkles, Lock, Unlock, Edit2,
  Plus, Trash2, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { siteConfig } from "@/lib/data";

const SERVICE_LABELS: Record<string, string> = {
  b2b: "B2B Service Agreement",
  b2g: "B2G Service Agreement",
  adam_license: "A.D.A.M. License",
  end_to_end: "End-to-End Development",
};

const EDITABLE_SECTIONS = new Set([
  "executive_summary", "recommended_services", "investment_overview",
  "how_we_work", "why_andyk", "what_happens_next", "terms_summary",
]);

const READ_ONLY_SECTIONS = new Set(["about_you"]);

export default function AdminProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;
  const { user } = useCurrentUser();

  const [proposal, setProposal] = useState<Proposal | null | undefined>(undefined);
  const [client, setClient] = useState<Client | null>(null);

  // Per-section edit
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Investment editor
  const [isEditingInvestment, setIsEditingInvestment] = useState(false);
  const [editInvestment, setEditInvestment] = useState<ProposalInvestment | null>(null);

  // Unlock modal
  const [isUnlockMode, setIsUnlockMode] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");

  // Loading states
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isSavingInvestment, setIsSavingInvestment] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    try {
      const p = await getProposalById(supabase, proposalId);
      setProposal(p);
      if (p.client_id) {
        getClientById(supabase, p.client_id).then(setClient).catch(() => null);
      }
    } catch {
      setProposal(null);
    }
  }, [proposalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (proposal === undefined) return <LoadingSpinner className="min-h-[60vh]" />;
  if (!proposal) {
    return <div className="text-center py-20"><p className="text-muted-2">Proposal not found</p></div>;
  }

  const sortedSections = [...proposal.sections].sort((a, b) => a.order - b.order);
  const investment = proposal.addons as ProposalInvestment | null;
  const { totalMonthly, totalOneTime } = investment ? calcTotals(investment) : { totalMonthly: 0, totalOneTime: 0 };

  const isLocked = proposal.commercials_locked;
  const canPublish = ["draft", "changes_requested", "unlocked"].includes(proposal.status);
  const canUnlock = proposal.status === "confirmed" && isLocked;
  const canCreateContract = (proposal.status === "confirmed" || proposal.status === "approved") && !proposal.contract_id && !!proposal.client_id;

  // ── Section editing ──────────────────────────────────────────────

  const startEditSection = (key: string, content: string) => {
    setEditingSection(key);
    setEditContent(content);
  };

  const cancelEditSection = () => {
    setEditingSection(null);
    setEditContent("");
  };

  const saveSection = async () => {
    if (!editingSection) return;
    setIsSavingSection(true);
    try {
      const supabase = createClient();
      const updated = await updateProposal(supabase, proposalId, {
        sections: proposal.sections.map((s) =>
          s.key === editingSection ? { ...s, content: editContent } : s
        ),
      });
      setProposal(updated);
      setEditingSection(null);
    } catch (err) {
      console.error("Failed to save section:", err);
    } finally {
      setIsSavingSection(false);
    }
  };

  // ── AI Executive Summary ────────────────────────────────────────

  const generateAISummary = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/ai/generate-executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId }),
      });
      const data = await res.json();
      if (data.summary) {
        const supabase = createClient();
        const updated = await updateProposal(supabase, proposalId, {
          sections: proposal.sections.map((s) =>
            s.key === "executive_summary" ? { ...s, content: data.summary } : s
          ),
        });
        setProposal(updated);
        setEditContent(data.summary);
      }
    } catch (err) {
      console.error("AI generation failed:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ── Service type update ─────────────────────────────────────────

  const handleServiceTypeChange = async (newType: StrategyType) => {
    if (isLocked) return;
    const supabase = createClient();
    const updatedSections = proposal.sections.map((s) =>
      s.key === "recommended_services"
        ? { ...s, content: buildRecommendedServicesContent(newType, client?.company_name ?? "") }
        : s
    );
    const updated = await updateProposal(supabase, proposalId, {
      service_type: newType,
      sections: updatedSections,
    });
    setProposal(updated);
  };

  // ── Investment editor ───────────────────────────────────────────

  const startEditInvestment = () => {
    setEditInvestment(investment ?? {
      currency: "GBP",
      billingCycle: "monthly",
      paymentTerms: 30,
      paymentMethod: "Bank transfer (Revolut Business)",
      recurringItems: [{ name: "", monthly: 0 }],
      oneTimeItems: [],
    });
    setIsEditingInvestment(true);
  };

  const saveInvestment = async () => {
    if (!editInvestment) return;
    setIsSavingInvestment(true);
    try {
      const supabase = createClient();
      const updated = await updateProposal(supabase, proposalId, { addons: editInvestment });
      setProposal(updated);
      setIsEditingInvestment(false);
    } catch (err) {
      console.error("Failed to save investment:", err);
    } finally {
      setIsSavingInvestment(false);
    }
  };

  // ── Publish ─────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!client) return;
    setIsPublishing(true);
    try {
      const supabase = createClient();
      const updated = await updateProposal(supabase, proposalId, {
        status: "published",
        sent_to_client_at: new Date().toISOString(),
      });
      setProposal(updated);
      await sendProposalPublished({
        clientEmail: client.contact_email,
        clientName: client.contact_name,
        proposalTitle: proposal.title,
        proposalRef: proposal.proposal_ref,
        proposalId,
        validUntil: proposal.valid_until,
      });
    } catch (err) {
      console.error("Failed to publish:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Unlock ──────────────────────────────────────────────────────

  const handleUnlock = async () => {
    if (!unlockReason.trim()) return;
    setIsUnlocking(true);
    try {
      const supabase = createClient();
      const updated = await updateProposal(supabase, proposalId, {
        status: "unlocked",
        commercials_locked: false,
        admin_notes: [proposal.admin_notes, `[UNLOCK ${new Date().toISOString()}] ${unlockReason.trim()}`]
          .filter(Boolean).join("\n\n"),
      });
      setProposal(updated);
      setIsUnlockMode(false);
      setUnlockReason("");
    } catch (err) {
      console.error("Failed to unlock:", err);
    } finally {
      setIsUnlocking(false);
    }
  };

  // ── Create Contract ─────────────────────────────────────────────

  const handleCreateContract = async () => {
    if (!proposal.client_id || !user || !client) return;
    setIsCreatingContract(true);
    try {
      const supabase = createClient();
      const serviceType: StrategyType = (proposal.service_type ?? client.strategy_type ?? "b2b") as StrategyType;
      const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      const template = getContractTemplate(serviceType, client.contact_name, client.company_name, date);

      const visibleSections = proposal.sections.filter((s) => s.isVisible && s.key !== "investment_overview" && s.key !== "approval").sort((a, b) => a.order - b.order);
      const commercialsSnapshot = {
        proposalRef: proposal.proposal_ref ?? null,
        proposalTitle: proposal.title,
        snapshotAt: new Date().toISOString(),
        sections: visibleSections.map((s) => ({ title: s.title, content: s.content })),
      };

      const contract = await createContract(supabase, {
        client_id: proposal.client_id,
        proposal_id: proposal.id,
        title: template.title,
        content: "",
        contract_type: "service_agreement",
        service_type: serviceType,
        commercials_snapshot: commercialsSnapshot,
        version: 1,
        sections: template.sections,
        client_signature: null, client_signed_at: null, client_signed_by: null,
        admin_signature: null, admin_signed_at: null, admin_signed_by: null,
        appendices: template.appendices,
        created_by: user.id,
        published_at: null, viewed_at: null, finalized_at: null,
      });
      await updateProposal(supabase, proposalId, { contract_id: contract.id });
      router.push(`/admin/contracts/${contract.id}`);
    } catch (err) {
      console.error("Failed to create contract:", err);
    } finally {
      setIsCreatingContract(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl">
      {/* Back + title */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/proposals" className="text-muted-2 hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-serif font-semibold text-foreground truncate">{proposal.title}</h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {(client?.client_ref || proposal.proposal_ref) && (
              <span className="font-mono text-xs font-semibold text-highlight tracking-wider">
                {[client?.client_ref, proposal.proposal_ref].filter(Boolean).join(" / ")}
              </span>
            )}
            {client && (
              <>
                <span className="text-muted-2 text-xs">·</span>
                <Link href={`/admin/clients/${client.id}`} className="text-xs text-muted-2 hover:text-highlight transition-colors">
                  {client.company_name}
                </Link>
              </>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded">
                <Lock className="h-2.5 w-2.5" /> LOCKED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Action Bar */}
      <div className="bg-white rounded-xl border border-grid-300 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", proposalStatusStyle(proposal.status))}>
              {proposalStatusLabel(proposal.status)}
            </span>
            {/* Service type selector */}
            <select
              value={proposal.service_type ?? ""}
              onChange={(e) => handleServiceTypeChange(e.target.value as StrategyType)}
              disabled={isLocked}
              className="text-xs border border-grid-500 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 disabled:opacity-50"
            >
              <option value="">No service type</option>
              <option value="b2b">B2B Service Agreement</option>
              <option value="b2g">B2G Service Agreement</option>
              <option value="adam_license">A.D.A.M. License</option>
              <option value="end_to_end">End-to-End Development</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* PDF export */}
            <a
              href={`/api/pdf/proposal/${proposalId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground bg-grid-300 hover:bg-grid-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              PDF
            </a>

            {canPublish && client && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-info hover:bg-info/90 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {isPublishing ? "Publishing…" : "Publish to Client"}
              </button>
            )}
            {canUnlock && (
              <button
                onClick={() => setIsUnlockMode(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-warning bg-warning/10 hover:bg-warning/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Unlock className="h-3.5 w-3.5" />
                Unlock
              </button>
            )}
            {canCreateContract && (
              <button
                onClick={handleCreateContract}
                disabled={isCreatingContract}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-success hover:bg-success/90 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileText className="h-3.5 w-3.5" />
                {isCreatingContract ? "Creating…" : "Create Contract"}
              </button>
            )}
            {proposal.contract_id && (
              <Link href={`/admin/contracts/${proposal.contract_id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground bg-grid-300 hover:bg-grid-500 px-3 py-1.5 rounded-lg transition-colors">
                <FileText className="h-3.5 w-3.5" />
                View Contract
              </Link>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-3 pt-3 border-t border-grid-300 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Prepared For", value: client ? `${client.contact_name}, ${client.company_name}` : "—" },
            { label: "Prepared By", value: "Andy'K Group International LTD" },
            { label: "Date", value: formatDate(proposal.created_at) },
            { label: "Valid Until", value: proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-mono text-muted-2 uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-xs text-foreground font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Client comment */}
        {proposal.client_comment && (
          <div className="mt-3 pt-3 border-t border-grid-300 bg-warning/5 rounded-lg px-3 py-2.5">
            <p className="text-xs font-semibold text-warning mb-1">Client Comment</p>
            <p className="text-sm text-muted whitespace-pre-wrap">{proposal.client_comment}</p>
          </div>
        )}
      </div>

      {/* Unlock modal */}
      {isUnlockMode && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Unlock className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">Unlock Proposal</h3>
          </div>
          <p className="text-sm text-muted mb-3">Unlocking will remove the commercial lock and allow the client to re-confirm. This action is logged.</p>
          <textarea
            value={unlockReason}
            onChange={(e) => setUnlockReason(e.target.value)}
            placeholder="Reason for unlocking (required)…"
            rows={3}
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-highlight/30 mb-3"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleUnlock}
              disabled={isUnlocking || !unlockReason.trim()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-warning hover:bg-warning/90 px-4 py-1.5 rounded-lg disabled:opacity-50"
            >
              {isUnlocking ? "Unlocking…" : "Confirm Unlock"}
            </button>
            <button onClick={() => setIsUnlockMode(false)} className="text-sm text-muted-2 hover:text-foreground px-4 py-1.5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sortedSections.map((section) => {
          const isEditingSec = editingSection === section.key;
          const isReadOnly = READ_ONLY_SECTIONS.has(section.key) || (isLocked && EDITABLE_SECTIONS.has(section.key));
          const isInvestmentSec = section.key === "investment_overview";

          if (isInvestmentSec) {
            return (
              <div key={section.key} className="bg-white rounded-xl border border-grid-300 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-grid-300 bg-grid-300/20">
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  {!isLocked && (
                    <button
                      onClick={isEditingInvestment ? () => setIsEditingInvestment(false) : startEditInvestment}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-2 hover:text-foreground transition-colors"
                    >
                      {isEditingInvestment ? <ChevronUp className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                      {isEditingInvestment ? "Collapse" : "Edit"}
                    </button>
                  )}
                </div>

                {isEditingInvestment && editInvestment ? (
                  <InvestmentEditor
                    inv={editInvestment}
                    onChange={setEditInvestment}
                    onSave={saveInvestment}
                    onCancel={() => setIsEditingInvestment(false)}
                    isSaving={isSavingInvestment}
                  />
                ) : (
                  <InvestmentDisplay inv={investment} totalMonthly={totalMonthly} totalOneTime={totalOneTime} />
                )}
              </div>
            );
          }

          return (
            <div key={section.key} className={cn("bg-white rounded-xl border overflow-hidden", !section.isVisible && "opacity-60", section.isVisible ? "border-grid-300" : "border-grid-300")}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-grid-300 bg-grid-300/20">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  {section.key === "about_you" && (
                    <span className="text-[10px] font-mono text-muted-2 bg-grid-300 px-1.5 py-0.5 rounded">auto-filled</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {section.key === "executive_summary" && (
                    <button
                      onClick={generateAISummary}
                      disabled={isGeneratingAI}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-highlight hover:text-highlight/80 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingAI ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      {isGeneratingAI ? "Generating…" : "Generate AI"}
                    </button>
                  )}
                  {!isReadOnly && !isEditingSec && (
                    <button
                      onClick={() => startEditSection(section.key, section.content)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-2 hover:text-foreground transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5">
                {isEditingSec ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={12}
                      className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30 font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveSection}
                        disabled={isSavingSection}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-highlight hover:bg-highlight/90 px-4 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {isSavingSection ? "Saving…" : "Save"}
                      </button>
                      <button onClick={cancelEditSection} className="text-sm text-muted-2 hover:text-foreground px-3 py-1.5">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">
                    {section.content || <span className="text-muted-2 italic">No content yet.</span>}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Notes */}
      {proposal.admin_notes && (
        <div className="mt-4 bg-white rounded-xl border border-grid-300 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Admin Notes</h3>
          <p className="text-sm text-muted whitespace-pre-wrap">{proposal.admin_notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Investment Display ──────────────────────────────────────────────────────

function InvestmentDisplay({
  inv,
  totalMonthly,
  totalOneTime,
}: {
  inv: ProposalInvestment | null;
  totalMonthly: number;
  totalOneTime: number;
}) {
  if (!inv) {
    return (
      <div className="p-5 text-sm text-muted-2 text-center py-8">
        No investment overview configured. Click Edit to add pricing.
      </div>
    );
  }

  const cur = inv.currency;

  return (
    <div className="p-5 space-y-5">
      {/* Recurring */}
      {inv.recurringItems.filter((i) => i.name).length > 0 && (
        <div>
          <p className="text-xs font-mono text-muted-2 uppercase tracking-wider mb-2">Monthly Recurring</p>
          <table className="w-full text-sm">
            <tbody>
              {inv.recurringItems.filter((i) => i.name).map((item, i) => (
                <tr key={i} className="border-b border-grid-300 last:border-b-0">
                  <td className="py-2 text-foreground">{item.name}</td>
                  <td className="py-2 text-right font-medium text-foreground">{formatCurrency(item.monthly, cur)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="pt-3 text-foreground">Total Monthly</td>
                <td className="pt-3 text-right text-foreground">{formatCurrency(totalMonthly, cur)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* One-time */}
      {inv.oneTimeItems.filter((i) => i.name).length > 0 && (
        <div>
          <p className="text-xs font-mono text-muted-2 uppercase tracking-wider mb-2">One-Time Costs</p>
          <table className="w-full text-sm">
            <tbody>
              {inv.oneTimeItems.filter((i) => i.name).map((item, i) => (
                <tr key={i} className="border-b border-grid-300 last:border-b-0">
                  <td className="py-2 text-foreground">{item.name}</td>
                  <td className="py-2 text-right font-medium text-foreground">{formatCurrency(item.amount, cur)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="pt-3 text-foreground">Total One-Time</td>
                <td className="pt-3 text-right text-foreground">{formatCurrency(totalOneTime, cur)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Settings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-grid-300">
        {[
          { label: "Currency", value: inv.currency },
          { label: "Billing", value: inv.billingCycle },
          { label: "Payment Terms", value: `${inv.paymentTerms} days` },
          { label: "Method", value: inv.paymentMethod },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-mono text-muted-2 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-xs text-foreground font-medium capitalize">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Investment Editor ───────────────────────────────────────────────────────

function InvestmentEditor({
  inv,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: {
  inv: ProposalInvestment;
  onChange: (inv: ProposalInvestment) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const { totalMonthly, totalOneTime } = calcTotals(inv);

  const updateRecurring = (index: number, field: keyof ProposalRecurringItem, value: string | number) => {
    const items = inv.recurringItems.map((it, i) => i === index ? { ...it, [field]: value } : it);
    onChange({ ...inv, recurringItems: items });
  };

  const addRecurring = () => onChange({ ...inv, recurringItems: [...inv.recurringItems, { name: "", monthly: 0 }] });
  const removeRecurring = (i: number) => onChange({ ...inv, recurringItems: inv.recurringItems.filter((_, idx) => idx !== i) });

  const updateOneTime = (index: number, field: keyof ProposalOneTimeItem, value: string | number) => {
    const items = inv.oneTimeItems.map((it, i) => i === index ? { ...it, [field]: value } : it);
    onChange({ ...inv, oneTimeItems: items });
  };

  const addOneTime = () => onChange({ ...inv, oneTimeItems: [...inv.oneTimeItems, { name: "", amount: 0 }] });
  const removeOneTime = (i: number) => onChange({ ...inv, oneTimeItems: inv.oneTimeItems.filter((_, idx) => idx !== i) });

  const inputClass = "w-full text-sm border border-grid-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 bg-white";

  return (
    <div className="p-5 space-y-6">
      {/* Settings row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-2 mb-1">Currency</label>
          <select value={inv.currency} onChange={(e) => onChange({ ...inv, currency: e.target.value })} className={inputClass}>
            {["GBP", "USD", "EUR", "SEK", "NOK", "DKK", "PLN", "CZK"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-2 mb-1">Billing Cycle</label>
          <select value={inv.billingCycle} onChange={(e) => onChange({ ...inv, billingCycle: e.target.value as ProposalInvestment["billingCycle"] })} className={inputClass}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="one-time">One-time</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-2 mb-1">Payment Terms</label>
          <select value={inv.paymentTerms} onChange={(e) => onChange({ ...inv, paymentTerms: Number(e.target.value) as ProposalInvestment["paymentTerms"] })} className={inputClass}>
            {[7, 15, 21, 30].map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-2 mb-1">Payment Method</label>
          <input type="text" value={inv.paymentMethod} onChange={(e) => onChange({ ...inv, paymentMethod: e.target.value })} className={inputClass} />
        </div>
      </div>

      {/* Recurring items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-muted-2 uppercase tracking-wider">Monthly Recurring Items</p>
          <button type="button" onClick={addRecurring} className="inline-flex items-center gap-1 text-xs font-medium text-highlight hover:text-highlight/80">
            <Plus className="h-3.5 w-3.5" /> Add Line
          </button>
        </div>
        <div className="space-y-2">
          {inv.recurringItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" placeholder="Service / item name" value={item.name} onChange={(e) => updateRecurring(i, "name", e.target.value)} className={cn(inputClass, "flex-1")} />
              <input type="number" placeholder="0" value={item.monthly || ""} onChange={(e) => updateRecurring(i, "monthly", parseFloat(e.target.value) || 0)} className={cn(inputClass, "w-28 text-right")} />
              <button type="button" onClick={() => removeRecurring(i)} className="p-1.5 text-muted-2 hover:text-error transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {inv.recurringItems.length > 0 && (
            <div className="flex justify-between text-sm font-semibold text-foreground pt-1 border-t border-grid-300">
              <span>Total Monthly</span>
              <span>{formatCurrency(totalMonthly, inv.currency)}</span>
            </div>
          )}
        </div>
      </div>

      {/* One-time items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-muted-2 uppercase tracking-wider">One-Time Costs</p>
          <button type="button" onClick={addOneTime} className="inline-flex items-center gap-1 text-xs font-medium text-highlight hover:text-highlight/80">
            <Plus className="h-3.5 w-3.5" /> Add Line
          </button>
        </div>
        <div className="space-y-2">
          {inv.oneTimeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" placeholder="Item / setup cost" value={item.name} onChange={(e) => updateOneTime(i, "name", e.target.value)} className={cn(inputClass, "flex-1")} />
              <input type="number" placeholder="0" value={item.amount || ""} onChange={(e) => updateOneTime(i, "amount", parseFloat(e.target.value) || 0)} className={cn(inputClass, "w-28 text-right")} />
              <button type="button" onClick={() => removeOneTime(i)} className="p-1.5 text-muted-2 hover:text-error transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {inv.oneTimeItems.length > 0 && (
            <div className="flex justify-between text-sm font-semibold text-foreground pt-1 border-t border-grid-300">
              <span>Total One-Time</span>
              <span>{formatCurrency(totalOneTime, inv.currency)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-grid-300">
        <button onClick={onSave} disabled={isSaving} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-highlight hover:bg-highlight/90 px-4 py-1.5 rounded-lg disabled:opacity-50">
          <Save className="h-3.5 w-3.5" />
          {isSaving ? "Saving…" : "Save Investment"}
        </button>
        <button onClick={onCancel} className="text-sm text-muted-2 hover:text-foreground px-3 py-1.5">Cancel</button>
      </div>
    </div>
  );
}
