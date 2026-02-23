"use client";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface AIEvaluation {
  recommendation: string;
  reasoning: string;
  qualityScore: number;
  evaluatedAt: number;
}

export default function AIEvaluationCard({
  evaluation,
}: {
  evaluation: AIEvaluation;
}) {
  const scoreColor =
    evaluation.qualityScore >= 70
      ? "bg-success"
      : evaluation.qualityScore >= 40
        ? "bg-warning"
        : "bg-red-500";

  const scoreTextColor =
    evaluation.qualityScore >= 70
      ? "text-success"
      : evaluation.qualityScore >= 40
        ? "text-warning"
        : "text-red-500";

  return (
    <div className="bg-white rounded-xl border border-grid-300 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          AI Evaluation
        </h3>
        <span className="text-xs text-muted-2">
          {formatDate(evaluation.evaluatedAt)}
        </span>
      </div>

      {/* Quality Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted">Quality Score</span>
          <span className={cn("text-sm font-semibold", scoreTextColor)}>
            {evaluation.qualityScore}/100
          </span>
        </div>
        <div className="w-full h-2 bg-grid-300 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", scoreColor)}
            style={{ width: `${evaluation.qualityScore}%` }}
          />
        </div>
      </div>

      {/* Recommendation Badge */}
      <div className="mb-3">
        <span className="text-xs font-medium text-muted mr-2">
          Recommendation:
        </span>
        {evaluation.recommendation === "proceed" ? (
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
            Proceed
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">
            Flagged
          </span>
        )}
      </div>

      {/* Reasoning */}
      <div>
        <span className="text-xs font-medium text-muted">Reasoning</span>
        <p className="text-sm text-muted-2 mt-1 leading-relaxed">
          {evaluation.reasoning}
        </p>
      </div>
    </div>
  );
}
