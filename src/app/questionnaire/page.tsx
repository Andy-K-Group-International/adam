import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";

export const metadata = {
  title: "Start Your Questionnaire",
  description:
    "Tell us about your business in minutes. ADAM by Andyk Group will build a tailored automated document and account management workflow for you.",
  robots: { index: false },
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
