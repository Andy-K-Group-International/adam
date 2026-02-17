"use client";

import { useState } from "react";
import type { Question } from "@/lib/questionnaire-schema";
import { questionSections } from "@/lib/questionnaire-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Edit2, Send, Loader2 } from "lucide-react";

interface ReviewPageProps {
  answers: Record<string, any>;
  questions: Question[];
  onEdit: (questionId: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReviewPage({
  answers,
  questions,
  onEdit,
  onSubmit,
  isSubmitting,
}: ReviewPageProps) {
  // Build sections from the questions that were actually shown
  const activeSectionIds = Array.from(
    new Set(questions.map((q) => q.section))
  );
  const activeSections = questionSections.filter((s) =>
    activeSectionIds.includes(s.id)
  );

  // Track which sections are expanded; all open by default
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(
    Object.fromEntries(activeSections.map((s) => [s.id, true]))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const formatAnswer = (question: Question, answer: any): string => {
    if (answer === undefined || answer === null || answer === "") {
      return "-- Not answered --";
    }

    if (question.type === "checkbox") {
      return answer ? "Yes" : "No";
    }

    if (question.type === "multi-select" && Array.isArray(answer)) {
      if (answer.length === 0) return "-- Not answered --";
      // Map values back to labels
      return answer
        .map((v: string) => {
          const opt = question.options?.find((o) => o.value === v);
          return opt ? opt.label : v;
        })
        .join(", ");
    }

    if (question.type === "single-select") {
      const opt = question.options?.find((o) => o.value === answer);
      return opt ? opt.label : answer;
    }

    if (question.type === "address" && typeof answer === "object") {
      const parts = [
        answer.line1,
        answer.line2,
        answer.city,
        answer.postcode,
        answer.country,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : "-- Not answered --";
    }

    if (question.type === "file" && Array.isArray(answer)) {
      return answer.length > 0 ? answer.join(", ") : "-- No files --";
    }

    return String(answer);
  };

  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-3">
      <div className="mb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-2 block mb-2">
          Final step
        </span>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-snug">
          Review your answers
        </h2>
        <p className="text-sm text-muted mt-2">
          Please review all your answers below before submitting. Click the edit
          button to go back to any question.
        </p>
      </div>

      <div className="space-y-4 mb-10">
        {activeSections.map((section) => {
          // Skip review section itself
          if (section.id === "review") return null;

          const sectionQuestions = questions.filter(
            (q) => q.section === section.id
          );
          if (sectionQuestions.length === 0) return null;

          const isExpanded = expandedSections[section.id] ?? true;

          return (
            <div
              key={section.id}
              className="rounded-xl border border-grid-300 bg-background overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between px-5 py-4 cursor-pointer hover:bg-grid-300/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {section.title}
                </h3>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "transition-all duration-300 ease-out overflow-hidden",
                  isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="border-t border-grid-300">
                  {sectionQuestions.map((q) => {
                    const answer = answers[q.id];
                    const formatted = formatAnswer(q, answer);
                    const isUnanswered =
                      formatted === "-- Not answered --" ||
                      formatted === "-- No files --";

                    return (
                      <div
                        key={q.id}
                        className="flex items-start justify-between gap-4 px-5 py-3 border-b border-grid-300 last:border-b-0 hover:bg-grid-300/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {q.question}
                          </p>
                          <p
                            className={cn(
                              "text-sm mt-1 leading-relaxed",
                              isUnanswered ? "text-muted-2 italic" : "text-muted"
                            )}
                          >
                            {formatted}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEdit(q.id)}
                          className="shrink-0 mt-1 flex items-center gap-1 text-xs text-highlight hover:text-highlight/80 transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit area */}
      <div className="rounded-xl border border-grid-300 bg-bg-light p-6">
        {!showConfirm ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Ready to submit?
              </p>
              <p className="text-xs text-muted-2 mt-0.5">
                You can still edit any answer above before submitting.
              </p>
            </div>
            <Button
              onClick={() => setShowConfirm(true)}
              size="lg"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Questionnaire
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              Are you sure you want to submit?
            </p>
            <p className="text-xs text-muted-2 mb-4">
              Once submitted, your answers will be sent for processing.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirm &amp; Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

