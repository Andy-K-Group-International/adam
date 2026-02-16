"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import AppendixUpload from "./AppendixUpload";
import CommentThread from "./CommentThread";
import SignatureCanvas from "./SignatureCanvas";
import VersionHistory from "./VersionHistory";
import { ArrowLeft, MessageSquare, Paperclip, Clock } from "lucide-react";
import Link from "next/link";
import type { Id } from "../../../convex/_generated/dataModel";

interface ContractViewerProps {
  contract: {
    _id: Id<"contracts">;
    title: string;
    content: string;
    status: string;
    version: number;
    sections?: { id: string; title: string; content: string }[];
    appendices?: {
      slot: string;
      label: string;
      required: boolean;
      fileId?: Id<"contractFiles">;
      status: "empty" | "uploaded" | "verified" | "rejected";
      rejectionNote?: string;
    }[];
  };
  comments: { _id: string; content: string; authorId: string; createdAt: number }[];
  versions: { _id: string; version: number; changeNote?: string; createdAt: number }[];
  onSign?: (signature: string) => void;
  onRequestChanges?: (comment: string) => void;
  canSign?: boolean;
  canRequestChanges?: boolean;
  backHref?: string;
}

type SidebarTab = "sections" | "appendices" | "comments" | "history";

export default function ContractViewer({
  contract,
  comments,
  versions,
  onSign,
  onRequestChanges,
  canSign,
  canRequestChanges,
  backHref = "/dashboard",
}: ContractViewerProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("sections");
  const [changeComment, setChangeComment] = useState("");

  const sidebarTabs = [
    { key: "sections" as const, label: "Sections", icon: null },
    { key: "appendices" as const, label: "Appendices", icon: Paperclip },
    { key: "comments" as const, label: "Comments", icon: MessageSquare },
    { key: "history" as const, label: "History", icon: Clock },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="text-muted-2 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {contract.title}
            </h1>
            <p className="text-sm text-muted-2">Version {contract.version}</p>
          </div>
        </div>
        <StatusBadge status={contract.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-grid-300 p-4 sticky top-6">
            <div className="flex gap-1 mb-4">
              {sidebarTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? "bg-highlight/10 text-highlight"
                      : "text-muted-2 hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "sections" && contract.sections && (
              <nav className="space-y-1">
                {contract.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm text-muted hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-grid-300/50 transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            )}

            {activeTab === "appendices" && (
              <AppendixUpload
                contractId={contract._id}
                appendices={contract.appendices || []}
                canUpload={
                  contract.status !== "final" &&
                  contract.status !== "draft"
                }
              />
            )}

            {activeTab === "comments" && (
              <CommentThread
                contractId={contract._id}
                comments={comments}
              />
            )}

            {activeTab === "history" && (
              <VersionHistory versions={versions} />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-grid-300 p-8">
            {contract.sections && contract.sections.length > 0 ? (
              contract.sections.map((section) => (
                <div key={section.id} id={section.id} className="mb-8">
                  <h2 className="text-lg font-bold text-foreground mb-3">
                    {section.title}
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-muted"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))
            ) : (
              <div
                className="prose prose-sm max-w-none text-muted"
                dangerouslySetInnerHTML={{ __html: contract.content }}
              />
            )}
          </div>

          {/* Actions */}
          {canRequestChanges && (
            <div className="bg-white rounded-xl border border-grid-300 p-6 mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Request Changes
              </h3>
              <textarea
                value={changeComment}
                onChange={(e) => setChangeComment(e.target.value)}
                placeholder="Describe the changes you'd like..."
                className="w-full p-3 text-sm border border-grid-500 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
              <button
                onClick={() => {
                  if (changeComment.trim() && onRequestChanges) {
                    onRequestChanges(changeComment.trim());
                    setChangeComment("");
                  }
                }}
                disabled={!changeComment.trim()}
                className="btn-secondary px-4 py-2 rounded-lg text-sm mt-2 disabled:opacity-50"
              >
                Submit Change Request
              </button>
            </div>
          )}

          {canSign && onSign && (
            <div className="bg-white rounded-xl border border-grid-300 p-6 mt-4">
              <SignatureCanvas onSave={onSign} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
