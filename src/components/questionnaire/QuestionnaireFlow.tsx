"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listActive, listActiveSections } from "@/lib/supabase/queries/question-items";
import { getDraftByEmail, saveDraft, deleteDraft, submitDraft } from "@/lib/supabase/queries/questionnaires";
import type { Question, QuestionSection } from "@/lib/questionnaire-schema";
import { cn } from "@/lib/utils";
import StepProgressBar, { JOURNEY_STEPS } from "./StepProgressBar";
import FieldRenderer from "./FieldRenderer";
import ReviewPage from "./ReviewPage";
import { CheckCircle2, ArrowLeft, ArrowRight, Check, RotateCcw, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

/** Section-based page groupings for the questionnaire (all within the "Onboarding" journey step) */
const SECTION_ORDER = [
  "goals-context",
  "company-profile",
  "segment-selection",
  "b2b",
  "b2g",
  "adam",
  "proposal-readiness",
  "attachments",
];

interface PageData {
  sectionId: string;
  subsectionId: string;
  subsectionTitle: string;
  sectionLabel: string;
  questions: Question[];
}

export default function QuestionnaireFlow() {
  const [email, setEmail] = useState("");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showFinishButton, setShowFinishButton] = useState(false);

  // Supabase data state
  const [dbQuestions, setDbQuestions] = useState<Question[] | undefined>(undefined);
  const [dbSections, setDbSections] = useState<QuestionSection[] | undefined>(undefined);
  const [draft, setDraft] = useState<any | undefined>(undefined);
  const [draftChecked, setDraftChecked] = useState(false);

  const allQuestions: Question[] = dbQuestions ?? [];
  const questionSections: QuestionSection[] = dbSections ?? [];

  // Load questions and sections from Supabase on mount
  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [questions, sections] = await Promise.all([
        listActive(supabase),
        listActiveSections(supabase),
      ]);
      setDbQuestions(questions.map((q) => ({
        id: q.question_id,
        number: q.number,
        question: q.question,
        type: q.type,
        required: q.required,
        options: q.options ?? undefined,
        placeholder: q.placeholder ?? undefined,
        conditionalOn: q.conditional_on ?? undefined,
        section: q.section,
        subsection: q.subsection,
      })));
      setDbSections(sections);
    }

    fetchData();
  }, []);

  // Read email from localStorage (set by hero form)
  useEffect(() => {
    const saved = localStorage.getItem("adam_email");
    if (saved) {
      setEmail(saved);
    } else {
      // No email — skip draft lookup, go straight to questionnaire
      setDraftLoaded(true);
      setDraftChecked(true);
    }
    setMounted(true);
  }, []);

  // Query for existing draft when email is available
  useEffect(() => {
    if (!email) return;

    const supabase = createClient();

    async function fetchDraft() {
      const draftData = await getDraftByEmail(supabase, email);
      setDraft(draftData);
      setDraftChecked(true);
    }

    fetchDraft();
  }, [email]);

  // Show resume prompt when draft is found, or mark loaded if no draft
  useEffect(() => {
    if (!mounted || draftLoaded || !draftChecked) return;
    if (draft && Object.keys(draft.answers || {}).length > 0) {
      setShowResumePrompt(true);
    } else if (draft === null || draft === undefined) {
      setDraftLoaded(true);
    }
  }, [draft, draftLoaded, mounted, draftChecked]);

  // Auto-save draft to Supabase (debounced)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => {
    if (!email || !mounted || showResumePrompt || !draftLoaded) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const supabase = createClient();
      saveDraft(supabase, {
        email,
        answers,
        selectedSegments,
        currentPageIndex,
      }).catch(() => {
        // Silent fail — localStorage is the fallback
      });
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [answers, currentPageIndex, selectedSegments, email, mounted, showResumePrompt, draftLoaded]);

  // Fire confetti when submitted
  useEffect(() => {
    if (!isSubmitted) return;
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
    const timer = setTimeout(() => setShowFinishButton(true), 250);
    return () => clearTimeout(timer);
  }, [isSubmitted]);

  // Segment filtering: get questions for selected segments
  const filteredQuestions = useMemo(() => {
    const base = allQuestions.filter(
      (q) =>
        q.section === "goals-context" ||
        q.section === "company-profile" ||
        q.section === "segment-selection" ||
        q.section === "proposal-readiness" ||
        q.section === "attachments" ||
        q.section === "review"
    );

    const segmentQuestions: Question[] = [];
    if (selectedSegments.includes("B2B")) {
      segmentQuestions.push(...allQuestions.filter((q) => q.section === "b2b"));
    }
    if (selectedSegments.includes("B2G")) {
      segmentQuestions.push(...allQuestions.filter((q) => q.section === "b2g"));
    }
    if (selectedSegments.includes("ADAM")) {
      segmentQuestions.push(...allQuestions.filter((q) => q.section === "adam"));
    }

    const combined = [...base, ...segmentQuestions];

    return combined.filter((q) => {
      if (!q.conditionalOn) return true;
      return answers[q.conditionalOn.questionId] === q.conditionalOn.value;
    });
  }, [allQuestions, selectedSegments, answers]);

  // Determine which sections are active
  const activeSections = useMemo(() => {
    return SECTION_ORDER.filter((sectionId) => {
      if (sectionId === "b2b") return selectedSegments.includes("B2B");
      if (sectionId === "b2g") return selectedSegments.includes("B2G");
      if (sectionId === "adam") return selectedSegments.includes("ADAM");
      return true;
    });
  }, [selectedSegments]);

  // Section label lookup
  const sectionLabels: Record<string, string> = {
    "goals-context": "Goals",
    "company-profile": "Company",
    "segment-selection": "Services",
    b2b: "B2B",
    b2g: "B2G",
    adam: "A.D.A.M.",
    "proposal-readiness": "Proposal",
    attachments: "Uploads",
  };

  // Build pages grouped by subsection
  const pages = useMemo(() => {
    const result: PageData[] = [];

    activeSections.forEach((sectionId) => {
      const section = questionSections.find((s) => s.id === sectionId);
      if (!section) return;

      const sectionQuestions = filteredQuestions.filter(
        (q) => q.section === sectionId
      );

      section.subsections.forEach((sub) => {
        const subQuestions = sectionQuestions.filter(
          (q) => q.subsection === sub.id
        );
        if (subQuestions.length === 0) return;

        result.push({
          sectionId,
          subsectionId: sub.id,
          subsectionTitle: sub.title,
          sectionLabel: sectionLabels[sectionId] || sectionId,
          questions: subQuestions,
        });
      });
    });

    return result;
  }, [activeSections, filteredQuestions, questionSections]);

  // Progress within the "Onboarding" step (0-1)
  const onboardingProgress = useMemo(() => {
    if (showReview) return 1;
    const total = pages.length;
    if (total <= 1) return 0;
    return currentPageIndex / total;
  }, [showReview, pages.length, currentPageIndex]);

  const currentPage = pages[currentPageIndex];

  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (questionId === "segments") {
      setSelectedSegments(Array.isArray(value) ? value : []);
    }
  }, []);

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
      const supabase = createClient();
      await submitDraft(supabase, {
        email,
        answers,
        selectedSegments,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, answers, selectedSegments]);

  const handleResumeDraft = useCallback(() => {
    if (draft) {
      setAnswers(draft.answers || {});
      setSelectedSegments(draft.selected_segments || []);
      setCurrentPageIndex(draft.current_page_index || 0);
    }
    setShowResumePrompt(false);
    setDraftLoaded(true);
  }, [draft]);

  const handleStartFresh = useCallback(() => {
    if (email) {
      const supabase = createClient();
      deleteDraft(supabase, email).catch(() => {});
    }
    setAnswers({});
    setSelectedSegments([]);
    setCurrentPageIndex(0);
    setShowReview(false);
    setShowResumePrompt(false);
    setDraftLoaded(true);
  }, [email]);

  const handleStartOver = useCallback(() => {
    if (email) {
      const supabase = createClient();
      deleteDraft(supabase, email).catch(() => {});
    }
    setAnswers({});
    setSelectedSegments([]);
    setCurrentPageIndex(0);
    setShowReview(false);
    setIsSubmitted(false);
    setDraftLoaded(true);
  }, [email]);

  // Loading: waiting for mount or DB questions
  if (!mounted || dbQuestions === undefined || dbSections === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-grid-500 border-t-highlight animate-spin" />
      </div>
    );
  }

  // Resume prompt
  if (showResumePrompt && draft) {
    const updatedDate = new Date(draft.updated_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-10">
          <StepProgressBar
            steps={JOURNEY_STEPS}
            currentStepIndex={0}
            progress={0}
          />
        </div>
        <div className="rounded-xl border border-grid-300 bg-background p-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-highlight/10">
              <RotateCcw className="h-5 w-5 text-highlight" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-muted mb-1">
            You have an unfinished questionnaire from {updatedDate}.
          </p>
          <p className="text-sm text-muted mb-6">
            Would you like to continue where you left off?
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={handleStartFresh}>
              Start Fresh
            </Button>
            <Button onClick={handleResumeDraft}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Wait for draft check before showing questionnaire (only if email exists)
  if (email && !draftChecked && !draftLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-grid-500 border-t-highlight animate-spin" />
      </div>
    );
  }

  // Success screen
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-highlight/10">
              <PartyPopper className="h-8 w-8 text-highlight" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Congratulations!
          </h2>
          <p className="text-muted leading-relaxed mb-8">
            Your questionnaire has been submitted successfully. Create your
            account to track progress and access your dashboard.
          </p>
          <div
            className={cn(
              "transition-all duration-500 ease-out",
              showFinishButton
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            )}
          >
            <Button
              onClick={() => {
                window.location.href = "/create-account";
              }}
              className="gap-2"
            >
              Finish Your Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Journey step progress bar */}
      <div className="mb-10">
        <StepProgressBar
          steps={JOURNEY_STEPS}
          currentStepIndex={0}
          progress={onboardingProgress}
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
            sections={questionSections}
            onEdit={handleEditFromReview}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : currentPage ? (
          <>
            {/* Section + subsection header */}
            <div className="mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-highlight">
                {currentPage.sectionLabel}
              </span>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-snug mt-1">
                {currentPage.subsectionTitle}
              </h2>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentPage.questions.map((q) => (
                <div key={q.id}>
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
