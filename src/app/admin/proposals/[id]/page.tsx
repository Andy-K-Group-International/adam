"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getProposalById, updateProposal } from "@/lib/supabase/queries/proposals";
import { getClientById } from "@/lib/supabase/queries/clients";
import { createContract } from "@/lib/supabase/queries/contracts";
import { sendProposalSent } from "@/app/actions/email";
import type { Proposal, Client, ProposalStatus } from "@/lib/supabase/types";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  PenTool,
  Save,
  FileText,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { siteConfig } from "@/lib/data";

interface Section {
  key: string;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
}

function statusStyle(status: ProposalStatus): string {
  switch (status) {
    case "draft":
      return "bg-grid-300 text-muted";
    case "evaluating":
      return "bg-info/10 text-info";
    case "flagged":
      return "bg-warning/10 text-warning";
    case "sent":
      return "bg-info/10 text-info";
    case "changes_requested":
      return "bg-warning/10 text-warning";
    case "approved":
      return "bg-success/10 text-success";
    case "declined":
      return "bg-error/10 text-error";
  }
}

function statusLabel(status: ProposalStatus): string {
  switch (status) {
    case "draft": return "Draft";
    case "evaluating": return "Evaluating";
    case "flagged": return "Flagged";
    case "sent": return "Sent to Client";
    case "changes_requested": return "Changes Requested";
    case "approved": return "Approved";
    case "declined": return "Declined";
  }
}

export default function AdminProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;
  const { user } = useCurrentUser();

  const [proposal, setProposal] = useState<Proposal | null | undefined>(undefined);
  const [client, setClient] = useState<Client | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editSections, setEditSections] = useState<Section[]>([]);
  const [editAdminNotes, setEditAdminNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    try {
      const p = await getProposalById(supabase, proposalId);
      setProposal(p);
      if (p.client_id) {
        const c = await getClientById(supabase, p.client_id).catch(() => null);
        setClient(c);
      }
    } catch {
      setProposal(null);
    }
  }, [proposalId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (proposal === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (!proposal) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Proposal not found</p>
      </div>
    );
  }

  const canEdit = proposal.status === "draft" || proposal.status === "changes_requested";
  const canSend = proposal.status === "draft" || proposal.status === "changes_requested";
  const canCreateContract =
    proposal.status === "approved" && !proposal.contract_id && !!proposal.client_id;

  const startEditing = () => {
    setEditSections(
      [...proposal.sections].sort((a, b) => a.order - b.order)
    );
    setEditAdminNotes(proposal.admin_notes || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const updated = await updateProposal(supabase, proposalId, {
        sections: editSections.map((s, i) => ({ ...s, order: i })),
        admin_notes: editAdminNotes.trim() || null,
      });
      setProposal(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save proposal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!client) return;
    setIsSending(true);
    try {
      const supabase = createClient();
      const updated = await updateProposal(supabase, proposalId, {
        status: "sent",
        sent_to_client_at: new Date().toISOString(),
      });
      setProposal(updated);
      await sendProposalSent({
        clientEmail: client.contact_email,
        clientName: client.contact_name,
        proposalTitle: proposal.title,
        proposalId: proposal.id,
      });
    } catch (err) {
      console.error("Failed to send proposal:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateContract = async () => {
    if (!proposal.client_id || !user) return;
    setIsCreatingContract(true);
    try {
      const supabase = createClient();
      const content = proposal.sections
        .filter((s) => s.isVisible)
        .sort((a, b) => a.order - b.order)
        .map((s) => `## ${s.title}\n\n${s.content}`)
        .join("\n\n---\n\n");

      const contract = await createContract(supabase, {
        client_id: proposal.client_id,
        proposal_id: proposal.id,
        title: `${proposal.title} — Contract`,
        content,
        contract_type: "service_agreement",
        version: 1,
        sections: null,
        client_signature: null,
        client_signed_at: null,
        client_signed_by: null,
        admin_signature: null,
        admin_signed_at: null,
        admin_signed_by: null,
        appendices: null,
        created_by: user.id,
        published_at: null,
        viewed_at: null,
        finalized_at: null,
      });

      await updateProposal(supabase, proposalId, { contract_id: contract.id });
      router.push(`/admin/contracts/${contract.id}`);
    } catch (err) {
      console.error("Failed to create contract:", err);
    } finally {
      setIsCreatingContract(false);
    }
  };

  const updateEditSection = (index: number, field: keyof Section, value: string | boolean) => {
    setEditSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const addEditSection = () => {
    setEditSections((prev) => [
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

  const removeEditSection = (index: number) => {
    setEditSections((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="text-muted-2 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-serif font-semibold text-foreground">Edit Proposal</h1>
              <p className="text-sm text-muted-2">{proposal.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-muted-2 hover:text-foreground transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="relative inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sections */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Sections</h3>
              <button
                type="button"
                onClick={addEditSection}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-highlight hover:text-highlight/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Section
              </button>
            </div>
            <div className="space-y-4">
              {editSections.map((section, index) => (
                <div key={section.key} className="border border-grid-500 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateEditSection(index, "title", e.target.value)}
                      className="flex-1 text-sm font-medium border border-grid-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-highlight/30"
                    />
                    <button
                      type="button"
                      onClick={() => updateEditSection(index, "isVisible", !section.isVisible)}
                      className="p-1.5 text-muted-2 hover:text-foreground transition-colors"
                    >
                      {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEditSection(index)}
                      className="p-1.5 text-muted-2 hover:text-error transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) => updateEditSection(index, "content", e.target.value)}
                    rows={6}
                    className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
                  />
                  {!section.isVisible && (
                    <p className="text-xs text-muted-2">Hidden from client view</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Admin Notes
            </label>
            <textarea
              value={editAdminNotes}
              onChange={(e) => setEditAdminNotes(e.target.value)}
              placeholder="Internal notes — not visible to the client."
              rows={4}
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── View mode ──────────────────────────────────────────────────────────────
  const sortedSections = [...proposal.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-4xl">
      {/* Back + title */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/proposals"
          className="text-muted-2 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-serif font-semibold text-foreground truncate">{proposal.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            {proposal.proposal_ref && (
              <span className="text-xs text-muted-2">{proposal.proposal_ref}</span>
            )}
            {proposal.proposal_ref && <span className="text-muted-2 text-xs">·</span>}
            {client && (
              <Link
                href={`/admin/clients/${client.id}`}
                className="text-xs text-muted-2 hover:text-highlight transition-colors"
              >
                {client.company_name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Admin Action Bar */}
      <div className="bg-white rounded-xl border border-grid-300 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Admin Actions</h3>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                statusStyle(proposal.status)
              )}
            >
              {statusLabel(proposal.status)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground bg-grid-300 hover:bg-grid-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                <PenTool className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {canSend && client && (
              <button
                onClick={handleSend}
                disabled={isSending}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-info hover:bg-info/90 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {isSending ? "Sending..." : "Send to Client"}
              </button>
            )}
            {canCreateContract && (
              <button
                onClick={handleCreateContract}
                disabled={isCreatingContract}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-success hover:bg-success/90 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileText className="h-3.5 w-3.5" />
                {isCreatingContract ? "Creating..." : "Create Contract"}
              </button>
            )}
            {proposal.contract_id && (
              <Link
                href={`/admin/contracts/${proposal.contract_id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground bg-grid-300 hover:bg-grid-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                View Contract
              </Link>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-3 pt-3 border-t border-grid-300 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-muted-2">
            Created {formatDate(proposal.created_at)}
          </span>
          {proposal.sent_to_client_at && (
            <span className="text-xs text-muted-2">
              Sent {formatDate(proposal.sent_to_client_at)}
            </span>
          )}
          {proposal.client_approved_at && (
            <span className="text-xs text-success">
              Client approved {formatDate(proposal.client_approved_at)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Evaluation */}
        {proposal.ai_evaluation && (
          <div className="bg-white border border-grid-300 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-highlight" />
              <h3 className="text-sm font-semibold text-foreground">AI Evaluation</h3>
              <span className="ml-auto text-xs font-semibold text-foreground">
                Score: {proposal.ai_evaluation.qualityScore}/100
              </span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {proposal.ai_evaluation.recommendation}
            </p>
            <p className="text-sm text-muted whitespace-pre-wrap">
              {proposal.ai_evaluation.reasoning}
            </p>
            <p className="text-xs text-muted-2 mt-3">
              Evaluated {formatDate(proposal.ai_evaluation.evaluatedAt)}
            </p>
          </div>
        )}

        {/* Client Comment */}
        {proposal.client_comment && (
          <div
            className={cn(
              "border rounded-xl p-5",
              proposal.status === "approved"
                ? "bg-success/5 border-success/20"
                : "bg-error/5 border-error/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {proposal.status === "approved" ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-error" />
              )}
              <h3 className="text-sm font-semibold text-foreground">
                Client {proposal.status === "approved" ? "Approved" : "Declined"}
              </h3>
            </div>
            <p className="text-sm text-muted whitespace-pre-wrap">{proposal.client_comment}</p>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-4">
          {sortedSections.map((section) => (
            <div
              key={section.key}
              className={cn(
                "bg-white rounded-xl border p-5",
                section.isVisible ? "border-grid-300" : "border-grid-300 opacity-50"
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                {!section.isVisible && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-2">
                    <EyeOff className="h-3 w-3" />
                    Hidden
                  </span>
                )}
              </div>
              <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">
                {section.content || "No content"}
              </p>
            </div>
          ))}
        </div>

        {/* Admin Notes */}
        {proposal.admin_notes && (
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">Admin Notes</h3>
            <p className="text-sm text-muted whitespace-pre-wrap">{proposal.admin_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
