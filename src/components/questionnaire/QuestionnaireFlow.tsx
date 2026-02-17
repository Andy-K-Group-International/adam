"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  questions as allQuestions,
  getQuestionsForSegments,
} from "@/lib/questionnaire-schema";
import { cn } from "@/lib/utils";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import ReviewPage from "./ReviewPage";
import { CheckCircle2 } from "lucide-react";
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

export default function QuestionnaireFlow() {
  const [sessionId, setSessionId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize session and load from localStorage
  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);

    try {
      const saved = localStorage.getItem(getStorageKey(sid));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.currentIndex !== undefined)
          setCurrentIndex(parsed.currentIndex);
        if (parsed.selectedSegments)
          setSelectedSegments(parsed.selectedSegments);
        if (parsed.showReview) setShowReview(parsed.showReview);
      }
    } catch {
      // Ignore corrupted storage
    }

    setMounted(true);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (!sessionId || !mounted) return;
    try {
      localStorage.setItem(
        getStorageKey(sessionId),
        JSON.stringify({
          answers,
          currentIndex,
          selectedSegments,
          showReview,
        })
      );
    } catch {
      // Storage full or unavailable
    }
  }, [answers, currentIndex, selectedSegments, showReview, sessionId, mounted]);

  // Build the filtered question list
  const filteredQuestions = useMemo(() => {
    const base = getQuestionsForSegments(selectedSegments);
    // Filter out conditional questions whose condition is not met
    return base.filter((q) => {
      if (!q.conditionalOn) return true;
      return answers[q.conditionalOn.questionId] === q.conditionalOn.value;
    });
  }, [selectedSegments, answers]);

  const currentQuestion = filteredQuestions[currentIndex];
  const totalQuestions = filteredQuestions.length;

  const handleAnswerChange = useCallback(
    (value: any) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: value,
      }));

      // If this is the segment selection question, update segments
      if (currentQuestion.id === "segments") {
        setSelectedSegments(Array.isArray(value) ? value : []);
      }
    },
    [currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reached the end
      setShowReview(true);
    }
  }, [currentIndex, totalQuestions]);

  const handleBack = useCallback(() => {
    if (showReview) {
      setShowReview(false);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, showReview]);

  const handleEditFromReview = useCallback(
    (questionId: string) => {
      const idx = filteredQuestions.findIndex((q) => q.id === questionId);
      if (idx >= 0) {
        setCurrentIndex(idx);
        setShowReview(false);
      }
    },
    [filteredQuestions]
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // For now, log data. In the future, POST to Convex.
      console.log("Submitting questionnaire:", {
        sessionId,
        answers,
        selectedSegments,
        submittedAt: new Date().toISOString(),
      });

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSubmitted(true);

      // Clear saved state on successful submission
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
    setCurrentIndex(0);
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

  // Prevent flash of unstyled/unhydrated content
  if (!mounted) {
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
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-10">
        <ProgressBar
          current={showReview ? totalQuestions : currentIndex + 1}
          total={totalQuestions}
        />
      </div>

      {/* Section label */}
      {!showReview && currentQuestion && (
        <div className="mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-highlight">
            {(() => {
              const section = allQuestions.find(
                (q) => q.section === currentQuestion.section
              );
              if (!section) return "";
              // Find section title from questionSections
              const sectionData = [
                { id: "company-profile", title: "Company Profile" },
                { id: "segment-selection", title: "Service Selection" },
                { id: "b2b", title: "B2B -- Lead Generation" },
                { id: "b2g", title: "B2G -- Government Contracts" },
                { id: "adam", title: "A.D.A.M. -- System Licensing" },
                { id: "attachments", title: "Attachments" },
              ].find((s) => s.id === currentQuestion.section);
              return sectionData?.title || "";
            })()}
          </span>
        </div>
      )}

      {/* Content area */}
      {showReview ? (
        <ReviewPage
          answers={answers}
          questions={filteredQuestions}
          onEdit={handleEditFromReview}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : currentQuestion ? (
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={handleAnswerChange}
          onNext={handleNext}
          onBack={handleBack}
          isFirst={currentIndex === 0}
          isLast={currentIndex === totalQuestions - 1}
        />
      ) : null}
    </div>
  );
}
