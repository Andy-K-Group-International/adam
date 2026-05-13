import { createAdminClient } from "@/lib/supabase/admin";
import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";
import { Lock } from "lucide-react";

export const metadata = {
  title: "Strategic Assessment — Andy'K Group",
  robots: { index: false, follow: false },
};

async function validateToken(token: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("leads")
    .select("id")
    .eq("questionnaire_token", token)
    .gt("token_expires_at", new Date().toISOString())
    .maybeSingle();
  return !!data;
}

export default async function FullQuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = token ? await validateToken(token) : false;

  if (!valid) {
    return (
      <main className="min-h-screen bg-bg-light relative flex items-center justify-center px-6">
        <div className="absolute inset-0 cartesian-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-md w-full text-center">
          <div className="bg-white rounded-2xl border border-grid-300 p-10">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="h-6 w-6 text-error" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-3">Access Restricted</h1>
            <p className="text-sm text-muted leading-relaxed">
              This link is invalid or has expired. Please contact Andy'K Group to request a new assessment invitation.
            </p>
            <div className="mt-8 pt-6 border-t border-grid-300">
              <a href="https://andykgroup.com" className="text-sm text-highlight hover:underline">
                Return to andykgroup.com
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-light relative">
      <div className="absolute inset-0 cartesian-grid opacity-40 pointer-events-none" />
      <div className="relative px-6 py-6 md:py-10">
        <QuestionnaireFlow />
      </div>
    </main>
  );
}
