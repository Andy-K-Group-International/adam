import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";

export const metadata = {
  title: "Questionnaire | A.D.A.M.",
  description: "Complete your client onboarding questionnaire for A.D.A.M.",
};

export default function QuestionnairePage() {
  return (
    <main className="min-h-screen bg-bg-light relative">
      {/* Subtle dot grid background */}
      <div className="absolute inset-0 cartesian-grid pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="border-b border-grid-300 bg-background/80 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground tracking-tight">
                A.D.A.M.
              </span>
              <span className="text-grid-700">|</span>
              <span className="text-sm text-muted">Onboarding</span>
            </div>
          </div>
        </div>

        {/* Questionnaire content */}
        <div className="px-6 py-10 md:py-16">
          <QuestionnaireFlow />
        </div>
      </div>
    </main>
  );
}
