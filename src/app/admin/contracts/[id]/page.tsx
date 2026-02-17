"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { ArrowLeft, Check, X, Send, PenTool, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import ContractViewer from "@/components/contracts/ContractViewer";
import StatusBadge from "@/components/contracts/StatusBadge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function AdminContractDetailPage() {
  const params = useParams();
  const contractId = params.id as Id<"contracts">;

  const contract = useQuery(api.contracts.getById, { id: contractId });
  const comments = useQuery(api.contractComments.listByContract, {
    contractId,
  });
  const versions = useQuery(api.contractVersions.listByContract, {
    contractId,
  });

  const updateContract = useMutation(api.contracts.update);
  const publishContract = useMutation(api.contracts.publish);
  const countersignContract = useMutation(api.contracts.countersign);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCountersigning, setIsCountersigning] = useState(false);

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
      await updateContract({
        id: contractId,
        title: editTitle.trim() || undefined,
        content: editContent.trim() || undefined,
      });
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
      await publishContract({ id: contractId });
    } catch (err) {
      console.error("Failed to publish contract:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCountersign = async () => {
    setIsCountersigning(true);
    try {
      await countersignContract({
        id: contractId,
        signatureStorageId: `admin_sig_${Date.now()}`,
      });
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
                .map((appendix) => (
                  <div
                    key={appendix.slot}
                    className="flex items-center justify-between bg-grid-300/30 rounded-lg px-4 py-2.5"
                  >
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
                        className="inline-flex items-center gap-1 text-xs font-medium text-white bg-success hover:bg-success/90 px-2.5 py-1.5 rounded-lg transition-colors"
                        onClick={() => {
                          // TODO: Call appendix verify mutation when available
                          console.log("Verify appendix:", appendix.slot);
                        }}
                      >
                        <Check className="h-3 w-3" />
                        Verify
                      </button>
                      <button
                        className="inline-flex items-center gap-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg transition-colors"
                        onClick={() => {
                          // TODO: Call appendix reject mutation when available
                          console.log("Reject appendix:", appendix.slot);
                        }}
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
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
