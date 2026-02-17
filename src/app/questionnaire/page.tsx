import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";

export const metadata = {
  title: "Questionnaire | A.D.A.M.",
  description: "Complete your client onboarding questionnaire for A.D.A.M.",
};

export default function QuestionnairePage() {
  return (
    <main className="min-h-screen bg-bg-light relative">
      {/* Subtle dot grid background */}
      <div className="absolute inset-0 cartesian-grid opacity-40 pointer-events-none" />

      <div className="relative">
        {/* Questionnaire content */}
        <div className="px-6 py-6 md:py-10">
          <QuestionnaireFlow />
        </div>
      </div>
    </main>
  );
}
