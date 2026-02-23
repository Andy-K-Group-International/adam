"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ProposalStatusBadge from "@/components/proposals/ProposalStatusBadge";
import AIEvaluationCard from "@/components/proposals/AIEvaluationCard";
import ProposalViewer from "@/components/proposals/ProposalViewer";
import ProposalSectionEditor from "@/components/proposals/ProposalSectionEditor";
import ProposalActions from "@/components/proposals/ProposalActions";

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as Id<"proposals">;

  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const proposal = useQuery(api.proposals.getById, { id: proposalId });
  const updateSection = useMutation(api.proposals.updateSection);
  const adminApprove = useMutation(api.proposals.adminApprove);
  const generateForFlagged = useMutation(api.proposals.generateForFlagged);
  const convertToContract = useMutation(api.proposals.convertToContract);
  const sendProposalToClient = useAction(
    api.actions.email.sendProposalToClient
  );
  const generateProposal = useAction(api.actions.ai.generateProposal);

  if (proposal === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (proposal === null) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-2">Proposal not found.</p>
        <Link
          href="/admin/proposals"
          className="text-sm text-highlight hover:text-highlight/80 mt-2 inline-block"
        >
          Back to Proposals
        </Link>
      </div>
    );
  }

  const handleSaveSection = async (sectionKey: string, content: string) => {
    try {
      await updateSection({
        id: proposalId,
        sectionKey,
        content,
      });
      setEditingSectionKey(null);
    } catch (error) {
      console.error("Failed to save section:", error);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const result = await adminApprove({ id: proposalId });

      // Send email to client
      if (result.clientEmail && result.clientName && result.companyName) {
        try {
          await sendProposalToClient({
            clientEmail: result.clientEmail,
            clientName: result.clientName,
            companyName: result.companyName,
            proposalId: result.proposalId,
            title: result.title,
          });
        } catch (emailError) {
          console.error("Failed to send proposal email:", emailError);
        }
      }
    } catch (error) {
      console.error("Failed to approve proposal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateForFlagged = async () => {
    setIsLoading(true);
    try {
      const result = await generateForFlagged({ id: proposalId });

      // Trigger AI generation
      try {
        await generateProposal({
          proposalId: result.proposalId,
          questionnaireId: result.questionnaireId,
        });
      } catch (aiError) {
        console.error("Failed to generate proposal:", aiError);
      }
    } catch (error) {
      console.error("Failed to trigger generation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContract = async () => {
    setIsLoading(true);
    try {
      const result = await convertToContract({ id: proposalId });
      router.push(`/admin/contracts/${result.contractId}`);
    } catch (error) {
      console.error("Failed to create contract:", error);
      setIsLoading(false);
    }
  };

  const handleEditSection = (key: string) => {
    setEditingSectionKey(key);
  };

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/admin/proposals"
        className="inline-flex items-center gap-1.5 text-sm text-muted-2 hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Proposals
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {proposal.title}
          </h1>
          {proposal.proposalRef && (
            <p className="text-sm text-muted-2 mt-1">
              Ref: {proposal.proposalRef}
            </p>
          )}
        </div>
      </div>

      {/* Admin Action Bar */}
      <div className="bg-white rounded-xl border border-grid-300 p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted">Status:</span>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          <ProposalActions
            status={proposal.status}
            onApprove={handleApprove}
            onGenerateForFlagged={handleGenerateForFlagged}
            onCreateContract={handleCreateContract}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* AI Evaluation Card */}
      {proposal.aiEvaluation && (
        <div className="mb-6">
          <AIEvaluationCard evaluation={proposal.aiEvaluation} />
        </div>
      )}

      {/* Client Comment Card */}
      {proposal.status === "changes_requested" && proposal.clientComment && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">
              Client Feedback
            </h3>
          </div>
          <p className="text-sm text-muted-2 leading-relaxed">
            {proposal.clientComment}
          </p>
        </div>
      )}

      {/* Contract Link */}
      {proposal.contractId && (
        <div className="bg-success/5 border border-success/20 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Contract has been created from this proposal.
            </span>
            <Link
              href={`/admin/contracts/${proposal.contractId}`}
              className="text-sm font-medium text-highlight hover:text-highlight/80 transition-colors"
            >
              View Contract
            </Link>
          </div>
        </div>
      )}

      {/* Proposal Sections */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Proposal Content
        </h2>

        {editingSectionKey ? (
          <div className="space-y-4">
            {proposal.sections
              .filter((s) => s.isVisible)
              .sort((a, b) => a.order - b.order)
              .map((section) =>
                section.key === editingSectionKey ? (
                  <ProposalSectionEditor
                    key={section.key}
                    sectionKey={section.key}
                    title={section.title}
                    content={section.content}
                    onSave={(content) =>
                      handleSaveSection(section.key, content)
                    }
                    onCancel={() => setEditingSectionKey(null)}
                  />
                ) : (
                  <div
                    key={section.key}
                    className="bg-white rounded-xl border border-grid-300 p-5 opacity-60"
                  >
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      {section.title}
                    </h3>
                    <div className="text-sm text-muted-2 leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {section.content}
                    </div>
                  </div>
                )
              )}
          </div>
        ) : (
          <ProposalViewer
            sections={proposal.sections}
            status={proposal.status}
            onEditSection={handleEditSection}
          />
        )}
      </div>
    </div>
  );
}
