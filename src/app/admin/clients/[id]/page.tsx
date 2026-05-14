"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getClientById, updateClient } from "@/lib/supabase/queries/clients";
import { listForClient as listActivitiesForClient } from "@/lib/supabase/queries/activity-log";
import { getQuestionnaireById } from "@/lib/supabase/queries/questionnaires";
import { createProposal } from "@/lib/supabase/queries/proposals";
import type { Client, Questionnaire, ActivityLog, StrategyType } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import ContractCard from "@/components/dashboard/ContractCard";
import QuestionnairePreview from "@/components/admin/QuestionnairePreview";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const stageColors: Record<string, string> = {
  questionnaire: "bg-grid-300 text-muted",
  proposal: "bg-info/10 text-info",
  strategy: "bg-highlight/10 text-highlight",
  contract: "bg-warning/10 text-warning",
  invoice: "bg-success/10 text-success",
  kickoff: "bg-success/10 text-success",
};

const stageLabels: Record<string, string> = {
  questionnaire: "Questionnaire",
  proposal: "Proposal",
  strategy: "Strategy",
  contract: "Contract",
  invoice: "Invoice",
  kickoff: "Kick-off",
};

type Tab = "overview" | "contracts" | "questionnaire" | "activity" | "strategy";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [client, setClient] = useState<(Client & { contracts: any[] }) | null | undefined>(undefined);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);

  // Strategy state
  const [strategyType, setStrategyType] = useState<StrategyType | null>(null);
  const [strategyNotes, setStrategyNotes] = useState("");
  const [isSavingStrategy, setIsSavingStrategy] = useState(false);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      try {
        const clientData = await getClientById(supabase, clientId);
        setClient(clientData);
        setStrategyType(clientData.strategy_type ?? null);
        setStrategyNotes(clientData.strategy_notes ?? "");

        // Fetch activities
        const activitiesData = await listActivitiesForClient(supabase, clientId).catch(() => []);
        setActivities(activitiesData);

        // Fetch questionnaire if linked
        if (clientData.questionnaire_id) {
          const questionnaireData = await getQuestionnaireById(supabase, clientData.questionnaire_id).catch(() => null);
          setQuestionnaire(questionnaireData);
        }
      } catch {
        setClient(null);
      }
    }

    fetchData();
  }, [clientId]);

  if (client === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Client not found</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "strategy", label: "Strategy" },
    { key: "contracts", label: `Contracts (${client.contracts?.length || 0})` },
    { key: "questionnaire", label: "Questionnaire" },
    { key: "activity", label: "Activity" },
  ];

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
        status: "draft" as const,
        sections: [
          {
            key: "strategy",
            title: "Strategy Overview",
            content: strategyNotes.trim(),
            order: 0,
            isVisible: true,
          },
        ],
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
    const newValue =
      strategyNotes.slice(0, start) + replacement + strategyNotes.slice(end);
    setStrategyNotes(newValue);
    setTimeout(() => {
      textarea.selectionStart = start + replacement.length;
      textarea.selectionEnd = start + replacement.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clients"
            className="text-muted-2 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-semibold text-foreground">
                {client.company_name}
              </h1>
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  stageColors[client.stage] || "bg-grid-300 text-muted"
                )}
              >
                {stageLabels[client.stage] || client.stage}
              </span>
            </div>
            <p className="text-sm text-muted-2 mt-0.5">
              Created {formatDate(client.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="flex gap-1 mb-6 border-b border-grid-300">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.key
                ? "border-highlight text-highlight"
                : "border-transparent text-muted-2 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Contact Information
            </h3>
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
                  <a
                    href={client.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-highlight hover:underline"
                  >
                    {client.website_url}
                  </a>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-2 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    {client.address.line1}
                    {client.address.line2 ? `, ${client.address.line2}` : ""}
                    <br />
                    {client.address.city}, {client.address.postcode}
                    <br />
                    {client.address.country}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-2 mb-0.5">Stage</p>
                <p className="text-sm text-foreground">
                  {stageLabels[client.stage] || client.stage}
                </p>
              </div>
              {client.segments && client.segments.length > 0 && (
                <div>
                  <p className="text-xs text-muted-2 mb-1">Segments</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.segments.map((seg) => (
                      <span
                        key={seg}
                        className="text-xs bg-highlight/10 text-highlight px-2 py-0.5 rounded-full"
                      >
                        {seg}
                      </span>
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
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "strategy" && (
        <div className="space-y-6 max-w-3xl">
          {/* Strategy Type */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Strategy Type
            </label>
            <div className="flex flex-wrap gap-2">
              {([
                { value: "b2b", label: "B2B" },
                { value: "b2g", label: "B2G" },
                { value: "adam_license", label: "A.D.A.M. License" },
                { value: "end_to_end", label: "End-to-End" },
              ] as { value: StrategyType; label: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStrategyType(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    strategyType === opt.value
                      ? "bg-highlight text-white border-highlight"
                      : "bg-white text-muted border-grid-500 hover:bg-grid-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {strategyType && (
                <button
                  type="button"
                  onClick={() => setStrategyType(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-2 hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Strategy Notes */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                Strategy Notes
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting("bold")}
                  className="px-2 py-1 text-xs font-bold text-muted-2 hover:text-foreground hover:bg-grid-300 rounded transition-colors"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("heading")}
                  className="px-2 py-1 text-xs font-semibold text-muted-2 hover:text-foreground hover:bg-grid-300 rounded transition-colors"
                  title="Heading"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("bullet")}
                  className="px-2 py-1 text-xs text-muted-2 hover:text-foreground hover:bg-grid-300 rounded transition-colors"
                  title="Bullet"
                >
                  &bull; List
                </button>
              </div>
            </div>
            <textarea
              id="strategy-notes"
              value={strategyNotes}
              onChange={(e) => setStrategyNotes(e.target.value)}
              placeholder="Document the client's strategy — goals, market positioning, key differentiators, approach..."
              rows={14}
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30 font-mono"
            />
            <p className="text-xs text-muted-2 mt-2">Markdown formatting supported.</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveStrategy}
              disabled={isSavingStrategy}
              className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSavingStrategy ? "Saving..." : "Save Strategy"}
            </button>
            <button
              onClick={handleCreateProposalFromStrategy}
              disabled={isCreatingProposal || !strategyNotes.trim()}
              className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors disabled:opacity-50"
            >
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
              <Link
                href={`/admin/contracts/new?clientId=${clientId}`}
                className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient"
              >
                Create Contract
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(client.contracts || []).map((contract: any) => (
                <ContractCard
                  key={contract.id}
                  id={contract.id}
                  title={contract.title}
                  status={contract.status}
                  stage={client.stage}
                  updatedAt={contract.updated_at}
                  isAdmin
                />
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
              <p className="text-muted-2">
                {client.questionnaire_id
                  ? "Loading questionnaire..."
                  : "No questionnaire linked to this client."}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white rounded-xl border border-grid-300 p-4">
          <ActivityFeed activities={activities || []} />
        </div>
      )}
    </div>
  );
}
