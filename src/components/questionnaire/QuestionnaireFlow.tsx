"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listActive, listActiveSections } from "@/lib/supabase/queries/question-items";
import { getDraftByEmail, saveDraft, deleteDraft, submitDraft } from "@/lib/supabase/queries/questionnaires";
import { getLeadByEmail, upsertLead } from "@/lib/supabase/queries/client-leads";
import { sendQuestionnaireReceived } from "@/app/actions/email";
import type { Question, QuestionSection } from "@/lib/questionnaire-schema";
import { cn } from "@/lib/utils";
import StepProgressBar, { JOURNEY_STEPS } from "./StepProgressBar";
import FieldRenderer from "./FieldRenderer";
import ReviewPage from "./ReviewPage";
import { ArrowLeft, ArrowRight, Check, RotateCcw, PartyPopper, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

const STAFF_EMAIL = "info@andykgroupinternational.com";

const SECTION_ORDER = [
  "pre-qualification",
  "goals-context",
  "company-profile",
  "segment-selection",
  "e2e",
  "b2b",
  "b2g",
  "adam",
  "proposal-readiness",
  "attachments",
];

const SECTION_LABELS: Record<string, string> = {
  "pre-qualification": "Pre-Qualification",
  "goals-context": "Goals",
  "company-profile": "Company",
  "segment-selection": "Services",
  e2e: "End-to-End",
  b2b: "B2B",
  b2g: "B2G",
  adam: "A.D.A.M.",
  "proposal-readiness": "Proposal",
  attachments: "Uploads",
};

type FlowPhase = "email" | "pre-qualification" | "main-questionnaire" | "submitted";

interface PageData {
  sectionId: string;
  subsectionId: string;
  subsectionTitle: string;
  sectionLabel: string;
  questions: Question[];
}

export default function QuestionnaireFlow() {
  // Core state
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<FlowPhase>("email");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [serviceType, setServiceType] = useState<string>("");
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [showFinishButton, setShowFinishButton] = useState(false);

  // Loading / draft state
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // DB data
  const [dbQuestions, setDbQuestions] = useState<Question[] | null>(null);
  const [dbSections, setDbSections] = useState<QuestionSection[] | null>(null);

  const allQuestions: Question[] = dbQuestions ?? [];
  const questionSections: QuestionSection[] = dbSections ?? [];

  // Load questions/sections from Supabase
  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      const [questions, sections] = await Promise.all([
        listActive(supabase),
        listActiveSections(supabase),
      ]);
      setDbQuestions(
        questions.map((q: any) => ({
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
          serviceScope: q.service_scope ?? [],
        }))
      );
      setDbSections(sections);
    }
    fetchData();
  }, []);

  // Read email from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("adam_email");
    if (saved) {
      setEmail(saved);
    } else {
      setDraftLoaded(true);
    }
    setMounted(true);
  }, []);

  // Check lead + draft when email is set
  useEffect(() => {
    if (!email || !mounted || phase !== "email") return;
    handleEmailSubmit(email);
  }, [email, mounted]);

  // Auto-save draft (debounced)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => {
    if (!email || phase === "email" || phase === "submitted" || !draftLoaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const supabase = createClient();
      saveDraft(supabase, { email, answers, selectedSegments, currentPageIndex }).catch(() => {});
    }, 2000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [answers, currentPageIndex, selectedSegments, email, phase, draftLoaded]);

  // Confetti on submit
  useEffect(() => {
    if (phase !== "submitted") return;
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    const timer = setTimeout(() => setShowFinishButton(true), 250);
    return () => clearTimeout(timer);
  }, [phase]);

  // ─── Email submit handler ───
  const handleEmailSubmit = useCallback(
    async (submittedEmail?: string) => {
      const e = submittedEmail || email;
      if (!e) return;
      setLoading(true);
      localStorage.setItem("adam_email", e);

      try {
        const supabase = createClient();
        const lead = await getLeadByEmail(supabase, e);

        if (lead?.pre_qualification_completed) {
          setServiceType(lead.service_type || "");
          if (lead.service_type) setSelectedSegments([lead.service_type.toUpperCase()]);
          if (lead.pre_qualification_data) {
            setAnswers((prev) => ({ ...prev, ...(lead.pre_qualification_data as Record<string, any>) }));
          }
          const draftData = await getDraftByEmail(supabase, e);
          if (draftData && Object.keys(draftData).length > 0) {
            setDraft(draftData);
            setShowResumePrompt(true);
          } else {
            setDraftLoaded(true);
          }
          setPhase("main-questionnaire");
        } else {
          setDraftLoaded(true);
          setPhase("pre-qualification");
        }
      } catch {
        setDraftLoaded(true);
        setPhase("pre-qualification");
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  // ─── Pre-qualification completion ───
  const handlePreQualComplete = useCallback(async () => {
    setLoading(true);
    try {
      const situation: string[] = answers.preSituation || [];
      let determined = "e2e";
      if (situation.includes("We need automation & operational systems") && situation.length === 1) {
        determined = "adam";
      }

      setServiceType(determined);
      setSelectedSegments([determined.toUpperCase()]);

      const supabase = createClient();
      const preData: Record<string, any> = {};
      for (const [key, val] of Object.entries(answers)) {
        if (key.startsWith("pre")) preData[key] = val;
      }

      await upsertLead(supabase, {
        email,
        pre_qualification_completed: true,
        pre_qualification_completed_at: new Date().toISOString(),
        pre_qualification_data: preData,
        service_type: determined,
      });

      setPhase("main-questionnaire");
      setCurrentPageIndex(0);
      setShowReview(false);
    } catch (err) {
      console.error("Pre-qual completion error:", err);
    } finally {
      setLoading(false);
    }
  }, [answers, email]);

  // ─── Section/question filtering by service_scope ───
  const filteredQuestions = useMemo(() => {
    if (phase === "pre-qualification") {
      return allQuestions
        .filter((q) => q.section === "pre-qualification")
        .filter((q) => {
          if (!q.conditionalOn) return true;
          return answers[q.conditionalOn.questionId] === q.conditionalOn.value;
        });
    }

    const scopeKey = serviceType || "e2e";
    return allQuestions
      .filter((q) => {
        if (q.section === "pre-qualification") return false;
        const scope: string[] = q.serviceScope || [];
        return scope.includes("shared") || scope.includes(scopeKey);
      })
      .filter((q) => {
        if (!q.conditionalOn) return true;
        return answers[q.conditionalOn.questionId] === q.conditionalOn.value;
      });
  }, [allQuestions, phase, serviceType, answers]);

  const activeSections = useMemo(() => {
    if (phase === "pre-qualification") return ["pre-qualification"];
    return SECTION_ORDER.filter((sectionId) => {
      if (sectionId === "pre-qualification") return false;
      if (sectionId === "e2e") return serviceType === "e2e";
      if (sectionId === "b2b") return serviceType === "b2b" || selectedSegments.includes("B2B");
      if (sectionId === "b2g") return serviceType === "b2g" || selectedSegments.includes("B2G");
      if (sectionId === "adam") return serviceType === "adam" || selectedSegments.includes("ADAM");
      return true;
    });
  }, [phase, serviceType, selectedSegments]);

  // ─── Pages ───
  const pages = useMemo(() => {
    const result: PageData[] = [];
    activeSections.forEach((sectionId) => {
      const section = questionSections.find((s) => s.id === sectionId);
      if (!section) return;
      const sectionQs = filteredQuestions.filter((q) => q.section === sectionId);
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((sub: any) => {
          const subQs = sectionQs.filter((q) => q.subsection === sub.id);
          if (subQs.length === 0) return;
          result.push({
            sectionId,
            subsectionId: sub.id,
            subsectionTitle: sub.title,
            sectionLabel: SECTION_LABELS[sectionId] || sectionId,
            questions: subQs,
          });
        });
      } else if (sectionQs.length > 0) {
        result.push({
          sectionId,
          subsectionId: sectionId,
          subsectionTitle: section.title,
          sectionLabel: SECTION_LABELS[sectionId] || sectionId,
          questions: sectionQs,
        });
      }
    });
    return result;
  }, [activeSections, filteredQuestions, questionSections]);

  const onboardingProgress = useMemo(() => {
    if (showReview) return 1;
    if (pages.length <= 1) return 0;
    return currentPageIndex / pages.length;
  }, [showReview, pages.length, currentPageIndex]);

  const currentPage = pages[currentPageIndex];

  // ─── Handlers ───
  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (questionId === "segments") {
      const segs = Array.isArray(value) ? value : [];
      setSelectedSegments(segs);
      if (segs.includes("E2E")) setServiceType("e2e");
      else if (segs.includes("B2B") && segs.length === 1) setServiceType("b2b");
      else if (segs.includes("B2G") && segs.length === 1) setServiceType("b2g");
      else if (segs.includes("ADAM") && segs.length === 1) setServiceType("adam");
    }
  }, []);

  const animateTransition = useCallback((cb: () => void) => {
    setPageVisible(false);
    setTimeout(() => { cb(); setPageVisible(true); }, 150);
  }, []);

  const handleNext = useCallback(() => {
    if (phase === "pre-qualification" && currentPageIndex >= pages.length - 1) {
      handlePreQualComplete();
      return;
    }
    if (currentPageIndex < pages.length - 1) {
      animateTransition(() => setCurrentPageIndex((p) => p + 1));
    } else {
      animateTransition(() => setShowReview(true));
    }
  }, [currentPageIndex, pages.length, phase, animateTransition, handlePreQualComplete]);

  const handleBack = useCallback(() => {
    if (showReview) {
      animateTransition(() => setShowReview(false));
      return;
    }
    if (currentPageIndex > 0) {
      animateTransition(() => setCurrentPageIndex((p) => p - 1));
    }
  }, [currentPageIndex, showReview, animateTransition]);

  const handleEditFromReview = useCallback(
    (questionId: string) => {
      const idx = pages.findIndex((p) => p.questions.some((q) => q.id === questionId));
      if (idx >= 0) {
        animateTransition(() => { setCurrentPageIndex(idx); setShowReview(false); });
      }
    },
    [pages, animateTransition]
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      await submitDraft(supabase, { email, answers, selectedSegments });

      // Send staff notification
      const companyName = answers.companyName || answers.preCompanyName || "Unknown";
      const contactName = answers.contactName || answers.preContactName || "Unknown";
      sendQuestionnaireReceived({
        staffEmail: STAFF_EMAIL,
        companyName,
        contactName,
        contactEmail: email,
        questionnaireId: "submitted",
      }).catch(() => {});

      setPhase("submitted");
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, answers, selectedSegments]);

  const handleResumeDraft = useCallback(() => {
    if (draft) {
      const draftAnswers: Record<string, any> = {};
      if (draft.pre_qualification_data) Object.assign(draftAnswers, draft.pre_qualification_data);
      if (draft.b2b_data) Object.assign(draftAnswers, draft.b2b_data);
      if (draft.b2g_data) Object.assign(draftAnswers, draft.b2g_data);
      if (draft.adam_data) Object.assign(draftAnswers, draft.adam_data);
      if (draft.e2e_data) Object.assign(draftAnswers, draft.e2e_data);
      if (draft.company_name) draftAnswers.companyName = draft.company_name;
      if (draft.website_url) draftAnswers.websiteUrl = draft.website_url;
      if (draft.contact_name) draftAnswers.contactName = draft.contact_name;
      if (draft.contact_phone) draftAnswers.contactPhone = draft.contact_phone;
      if (draft.products_services) draftAnswers.productsServices = draft.products_services;
      if (draft.business_goals) draftAnswers.successVision = draft.business_goals;
      if (draft.challenges) draftAnswers.biggestObstacle = draft.challenges;
      setAnswers((prev) => ({ ...prev, ...draftAnswers }));
      setSelectedSegments(draft.segments || []);
    }
    setShowResumePrompt(false);
    setDraftLoaded(true);
  }, [draft]);

  const handleStartFresh = useCallback(() => {
    if (email) {
      const supabase = createClient();
      deleteDraft(supabase, email).catch(() => {});
    }
    const preAnswers: Record<string, any> = {};
    for (const [k, v] of Object.entries(answers)) {
      if (k.startsWith("pre")) preAnswers[k] = v;
    }
    setAnswers(preAnswers);
    setCurrentPageIndex(0);
    setShowReview(false);
    setShowResumePrompt(false);
    setDraftLoaded(true);
  }, [email, answers]);

  // ─── Loading ───
  if (!mounted || !dbQuestions || !dbSections) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-grid-500 border-t-highlight animate-spin" />
      </div>
    );
  }

  // ─── Email entry (shown when no email in localStorage) ───
  if (phase === "email" && !email) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-10">
          <StepProgressBar steps={JOURNEY_STEPS} currentStepIndex={0} progress={0} />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Get Started</h2>
          <p className="text-sm text-muted">Enter your business email to begin.</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); if (email) handleEmailSubmit(email); }}
          className="flex flex-col gap-3 max-w-sm mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className="w-full rounded-lg border border-grid-500 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight/30 transition-colors"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Checking..." : "Continue"}
          </Button>
        </form>
      </div>
    );
  }

  // ─── Loading check ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-highlight" />
      </div>
    );
  }

  // ─── Resume prompt ───
  if (showResumePrompt && draft) {
    const updatedDate = new Date(draft.updated_at).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-10">
          <StepProgressBar steps={JOURNEY_STEPS} currentStepIndex={0} progress={0} />
        </div>
        <div className="rounded-xl border border-grid-300 bg-background p-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-highlight/10">
              <RotateCcw className="h-5 w-5 text-highlight" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Welcome back</h2>
          <p className="text-sm text-muted mb-1">You have an unfinished questionnaire from {updatedDate}.</p>
          <p className="text-sm text-muted mb-6">Would you like to continue where you left off?</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={handleStartFresh}>Start Fresh</Button>
            <Button onClick={handleResumeDraft}>Continue</Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Submitted ───
  if (phase === "submitted") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={cn("text-center max-w-md mx-auto px-6", "animate-in fade-in slide-in-from-bottom-4 duration-500")}>
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-highlight/10">
              <PartyPopper className="h-8 w-8 text-highlight" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Congratulations!</h2>
          <p className="text-muted leading-relaxed mb-8">
            Your questionnaire has been submitted successfully.
            {serviceType === "e2e"
              ? " Our senior team will review your submission within 48 hours."
              : " Create your account to track progress and access your dashboard."}
          </p>
          <div className={cn("transition-all duration-500 ease-out", showFinishButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
            <Button onClick={() => { window.location.href = "/sign-in"; }} className="gap-2">
              Go to Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main questionnaire / pre-qualification flow ───
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-10">
        <StepProgressBar steps={JOURNEY_STEPS} currentStepIndex={0} progress={onboardingProgress} />
      </div>

      <div className={cn("transition-all duration-200 ease-out", pageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
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
            <div className="mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-highlight">
                {currentPage.sectionLabel}
              </span>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-snug mt-1">
                {currentPage.subsectionTitle}
              </h2>
            </div>

            <div className="space-y-6">
              {currentPage.questions.map((q) => (
                <div key={q.id}>
                  {q.type !== "checkbox" && (
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {q.question}
                      {q.required && <span className="text-highlight ml-1">*</span>}
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

            <div className="flex items-center justify-between mt-12">
              <div>
                {currentPageIndex > 0 && (
                  <Button variant="secondary" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                )}
              </div>
              <Button onClick={handleNext} disabled={loading} className="gap-2">
                {loading ? (
                  <>Processing <Loader2 className="h-4 w-4 animate-spin" /></>
                ) : phase === "pre-qualification" && currentPageIndex >= pages.length - 1 ? (
                  <>Complete Pre-Qualification <Check className="h-4 w-4" /></>
                ) : currentPageIndex === pages.length - 1 ? (
                  <>Review Answers <Check className="h-4 w-4" /></>
                ) : (
                  <>Next <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
