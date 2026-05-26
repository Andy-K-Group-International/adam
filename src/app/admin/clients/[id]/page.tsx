"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getClientById, updateClient } from "@/lib/supabase/queries/clients";
import { listForClient as listActivitiesForClient } from "@/lib/supabase/queries/activity-log";
import { getQuestionnaireById } from "@/lib/supabase/queries/questionnaires";
import { createProposal } from "@/lib/supabase/queries/proposals";
import { defaultInvestment } from "@/lib/proposal-content";
import { listContacts } from "@/lib/supabase/queries/contacts";
import { listClientReports } from "@/lib/supabase/queries/client-reports";
import { archiveClientAction, unarchiveClientAction, reactivateClientAction } from "@/app/actions/clients";
import type { Client, Questionnaire, ActivityLog, StrategyType, Contact } from "@/lib/supabase/types";
import Link from "next/link";
import {
  ArrowLeft, Building2, Mail, Phone, Globe, MapPin, Save, Plus, Trash2,
  Users, RefreshCw, FileText, Archive, ArchiveRestore, RefreshCcw, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { confirmKickoffAction } from "@/app/actions/invoices";
import ContractCard from "@/components/dashboard/ContractCard";
import QuestionnairePreview from "@/components/admin/QuestionnairePreview";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ContactsTab from "@/components/admin/ContactsTab";
import HealthScoreBadge from "@/components/admin/HealthScoreBadge";
import MilestonesTab from "@/components/admin/MilestonesTab";
import MeetingsTab from "@/components/admin/MeetingsTab";
import AnalysisTab from "@/components/admin/AnalysisTab";
import KycTab from "@/components/admin/KycTab";
import { buildStrategyTemplate } from "@/lib/strategy-templates";
import type { StrategyTemplateKey } from "@/lib/strategy-templates";

const stageColors: Record<string, string> = {
  questionnaire: "bg-grid-300 text-muted",
  proposal:      "bg-info/10 text-info",
  strategy:      "bg-highlight/10 text-highlight",
  contract:      "bg-warning/10 text-warning",
  invoice:       "bg-success/10 text-success",
  kickoff:       "bg-success/10 text-success",
};

const stageLabels: Record<string, string> = {
  questionnaire: "Questionnaire",
  proposal:      "Proposal",
  strategy:      "Strategy",
  contract:      "Contract",
  invoice:       "Invoice",
  kickoff:       "Kick-off",
};

type Tab =
  | "overview" | "contacts" | "milestones" | "meetings"
  | "analysis" | "strategy" | "contracts" | "questionnaire"
  | "kickoff" | "kyc" | "activity";

type ChecklistItem = { id: string; label: string; checked: boolean };

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [client, setClient] = useState<(Client & { contracts: any[] }) | null | undefined>(undefined);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [reportCount, setReportCount] = useState(0);

  // Strategy state
  const [strategyType, setStrategyType] = useState<StrategyType | null>(null);
  const [strategyNotes, setStrategyNotes] = useState("");
  const [isSavingStrategy, setIsSavingStrategy] = useState(false);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);

  // Health score
  const [healthScoreLoading, setHealthScoreLoading] = useState(false);

  // Archive state
  const [archiving, setArchiving] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  // Reactivation modal
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [reactivateServiceType, setReactivateServiceType] = useState<StrategyType>("end_to_end");
  const [reactivateNotes, setReactivateNotes] = useState("");
  const [reactivating, setReactivating] = useState(false);
  const [reactivateMsg, setReactivateMsg] = useState("");

  // Kickoff state
  const [kickoffDate, setKickoffDate] = useState("");
  const [kickoffNotes, setKickoffNotes] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isConfirmingKickoff, setIsConfirmingKickoff] = useState(false);
  const [kickoffMsg, setKickoffMsg] = useState("");

  const recalculateHealthScore = async () => {
    setHealthScoreLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/health-score`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setClient((prev) => prev
          ? { ...prev, health_score: json.score, health_score_updated_at: new Date().toISOString() }
          : prev
        );
      }
    } catch { /* silent */ } finally {
      setHealthScoreLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      try {
        const clientData = await getClientById(supabase, clientId);
        setClient(clientData);
        setStrategyType(clientData.strategy_type ?? null);
        setStrategyNotes(clientData.strategy_notes ?? "");
        setKickoffDate(clientData.kickoff_date ? clientData.kickoff_date.slice(0, 16) : "");
        setKickoffNotes(clientData.kickoff_notes ?? "");
        setChecklist(clientData.kickoff_checklist ?? []);

        const [activitiesData, contactsData, reportsData] = await Promise.all([
          listActivitiesForClient(supabase, clientId).catch(() => []),
          listContacts(supabase, clientId).catch(() => []),
          listClientReports(supabase, clientId).catch(() => []),
        ]);
        setActivities(activitiesData);
        setContacts(contactsData);
        setReportCount(reportsData.length);

        if (clientData.questionnaire_id) {
          const qData = await getQuestionnaireById(supabase, clientData.questionnaire_id).catch(() => null);
          setQuestionnaire(qData);
        }
      } catch {
        setClient(null);
      }
    }
    fetchData();
  }, [clientId]);

  if (client === undefined) return <LoadingSpinner className="min-h-[60vh]" />;
  if (!client) {
    return <div className="text-center py-20"><p className="text-muted-2">Client not found</p></div>;
  }

  const primaryContact = contacts.find((c) => c.is_primary) ?? contacts[0] ?? null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview",      label: "Overview" },
    { key: "contacts",      label: `Contacts${contacts.length > 0 ? ` (${contacts.length})` : ""}` },
    { key: "milestones",    label: "Milestones" },
    { key: "meetings",      label: "Meetings" },
    { key: "analysis",      label: "Analysis" },
    { key: "strategy",      label: "Strategy" },
    { key: "contracts",     label: `Contracts (${client.contracts?.length || 0})` },
    { key: "questionnaire", label: "Questionnaire" },
    { key: "kickoff",       label: "Kickoff" },
    { key: "kyc",           label: "KYC" },
    { key: "activity",      label: "Activity" },
  ];

  // ── Kickoff handlers ────────────────────────────────────────────────────────
  const handleConfirmKickoff = async () => {
    setIsConfirmingKickoff(true);
    setKickoffMsg("");
    const result = await confirmKickoffAction(
      clientId,
      kickoffDate ? new Date(kickoffDate).toISOString() : null,
      kickoffNotes,
      checklist
    );
    if (result.error) { setKickoffMsg(result.error); }
    else {
      setClient((prev) => prev ? { ...prev, kickoff_confirmed_at: new Date().toISOString(), stage: "kickoff" as const } : prev);
      setKickoffMsg("Kickoff confirmed. Email sent to client.");
    }
    setIsConfirmingKickoff(false);
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist((prev) => [...prev, { id: crypto.randomUUID(), label: newChecklistItem.trim(), checked: false }]);
    setNewChecklistItem("");
  };

  const removeChecklistItem = (id: string) => setChecklist((prev) => prev.filter((i) => i.id !== id));
  const toggleChecklistItem = (id: string) =>
    setChecklist((prev) => prev.map((i) => i.id === id ? { ...i, checked: !i.checked } : i));

  // ── Strategy handlers ───────────────────────────────────────────────────────
  const handleSaveStrategy = async () => {
    setIsSavingStrategy(true);
    try {
      const supabase = createClient();
      const updated = await updateClient(supabase, clientId, {
        strategy_type: strategyType,
        strategy_notes: strategyNotes.trim() || null,
      } as Partial<Client>);
      setClient((prev) => prev ? { ...prev, ...updated } : prev);
    } catch (err) {
      console.error("Failed to save strategy:", err);
    } finally {
      setIsSavingStrategy(false);
    }
  };

  const handleCreateProposalFromStrategy = async () => {
    if (!strategyNotes.trim()) return;
    setIsCreatingProposal(true);
    try {
      const supabase = createClient();
      const proposal = await createProposal(supabase, {
        client_id: clientId,
        questionnaire_id: "",
        template_id: null,
        title: `Proposal — ${client.company_name}`,
        proposal_ref: null,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        service_type: (client.strategy_type ?? "b2b") as StrategyType,
        commercials_locked: false,
        addons: defaultInvestment(),
        status: "draft" as const,
        sections: [{ key: "strategy", title: "Strategy Overview", content: strategyNotes.trim(), order: 0, isVisible: true }],
        ai_evaluation: null,
        admin_notes: strategyType ? `Strategy type: ${strategyType}` : null,
        client_comment: null,
        approved_by_admin_at: null,
        sent_to_client_at: null,
        client_approved_at: null,
        contract_id: null,
      });
      router.push(`/admin/proposals/${proposal.id}`);
    } catch (err) {
      console.error("Failed to create proposal:", err);
      setIsCreatingProposal(false);
    }
  };

  const insertFormatting = (syntax: string) => {
    const textarea = document.getElementById("strategy-notes") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = strategyNotes.slice(start, end);
    let replacement = "";
    if (syntax === "bold") replacement = `**${selected || "bold text"}**`;
    else if (syntax === "heading") replacement = `\n## ${selected || "Heading"}\n`;
    else if (syntax === "bullet") replacement = `\n- ${selected || "item"}`;
    const newValue = strategyNotes.slice(0, start) + replacement + strategyNotes.slice(end);
    setStrategyNotes(newValue);
    setTimeout(() => {
      textarea.selectionStart = start + replacement.length;
      textarea.selectionEnd = start + replacement.length;
      textarea.focus();
    }, 0);
  };

  // ── Archive handler ─────────────────────────────────────────────────────────
  const handleArchive = async () => {
    setArchiving(true);
    const result = await archiveClientAction(clientId);
    setArchiving(false);
    setArchiveConfirm(false);
    if (!result.error) {
      setClient((prev) => prev ? { ...prev, archived: true, archived_at: new Date().toISOString() } : prev);
    }
  };

  const handleUnarchive = async () => {
    setArchiving(true);
    const result = await unarchiveClientAction(clientId);
    setArchiving(false);
    if (!result.error) {
      setClient((prev) => prev ? { ...prev, archived: false, archived_at: null } : prev);
    }
  };

  // ── Reactivation handler ────────────────────────────────────────────────────
  const handleReactivate = async () => {
    setReactivating(true);
    setReactivateMsg("");
    const result = await reactivateClientAction(clientId, reactivateServiceType, reactivateNotes);
    setReactivating(false);
    if (result.error) {
      setReactivateMsg(result.error);
    } else {
      setClient((prev) => prev ? { ...prev, stage: "proposal" as const } : prev);
      setReactivateOpen(false);
      setReactivateMsg("");
    }
  };

  return (
    <div>
      {/* Archive banner */}
      {client.archived && (
        <div className="flex items-center justify-between rounded-lg bg-warning/8 border border-warning/20 px-4 py-3 text-sm text-warning mb-5">
          <span>This client is archived. Their data is preserved but they are hidden from the main list.</span>
          <button
            onClick={handleUnarchive}
            disabled={archiving}
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg border border-warning/40 text-warning text-xs hover:bg-warning/10 transition-colors"
          >
            <ArchiveRestore className="h-3.5 w-3.5" />
            Unarchive
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link href="/admin/clients" className="text-muted-2 hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-serif font-semibold text-foreground">{client.company_name}</h1>
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", stageColors[client.stage] || "bg-grid-300 text-muted")}>
                {stageLabels[client.stage] || client.stage}
              </span>
              <div className="flex items-center gap-1.5">
                <HealthScoreBadge score={client.health_score ?? null} size="sm" />
                <button
                  onClick={recalculateHealthScore}
                  disabled={healthScoreLoading}
                  title="Recalculate health score"
                  className="h-5 w-5 flex items-center justify-center text-muted-2 hover:text-foreground transition-colors disabled:opacity-40"
                >
                  <RefreshCw className={cn("h-3 w-3", healthScoreLoading && "animate-spin")} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {client.client_ref && (
                <span className="font-mono text-xs font-semibold text-highlight tracking-wider">{client.client_ref}</span>
              )}
              <span className="text-sm text-muted-2">Created {formatDate(client.created_at)}</span>
              {primaryContact && (
                <span className="flex items-center gap-1.5 text-xs text-muted-2">
                  <Users className="h-3 w-3" />
                  <span className="text-foreground font-medium">{primaryContact.name}</span>
                  <span>·</span>
                  <a href={`mailto:${primaryContact.email}`} className="hover:text-highlight transition-colors">{primaryContact.email}</a>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Report button */}
          <Link
            href={`/admin/reports/client/${clientId}/new`}
            className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
          >
            <BarChart2 className="h-4 w-4" />
            New Report
          </Link>

          {/* Reactivate — show for kickoff/completed clients */}
          {(client.stage === "kickoff" || client.archived) && (
            <button
              onClick={() => setReactivateOpen(true)}
              className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Reactivate
            </button>
          )}

          {/* Archive */}
          {!client.archived && (
            archiveConfirm ? (
              <div className="flex gap-1">
                <button
                  onClick={handleArchive}
                  disabled={archiving}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm"
                >
                  {archiving ? "Archiving…" : "Confirm Archive"}
                </button>
                <button onClick={() => setArchiveConfirm(false)} className="h-9 px-3 rounded-lg border border-grid-500 text-sm text-muted-2">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setArchiveConfirm(true)}
                className="inline-flex items-center gap-2 bg-grid-300 text-muted px-3 py-2 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
              >
                <Archive className="h-4 w-4" />
                Archive
              </button>
            )
          )}

          <Link
            href={`/admin/contracts/new?clientId=${clientId}&type=nda`}
            className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
          >
            Create NDA
          </Link>
          <Link
            href={`/admin/contracts/new?clientId=${clientId}`}
            className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient"
          >
            New Contract
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-grid-300 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
              activeTab === tab.key
                ? "border-highlight text-highlight"
                : "border-transparent text-muted-2 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-2 shrink-0" />
                <span className="text-sm text-foreground">{client.company_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-2 shrink-0" />
                <span className="text-sm text-foreground">{client.contact_email}</span>
              </div>
              {client.contact_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-2 shrink-0" />
                  <span className="text-sm text-foreground">{client.contact_phone}</span>
                </div>
              )}
              {client.website_url && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-2 shrink-0" />
                  <a href={client.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-highlight hover:underline">{client.website_url}</a>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-2 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    {client.address.line1}{client.address.line2 ? `, ${client.address.line2}` : ""}<br />
                    {client.address.city}, {client.address.postcode}<br />
                    {client.address.country}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-2 mb-0.5">Stage</p>
                <p className="text-sm text-foreground">{stageLabels[client.stage] || client.stage}</p>
              </div>
              {client.segments && client.segments.length > 0 && (
                <div>
                  <p className="text-xs text-muted-2 mb-1">Segments</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.segments.map((seg) => (
                      <span key={seg} className="text-xs bg-highlight/10 text-highlight px-2 py-0.5 rounded-full">{seg}</span>
                    ))}
                  </div>
                </div>
              )}
              {client.billing_currency && (
                <div>
                  <p className="text-xs text-muted-2 mb-0.5">Billing Currency</p>
                  <p className="text-sm text-foreground">{client.billing_currency}</p>
                </div>
              )}
              {client.notes && (
                <div>
                  <p className="text-xs text-muted-2 mb-0.5">Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "contacts" && <ContactsTab clientId={clientId} />}

      {activeTab === "milestones" && <MilestonesTab clientId={clientId} />}

      {activeTab === "meetings" && <MeetingsTab clientId={clientId} />}

      {activeTab === "analysis" && (
        <AnalysisTab
          clientId={clientId}
          initialAnalysis={client.market_analysis ?? null}
          questionnaire={questionnaire}
          companyName={client.company_name}
        />
      )}

      {activeTab === "strategy" && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Strategy Type</label>
              {strategyType && strategyType !== "b2b" && (
                <button
                  type="button"
                  onClick={() => {
                    const filled = buildStrategyTemplate(strategyType as StrategyTemplateKey, {
                      company_name: client.company_name,
                      segments: client.segments,
                      countries_of_operation: questionnaire?.countries_of_operation ?? "",
                      annual_revenue: questionnaire?.annual_revenue ?? "",
                    });
                    if (!strategyNotes.trim() || window.confirm("Replace current strategy notes with the template?")) {
                      setStrategyNotes(filled);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium border border-highlight/40 text-highlight hover:bg-highlight/8 transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  Load Template
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { value: "b2b",          label: "B2B" },
                { value: "b2g",          label: "B2G" },
                { value: "adam_license", label: "A.D.A.M. License" },
                { value: "end_to_end",   label: "End-to-End" },
              ] as { value: StrategyType; label: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStrategyType(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${strategyType === opt.value ? "bg-highlight text-white border-highlight" : "bg-white text-muted border-grid-500 hover:bg-grid-300"}`}
                >
                  {opt.label}
                </button>
              ))}
              {strategyType && (
                <button type="button" onClick={() => setStrategyType(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-2 hover:text-foreground transition-colors">Clear</button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Strategy Notes</label>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => insertFormatting("bold")} className="px-2 py-1 text-xs font-bold text-muted-2 hover:text-foreground hover:bg-grid-300 rounded transition-colors" title="Bold">B</button>
                <button type="button" onClick={() => insertFormatting("heading")} className="px-2 py-1 text-xs font-semibold text-muted-2 hover:text-foreground hover:bg-grid-300 rounded transition-colors" title="Heading">H2</button>
                <button type="button" onClick={() => insertFormatting("bullet")} className="px-2 py-1 text-xs text-muted-2 hover:text-foreground hover:bg-grid-300 rounded transition-colors" title="Bullet">&bull; List</button>
              </div>
            </div>
            <textarea
              id="strategy-notes"
              value={strategyNotes}
              onChange={(e) => setStrategyNotes(e.target.value)}
              placeholder="Document the client's strategy…"
              rows={14}
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30 font-mono"
            />
            <p className="text-xs text-muted-2 mt-2">Markdown formatting supported.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSaveStrategy} disabled={isSavingStrategy} className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50">
              <Save className="h-4 w-4" />
              {isSavingStrategy ? "Saving..." : "Save Strategy"}
            </button>
            <button onClick={handleCreateProposalFromStrategy} disabled={isCreatingProposal || !strategyNotes.trim()} className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors disabled:opacity-50">
              {isCreatingProposal ? "Creating..." : "Create Proposal from Strategy"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "contracts" && (
        <div>
          {(client.contracts || []).length === 0 ? (
            <div className="bg-white rounded-xl border border-grid-300 p-8 text-center">
              <p className="text-muted-2 mb-4">No contracts yet</p>
              <Link href={`/admin/contracts/new?clientId=${clientId}`} className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient">Create Contract</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(client.contracts || []).map((contract: any) => (
                <ContractCard key={contract.id} id={contract.id} title={contract.title} status={contract.status} stage={client.stage} updatedAt={contract.updated_at} isAdmin />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "questionnaire" && (
        <div>
          {questionnaire ? (
            <QuestionnairePreview questionnaire={questionnaire as never} />
          ) : (
            <div className="bg-white rounded-xl border border-grid-300 p-8 text-center">
              <p className="text-muted-2">{client.questionnaire_id ? "Loading questionnaire..." : "No questionnaire linked."}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "kickoff" && (
        <div className="space-y-6 max-w-2xl">
          {client.kickoff_confirmed_at && (
            <div className="rounded-lg bg-success/8 border border-success/20 px-4 py-3 text-sm text-success">
              Kickoff confirmed on {formatDate(client.kickoff_confirmed_at)} — client notified by email.
            </div>
          )}
          {kickoffMsg && (
            <div className={cn("rounded-lg border px-4 py-3 text-sm", kickoffMsg.includes("failed") || kickoffMsg.toLowerCase().includes("error") ? "bg-error/8 border-error/20 text-error" : "bg-success/8 border-success/20 text-success")}>
              {kickoffMsg}
            </div>
          )}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <label className="label-mono block mb-2">Kickoff Date & Time</label>
            <input type="datetime-local" value={kickoffDate} onChange={(e) => setKickoffDate(e.target.value)} className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30" />
          </div>
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <p className="label-mono mb-3">Kickoff Checklist</p>
            <div className="space-y-2 mb-4">
              {checklist.length === 0 && <p className="text-sm text-muted-2">No items yet.</p>}
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <input type="checkbox" checked={item.checked} onChange={() => toggleChecklistItem(item.id)} className="h-4 w-4 rounded border-grid-500 accent-highlight" />
                  <span className={cn("flex-1 text-sm", item.checked ? "line-through text-muted-2" : "text-foreground")}>{item.label}</span>
                  <button onClick={() => removeChecklistItem(item.id)} className="text-muted-2 hover:text-error transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChecklistItem()} placeholder="e.g. Intro call scheduled" className="flex-1 h-9 rounded-lg border border-grid-500 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30" />
              <button onClick={addChecklistItem} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-grid-300 text-foreground text-sm hover:bg-grid-500 transition-colors"><Plus className="h-4 w-4" />Add</button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <label className="label-mono block mb-2">Agenda & Notes</label>
            <textarea value={kickoffNotes} onChange={(e) => setKickoffNotes(e.target.value)} rows={6} placeholder="Kickoff agenda, next steps…" className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleConfirmKickoff} disabled={isConfirmingKickoff} className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50">
              <Save className="h-4 w-4" />
              {isConfirmingKickoff ? "Confirming…" : "Confirm Kickoff & Notify Client"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "kyc" && (
        <KycTab clientId={clientId} />
      )}

      {activeTab === "activity" && (
        <div className="bg-white rounded-xl border border-grid-300 p-4">
          <ActivityFeed activities={activities || []} />
        </div>
      )}

      {/* ── Reactivation Modal ─────────────────────────────────────────────── */}
      {reactivateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setReactivateOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-grid-300 shadow-xl p-7 w-full max-w-md">
            <h2 className="text-lg font-serif font-semibold text-foreground mb-1">Reactivate Client</h2>
            <p className="text-sm text-muted-2 mb-5">This will reset the pipeline to the Proposal stage and send a reactivation email to the client.</p>

            <div className="space-y-4">
              <div>
                <label className="label-mono block mb-2">New Service Type</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: "b2b",          label: "B2B" },
                    { value: "b2g",          label: "B2G" },
                    { value: "adam_license", label: "A.D.A.M. License" },
                    { value: "end_to_end",   label: "End-to-End" },
                  ] as { value: StrategyType; label: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setReactivateServiceType(opt.value)}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                        reactivateServiceType === opt.value ? "bg-highlight text-white border-highlight" : "bg-white text-muted border-grid-500 hover:bg-grid-300")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-mono block mb-2">Reactivation Notes</label>
                <textarea
                  value={reactivateNotes}
                  onChange={(e) => setReactivateNotes(e.target.value)}
                  rows={3}
                  placeholder="Why is this client being reactivated?"
                  className="w-full rounded-lg border border-grid-500 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
                />
              </div>
              {reactivateMsg && <p className="text-sm text-error">{reactivateMsg}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReactivate}
                disabled={reactivating}
                className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50 flex-1"
              >
                <RefreshCcw className="h-4 w-4" />
                {reactivating ? "Reactivating…" : "Reactivate Client"}
              </button>
              <button
                onClick={() => setReactivateOpen(false)}
                className="h-10 px-4 rounded-lg border border-grid-500 text-sm text-muted-2 hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
