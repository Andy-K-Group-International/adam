"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getQuestionnaireById } from "@/lib/supabase/queries/questionnaires";
import { createActivity } from "@/lib/supabase/queries/activity-log";
import { convertToClientAction } from "@/app/actions/questionnaires";
import type { Questionnaire } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft, UserPlus, Sparkles, Check, Flag, X } from "lucide-react";
import QuestionnairePreview from "@/components/admin/QuestionnairePreview";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const statusColors: Record<string, string> = {
  draft: "bg-grid-300 text-muted",
  submitted: "bg-info/10 text-info",
  converted: "bg-success/10 text-success",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  converted: "Converted",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  if (score >= 40) return "text-warning";
  return "text-error";
}

function recommendationStyle(rec: string): string {
  if (rec === "proceed") return "bg-success/10 text-success border-success/20";
  if (rec === "flag") return "bg-warning/10 text-warning border-warning/20";
  return "bg-error/10 text-error border-error/20";
}

function recommendationLabel(rec: string): string {
  if (rec === "proceed") return "Proceed";
  if (rec === "flag") return "Flag for Review";
  return "Reject";
}

export default function QuestionnaireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useCurrentUser();
  const questionnaireId = params.id as string;

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null | undefined>(undefined);
  const [isConverting, setIsConverting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState<string | null>(null);
  const [convertRole, setConvertRole] = useState<"client" | "company_admin">("client");
  const [convertError, setConvertError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    getQuestionnaireById(supabase, questionnaireId)
      .then(setQuestionnaire)
      .catch(() => setQuestionnaire(null));
  }, [questionnaireId]);

  if (questionnaire === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (!questionnaire) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Questionnaire not found</p>
      </div>
    );
  }

  const handleConvert = async () => {
    setIsConverting(true);
    setConvertError(null);
    try {
      const result = await convertToClientAction(questionnaire.id, convertRole);
      if (result.error) throw new Error(result.error);
      router.push(`/admin/clients/${result.clientId}`);
    } catch (err) {
      console.error("Failed to convert questionnaire:", err);
      setConvertError(err instanceof Error ? err.message : "Failed to convert questionnaire");
      setIsConverting(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/ai/evaluate-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionnaireId }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      const { evaluation } = await res.json();
      setQuestionnaire((prev) => prev ? { ...prev, ai_evaluation: evaluation } : prev);
    } catch (err) {
      console.error("Failed to evaluate:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleDecision = async (decision: "proceed" | "flag" | "reject") => {
    setDecisionLoading(decision);
    try {
      const supabase = createClient();
      const activityType =
        decision === "proceed"
          ? "questionnaire_proceed"
          : decision === "flag"
            ? "questionnaire_flag"
            : "questionnaire_reject";

      await createActivity(supabase, {
        type: activityType,
        actor_id: user?.id || null,
        client_id: null,
        contract_id: null,
        proposal_id: null,
        questionnaire_id: questionnaireId,
        metadata: {
          decision,
          qualityScore: questionnaire.ai_evaluation?.qualityScore ?? null,
        },
      });
    } catch (err) {
      console.error("Failed to log decision:", err);
    } finally {
      setDecisionLoading(null);
    }
  };

  const { ai_evaluation: eval_ } = questionnaire;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/questionnaires"
            className="text-muted-2 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-semibold text-foreground">
                {questionnaire.company_name || "Untitled"}
              </h1>
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  statusColors[questionnaire.status] || "bg-grid-300 text-muted"
                )}
              >
                {statusLabels[questionnaire.status] || questionnaire.status}
              </span>
            </div>
            <p className="text-sm text-muted-2 mt-0.5">
              Questionnaire submission
              {questionnaire.submitted_at
                ? ` · ${formatDate(questionnaire.submitted_at)}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {questionnaire.status === "submitted" && (
            <>
              {!eval_ && (
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="inline-flex items-center gap-2 bg-info text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-info/90 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {isEvaluating ? "Evaluating…" : "Run AI Evaluation"}
                </button>
              )}
              {eval_ && (
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {isEvaluating ? "Re-evaluating…" : "Re-evaluate"}
                </button>
              )}
              <select
                value={convertRole}
                onChange={(e) => setConvertRole(e.target.value as "client" | "company_admin")}
                className="h-10 px-3 text-sm border border-grid-300 rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30"
              >
                <option value="client">Client</option>
                <option value="company_admin">Company Admin</option>
              </select>
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                {isConverting ? "Converting…" : "Convert to Client"}
              </button>
            </>
          )}
          {questionnaire.status === "converted" && questionnaire.converted_to_client_id && (
            <Link
              href={`/admin/clients/${questionnaire.converted_to_client_id}`}
              className="inline-flex items-center gap-2 bg-success text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-success/90 transition-colors"
            >
              View Client
            </Link>
          )}
        </div>
      </div>

      {convertError && (
        <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error mb-6">
          {convertError}
        </div>
      )}

      {/* AI Evaluation Card */}
      {isEvaluating && !eval_ && (
        <div className="bg-white rounded-xl border border-grid-300 p-5 mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-info animate-pulse" />
            <p className="text-sm text-muted">Running AI evaluation — this may take a few seconds…</p>
          </div>
        </div>
      )}

      {eval_ && (
        <div className="bg-white rounded-xl border border-grid-300 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-info" />
              <h3 className="text-sm font-semibold text-foreground">AI Qualification</h3>
            </div>
            <span className="text-xs text-muted-2">
              Evaluated {formatDate(eval_.evaluatedAt)}
            </span>
          </div>

          {/* Score + Recommendation */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className={cn("text-3xl font-bold", scoreColor(eval_.qualityScore))}>
                {eval_.qualityScore}
              </p>
              <p className="text-xs text-muted-2 mt-0.5">/ 100</p>
            </div>
            <div>
              <span className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border",
                recommendationStyle(eval_.recommendation)
              )}>
                {recommendationLabel(eval_.recommendation)}
              </span>
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-grid-300/30 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-foreground leading-relaxed">{eval_.reasoning}</p>
          </div>

          {/* Decision Buttons */}
          <div className="border-t border-grid-300 pt-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Record Decision
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecision("proceed")}
                disabled={!!decisionLoading}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-success hover:bg-success/90 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {decisionLoading === "proceed" ? "Logging…" : "Proceed"}
              </button>
              <button
                onClick={() => handleDecision("flag")}
                disabled={!!decisionLoading}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-warning bg-warning/10 hover:bg-warning/20 border border-warning/20 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Flag className="h-3.5 w-3.5" />
                {decisionLoading === "flag" ? "Logging…" : "Flag"}
              </button>
              <button
                onClick={() => handleDecision("reject")}
                disabled={!!decisionLoading}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-error bg-error/10 hover:bg-error/20 border border-error/20 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                {decisionLoading === "reject" ? "Logging…" : "Reject"}
              </button>
              <p className="text-xs text-muted-2 ml-2">
                Decision is saved to the activity log.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Questionnaire Preview */}
      <QuestionnairePreview questionnaire={questionnaire as never} />
    </div>
  );
}
