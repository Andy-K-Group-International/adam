import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";
import { Lock } from "lucide-react";

export const metadata = {
  title: "Strategic Assessment — Andy'K Group International LTD",
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

function QuestHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-grid-300">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
        <Image src="/adam-logo-simple-no-bg.png" alt="A.D.A.M." width={32} height={32} />
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm tracking-tight">A.D.A.M.</span>
          <span className="text-grid-700 text-xs">/</span>
          <span className="label-mono">{subtitle}</span>
        </div>
      </div>
    </div>
  );
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
        <div className="absolute inset-0 cartesian-grid opacity-30 pointer-events-none" />
        <div className="relative max-w-md w-full text-center">
          <div className="glass-card rounded-2xl border border-grid-300 p-10">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="h-6 w-6 text-error" />
            </div>
            <h1 className="text-xl font-serif font-semibold text-foreground mb-3">Access Restricted</h1>
            <p className="text-sm text-muted leading-relaxed">
              This link is invalid or has expired. Please contact Andy'K Group International LTD to request a new assessment invitation.
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
      <div className="absolute inset-0 cartesian-grid opacity-30 pointer-events-none" />
      <QuestHeader subtitle="Strategic Assessment" />
      <div className="relative px-6 py-8 md:py-12">
        <QuestionnaireFlow />
      </div>
    </main>
  );
}
