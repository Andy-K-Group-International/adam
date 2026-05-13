"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getContractById, updateContract, publishContract, countersign, verifyAppendix, rejectAppendix } from "@/lib/supabase/queries/contracts";
import { listByContract as listCommentsByContract } from "@/lib/supabase/queries/contract-comments";
import { listByContract as listVersionsByContract } from "@/lib/supabase/queries/contract-versions";
import type { Contract, ContractComment, ContractVersion, ContractType } from "@/lib/supabase/types";

function contractTypeStyle(type: ContractType | undefined): string {
  switch (type) {
    case "nda":               return "bg-error/10 text-error";
    case "service_agreement": return "bg-info/10 text-info";
    case "retainer":          return "bg-success/10 text-success";
    case "amendment":         return "bg-warning/10 text-warning";
    default:                  return "bg-info/10 text-info";
  }
}

function contractTypeLabel(type: ContractType | undefined): string {
  switch (type) {
    case "nda":               return "NDA";
    case "service_agreement": return "Service Agreement";
    case "retainer":          return "Retainer";
    case "amendment":         return "Amendment";
    default:                  return "Service Agreement";
  }
}
import Link from "next/link";
import { ArrowLeft, Check, X, Send, PenTool, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import ContractViewer from "@/components/contracts/ContractViewer";
import StatusBadge from "@/components/contracts/StatusBadge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminContractDetailPage() {
  const params = useParams();
  const contractId = params.id as string;
  const { user } = useCurrentUser();

  const [contract, setContract] = useState<Contract | null | undefined>(undefined);
  const [comments, setComments] = useState<any[]>([]);
  const [versions, setVersions] = useState<ContractVersion[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCountersigning, setIsCountersigning] = useState(false);
  const [appendixAction, setAppendixAction] = useState<{ slot: string; type: "verify" | "reject" } | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      try {
        const [contractData, commentsData, versionsData] = await Promise.all([
          getContractById(supabase, contractId),
          listCommentsByContract(supabase, contractId).catch(() => []),
          listVersionsByContract(supabase, contractId).catch(() => []),
        ]);
        setContract(contractData);
        setComments(commentsData);
        setVersions(versionsData);
      } catch {
        setContract(null);
      }
    }

    fetchData();
  }, [contractId]);

  if (contract === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Contract not found</p>
      </div>
    );
  }

  const canEdit =
    contract.status === "draft" || contract.status === "changes_requested";
  const canPublish =
    contract.status === "draft" || contract.status === "changes_requested";
  const canCountersign = contract.status === "client_signed";

  const startEditing = () => {
    setEditTitle(contract.title);
    setEditContent(contract.content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const updated = await updateContract(supabase, contractId, {
        title: editTitle.trim() || undefined,
        content: editContent.trim() || undefined,
      } as Partial<Contract>);
      setContract(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save contract:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const supabase = createClient();
      const updated = await publishContract(supabase, contractId, user?.id || "");
      setContract(updated);
    } catch (err) {
      console.error("Failed to publish contract:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleVerifyAppendix = async (slot: string) => {
    setAppendixAction({ slot, type: "verify" });
    try {
      const supabase = createClient();
      const updated = await verifyAppendix(supabase, contractId, slot);
      setContract(updated);
    } catch (err) {
      console.error("Failed to verify appendix:", err);
    } finally {
      setAppendixAction(null);
    }
  };

  const handleRejectAppendix = async (slot: string) => {
    setAppendixAction({ slot, type: "reject" });
    try {
      const supabase = createClient();
      const updated = await rejectAppendix(supabase, contractId, slot, rejectionNote || undefined);
      setContract(updated);
      setRejectionNote("");
    } catch (err) {
      console.error("Failed to reject appendix:", err);
    } finally {
      setAppendixAction(null);
    }
  };

  const handleCountersign = async () => {
    setIsCountersigning(true);
    try {
      const supabase = createClient();
      const updated = await countersign(
        supabase,
        contractId,
        user?.id || "",
        `admin_sig_${Date.now()}`
      );
      setContract(updated);
    } catch (err) {
      console.error("Failed to countersign contract:", err);
    } finally {
      setIsCountersigning(false);
    }
  };

  // Edit mode
  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="text-muted-2 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Edit Contract
              </h1>
              <p className="text-sm text-muted-2">
                Editing: {contract.title}
              </p>
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
              className="inline-flex items-center gap-2 bg-highlight text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-4 max-w-4xl">
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
            />
          </div>

          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Content
            </label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={24}
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30 font-mono"
            />
          </div>
        </div>
      </div>
    );
  }

  // View mode with admin actions
  return (
    <div>
      {/* Admin Action Bar */}
      <div className="bg-white rounded-xl border border-grid-300 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Admin Actions
            </h3>
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
              contractTypeStyle(contract.contract_type)
            )}>
              {contractTypeLabel(contract.contract_type)}
            </span>
            <StatusBadge status={contract.status} />
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
            {canPublish && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-info hover:bg-info/90 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {isPublishing
                  ? "Publishing..."
                  : contract.status === "draft"
                    ? "Publish"
                    : "Re-publish"}
              </button>
            )}
            {canCountersign && (
              <button
                onClick={handleCountersign}
                disabled={isCountersigning}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-success hover:bg-success/90 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {isCountersigning ? "Countersigning..." : "Countersign"}
              </button>
            )}
          </div>
        </div>

        {/* Appendix Verification Controls */}
        {contract.appendices && contract.appendices.some((a) => a.status === "uploaded") && (
          <div className="mt-4 pt-4 border-t border-grid-300">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Appendix Verification
            </h4>
            <div className="space-y-2">
              {contract.appendices
                .filter((a) => a.status === "uploaded")
                .map((appendix) => {
                  const isActing = appendixAction?.slot === appendix.slot;
                  return (
                    <div key={appendix.slot} className="space-y-2">
                      <div className="flex items-center justify-between bg-grid-300/30 rounded-lg px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {appendix.label}
                          </p>
                          <p className="text-xs text-muted-2">
                            Uploaded &middot; Awaiting verification
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isActing}
                            className="inline-flex items-center gap-1 text-xs font-medium text-white bg-success hover:bg-success/90 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => handleVerifyAppendix(appendix.slot)}
                          >
                            <Check className="h-3 w-3" />
                            {isActing && appendixAction?.type === "verify" ? "Verifying..." : "Verify"}
                          </button>
                          <button
                            disabled={isActing}
                            className="inline-flex items-center gap-1 text-xs font-medium text-white bg-error hover:bg-error/90 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => handleRejectAppendix(appendix.slot)}
                          >
                            <X className="h-3 w-3" />
                            {isActing && appendixAction?.type === "reject" ? "Rejecting..." : "Reject"}
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Rejection note (optional)"
                        value={appendixAction?.slot === appendix.slot ? rejectionNote : ""}
                        onChange={(e) => setRejectionNote(e.target.value)}
                        className="w-full text-xs border border-grid-500 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Contract Viewer */}
      <ContractViewer
        contract={contract}
        comments={comments || []}
        versions={versions || []}
        canSign={false}
        canRequestChanges={false}
        backHref="/admin/contracts"
      />
    </div>
  );
}
