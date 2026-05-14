"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { listClients } from "@/lib/supabase/queries/clients";
import { listTemplates, getTemplateById } from "@/lib/supabase/queries/proposal-templates";
import { listQuestionnaires } from "@/lib/supabase/queries/questionnaires";
import { createProposal } from "@/lib/supabase/queries/proposals";
import type { Client, ProposalTemplate, Questionnaire } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface Section {
  key: string;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <NewProposalForm />
    </Suspense>
  );
}

function NewProposalForm() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const [clients, setClients] = useState<Client[] | undefined>(undefined);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);

  const [clientId, setClientId] = useState("");
  const [questionnaireId, setQuestionnaireId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [proposalRef, setProposalRef] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      listClients(supabase),
      listTemplates(supabase, { activeOnly: true }),
      listQuestionnaires(supabase, { status: "submitted" }).catch(() => []),
    ])
      .then(([c, t, q]) => {
        setClients(c);
        setTemplates(t);
        setQuestionnaires(q);
      })
      .catch(() => setClients([]));
  }, []);

  const handleTemplateChange = async (id: string) => {
    setTemplateId(id);
    if (!id) {
      setSections([]);
      return;
    }
    try {
      const supabase = createClient();
      const template = await getTemplateById(supabase, id);
      setSections(
        [...template.sections].sort((a, b) => a.order - b.order)
      );
    } catch {
      setSections([]);
    }
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        key: `section_${Date.now()}`,
        title: "New Section",
        content: "",
        order: prev.length,
        isVisible: true,
      },
    ]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: keyof Section, value: string | boolean) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a proposal title.");
      return;
    }
    if (sections.length === 0) {
      setError("Please add at least one section.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const proposal = await createProposal(supabase, {
        client_id: clientId,
        questionnaire_id: questionnaireId || "",
        template_id: templateId || null,
        title: title.trim(),
        proposal_ref: proposalRef.trim() || null,
        status: "draft",
        sections: sections.map((s, i) => ({ ...s, order: i })),
        ai_evaluation: null,
        admin_notes: adminNotes.trim() || null,
        client_comment: null,
        approved_by_admin_at: null,
        sent_to_client_at: null,
        client_approved_at: null,
        contract_id: null,
      });
      router.push(`/admin/proposals/${proposal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (clients === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/proposals"
          className="text-muted-2 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-serif font-semibold text-foreground">New Proposal</h1>
          <p className="text-sm text-muted-2 mt-0.5">Create a new proposal for a client.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Client */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Client <span className="text-error">*</span>
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name} ({c.contact_email})
              </option>
            ))}
          </select>
        </div>

        {/* Questionnaire */}
        {questionnaires.length > 0 && (
          <div className="bg-white rounded-xl border border-grid-300 p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Linked Questionnaire
              </label>
              <select
                value={questionnaireId}
                onChange={(e) => setQuestionnaireId(e.target.value)}
                className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
              >
                <option value="">None — standalone proposal</option>
                {questionnaires.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.company_name} · {q.contact_email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-2 mt-2">
                Optionally link this proposal to a submitted questionnaire.
              </p>
            </div>

            {/* Show AI evaluation if the selected questionnaire has one */}
            {questionnaireId && (() => {
              const q = questionnaires.find((x) => x.id === questionnaireId);
              const ev = q?.ai_evaluation;
              if (!ev) return null;
              const recStyle =
                ev.recommendation === "proceed"
                  ? "bg-success/10 text-success border-success/20"
                  : ev.recommendation === "flag"
                    ? "bg-warning/10 text-warning border-warning/20"
                    : "bg-error/10 text-error border-error/20";
              const recLabel =
                ev.recommendation === "proceed" ? "Proceed" : ev.recommendation === "flag" ? "Flag" : "Reject";
              return (
                <div className="border-t border-grid-300 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-info" />
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                      AI Qualification Score
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className={cn(
                        "text-2xl font-bold",
                        ev.qualityScore >= 80 ? "text-success" : ev.qualityScore >= 60 ? "text-warning" : "text-error"
                      )}>
                        {ev.qualityScore}
                      </p>
                      <p className="text-[10px] text-muted-2">/ 100</p>
                    </div>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border",
                      recStyle
                    )}>
                      {recLabel}
                    </span>
                    <p className="text-xs text-muted flex-1">{ev.reasoning}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Template */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Template
          </label>
          <select
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
          >
            <option value="">No template — start blank</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (v{t.version})
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-2 mt-2">
            Selecting a template pre-fills the sections below. You can edit them freely.
          </p>
        </div>

        {/* Title & Ref */}
        <div className="bg-white rounded-xl border border-grid-300 p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Proposal Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., B2B Lead Generation Proposal — Acme Ltd"
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={proposalRef}
              onChange={(e) => setProposalRef(e.target.value)}
              placeholder="e.g., PROP-2024-001"
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-semibold text-foreground">
              Sections <span className="text-error">*</span>
            </label>
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-highlight hover:text-highlight/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </button>
          </div>

          {sections.length === 0 ? (
            <p className="text-sm text-muted-2 text-center py-6">
              Select a template above or add sections manually.
            </p>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={section.key}
                  className="border border-grid-500 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(index, "title", e.target.value)}
                      placeholder="Section title"
                      className="flex-1 text-sm font-medium border border-grid-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-highlight/30"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateSection(index, "isVisible", !section.isVisible)}
                        className="p-1.5 text-muted-2 hover:text-foreground transition-colors"
                        title={section.isVisible ? "Hide section" : "Show section"}
                      >
                        {section.isVisible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="p-1.5 text-muted-2 hover:text-error transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(index, "content", e.target.value)}
                    placeholder="Section content..."
                    rows={5}
                    className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
                  />
                  {!section.isVisible && (
                    <p className="text-xs text-muted-2">
                      This section is hidden from the client view.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Notes */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Admin Notes
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes — not visible to the client."
            rows={4}
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative inline-flex items-center justify-center h-10 px-6 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Proposal"}
          </button>
          <Link
            href="/admin/proposals"
            className="text-sm text-muted-2 hover:text-foreground transition-colors px-4 py-2.5"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
