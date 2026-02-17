"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  questions as allQuestions,
  questionSections,
  getQuestionsForSegments,
} from "@/lib/questionnaire-schema";
import type { Question } from "@/lib/questionnaire-schema";
import { cn } from "@/lib/utils";
import StepProgressBar, { type Step } from "./StepProgressBar";
import FieldRenderer from "./FieldRenderer";
import ReviewPage from "./ReviewPage";
import { CheckCircle2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY_PREFIX = "adam_questionnaire_";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const existing = sessionStorage.getItem("adam_questionnaire_session_id");
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());
  sessionStorage.setItem("adam_questionnaire_session_id", id);
  return id;
}

function getStorageKey(sessionId: string) {
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

/** Short step labels for the top bar */
const STEP_CONFIG: { sectionId: string; label: string; conditional?: boolean }[] = [
  { sectionId: "company-profile", label: "Company" },
  { sectionId: "segment-selection", label: "Services" },
  { sectionId: "b2b", label: "B2B", conditional: true },
  { sectionId: "b2g", label: "B2G", conditional: true },
  { sectionId: "adam", label: "A.D.A.M.", conditional: true },
  { sectionId: "attachments", label: "Uploads" },
  { sectionId: "review", label: "Review" },
];

interface PageData {
  stepIndex: number;
  sectionId: string;
  subsectionId: string;
  subsectionTitle: string;
  questions: Question[];
}

export default function QuestionnaireFlow() {
  const [sessionId, setSessionId] = useState("");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    try {
      const saved = localStorage.getItem(getStorageKey(sid));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.currentPageIndex !== undefined)
          setCurrentPageIndex(parsed.currentPageIndex);
        if (parsed.selectedSegments)
          setSelectedSegments(parsed.selectedSegments);
        if (parsed.showReview) setShowReview(parsed.showReview);
      }
    } catch {
      // Ignore corrupted storage
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sessionId || !mounted) return;
    try {
      localStorage.setItem(
        getStorageKey(sessionId),
        JSON.stringify({
          answers,
          currentPageIndex,
          selectedSegments,
          showReview,
        })
      );
    } catch {
      // Storage full
    }
  }, [answers, currentPageIndex, selectedSegments, showReview, sessionId, mounted]);

  // Build the filtered question list
  const filteredQuestions = useMemo(() => {
    const base = getQuestionsForSegments(selectedSegments);
    return base.filter((q) => {
      if (!q.conditionalOn) return true;
      return answers[q.conditionalOn.questionId] === q.conditionalOn.value;
    });
  }, [selectedSegments, answers]);

  // Build active steps (hide conditional steps that aren't selected)
  const activeSteps = useMemo(() => {
    return STEP_CONFIG.filter((cfg) => {
      if (!cfg.conditional) return true;
      if (cfg.sectionId === "b2b") return selectedSegments.includes("B2B");
      if (cfg.sectionId === "b2g") return selectedSegments.includes("B2G");
      if (cfg.sectionId === "adam") return selectedSegments.includes("ADAM");
      return true;
    });
  }, [selectedSegments]);

  // Build pages: group questions by subsection within each step
  const pages = useMemo(() => {
    const result: PageData[] = [];

    activeSteps.forEach((stepCfg, stepIndex) => {
      if (stepCfg.sectionId === "review") return; // Review is special

      const section = questionSections.find((s) => s.id === stepCfg.sectionId);
      if (!section) return;

      const sectionQuestions = filteredQuestions.filter(
        (q) => q.section === stepCfg.sectionId
      );

      // Group by subsection
      section.subsections.forEach((sub) => {
        const subQuestions = sectionQuestions.filter(
          (q) => q.subsection === sub.id
        );
        if (subQuestions.length === 0) return;

        result.push({
          stepIndex,
          sectionId: stepCfg.sectionId,
          subsectionId: sub.id,
          subsectionTitle: sub.title,
          questions: subQuestions,
        });
      });
    });

    return result;
  }, [activeSteps, filteredQuestions]);

  // Build Step objects for the progress bar
  const stepBarSteps: Step[] = useMemo(() => {
    return activeSteps.map((cfg, i) => {
      if (cfg.sectionId === "review") {
        return { id: cfg.sectionId, label: cfg.label, pageCount: 1 };
      }
      const pagesInStep = pages.filter((p) => p.stepIndex === i);
      return {
        id: cfg.sectionId,
        label: cfg.label,
        pageCount: Math.max(pagesInStep.length, 1),
      };
    });
  }, [activeSteps, pages]);

  // Current step index and page-within-step
  const currentPage = pages[currentPageIndex];
  const currentStepIndex = showReview
    ? activeSteps.length - 1
    : currentPage?.stepIndex ?? 0;

  const currentPageInStep = useMemo(() => {
    if (showReview) return 0;
    if (!currentPage) return 0;
    const pagesInThisStep = pages.filter(
      (p) => p.stepIndex === currentPage.stepIndex
    );
    return pagesInThisStep.indexOf(currentPage);
  }, [showReview, currentPage, pages]);

  const handleAnswerChange = useCallback(
    (questionId: string, value: any) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      if (questionId === "segments") {
        setSelectedSegments(Array.isArray(value) ? value : []);
      }
    },
    []
  );

  const animateTransition = useCallback((cb: () => void) => {
    setPageVisible(false);
    setTimeout(() => {
      cb();
      setPageVisible(true);
    }, 150);
  }, []);

  const handleNext = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      animateTransition(() => setCurrentPageIndex((prev) => prev + 1));
    } else {
      animateTransition(() => setShowReview(true));
    }
  }, [currentPageIndex, pages.length, animateTransition]);

  const handleBack = useCallback(() => {
    if (showReview) {
      animateTransition(() => setShowReview(false));
      return;
    }
    if (currentPageIndex > 0) {
      animateTransition(() => setCurrentPageIndex((prev) => prev - 1));
    }
  }, [currentPageIndex, showReview, animateTransition]);

  const handleEditFromReview = useCallback(
    (questionId: string) => {
      const pageIdx = pages.findIndex((p) =>
        p.questions.some((q) => q.id === questionId)
      );
      if (pageIdx >= 0) {
        animateTransition(() => {
          setCurrentPageIndex(pageIdx);
          setShowReview(false);
        });
      }
    },
    [pages, animateTransition]
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      console.log("Submitting questionnaire:", {
        sessionId,
        answers,
        selectedSegments,
        submittedAt: new Date().toISOString(),
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      try {
        localStorage.removeItem(getStorageKey(sessionId));
        sessionStorage.removeItem("adam_questionnaire_session_id");
      } catch {
        // Ignore
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, answers, selectedSegments]);

  const handleStartOver = useCallback(() => {
    setAnswers({});
    setSelectedSegments([]);
    setCurrentPageIndex(0);
    setShowReview(false);
    setIsSubmitted(false);
    try {
      sessionStorage.removeItem("adam_questionnaire_session_id");
    } catch {
      // Ignore
    }
    const newSid = getSessionId();
    setSessionId(newSid);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-grid-500 border-t-highlight animate-spin" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className={cn(
            "text-center max-w-md mx-auto px-6",
            "animate-in fade-in slide-in-from-bottom-4 duration-500"
          )}
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Thank you!
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            Your questionnaire has been submitted successfully. Our team will
            review your responses and reach out within 1-2 business days.
          </p>
          <Button variant="secondary" onClick={handleStartOver}>
            Start New Questionnaire
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step progress bar */}
      <div className="mb-10">
        <StepProgressBar
          steps={stepBarSteps}
          currentStepIndex={currentStepIndex}
          currentPageInStep={currentPageInStep}
        />
      </div>

      {/* Page content */}
      <div
        className={cn(
          "transition-all duration-200 ease-out",
          pageVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        )}
      >
        {showReview ? (
          <ReviewPage
            answers={answers}
            questions={filteredQuestions}
            onEdit={handleEditFromReview}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : currentPage ? (
          <>
            {/* Subsection title */}
            <div className="mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-highlight">
                {activeSteps[currentPage.stepIndex]?.label}
              </span>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-snug mt-1">
                {currentPage.subsectionTitle}
              </h2>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentPage.questions.map((q) => (
                <div key={q.id}>
                  {/* For checkbox type, the label is inside the field */}
                  {q.type !== "checkbox" && (
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {q.question}
                      {q.required && (
                        <span className="text-highlight ml-1">*</span>
                      )}
                    </label>
                  )}
                  <FieldRenderer
                    question={q}
                    value={answers[q.id]}
                    onChange={(val) => handleAnswerChange(q.id, val)}
                  />
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12">
              <div>
                {currentPageIndex > 0 && (
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>
              <Button onClick={handleNext} className="gap-2">
                {currentPageIndex === pages.length - 1 ? (
                  <>
                    Review Answers
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
