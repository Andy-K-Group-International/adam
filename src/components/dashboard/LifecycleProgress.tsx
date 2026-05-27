"use client";

const STAGES = [
  { key: "questionnaire", label: "Pre-Qualification" },
  { key: "proposal", label: "Proposal" },
  { key: "strategy", label: "Strategy" },
  { key: "contract", label: "Contract" },
  { key: "invoice", label: "Payment" },
  { key: "kickoff", label: "Implementation" },
  { key: "active", label: "Active" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

const NEXT_STEP: Record<StageKey, string> = {
  questionnaire: "Your application is being reviewed. You'll be notified when a proposal is ready.",
  proposal: "Review your proposal in the Documents section and reach out with any questions.",
  strategy: "Your strategy document is ready to review. Feedback welcome before contract stage.",
  contract: "Review and sign your contract to proceed to invoicing.",
  invoice: "Invoice issued. Once payment is confirmed, your project kicks off.",
  kickoff: "Implementation is underway. Your team will be in touch with next steps.",
  active: "Your engagement is active. All documents and updates are in your portal.",
};

interface LifecycleProgressProps {
  stage: string;
}

export default function LifecycleProgress({ stage }: LifecycleProgressProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === stage);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextStep = NEXT_STEP[stage as StageKey] ?? NEXT_STEP.questionnaire;

  return (
    <div className="bg-white rounded-xl border border-grid-300 p-6">
      <p className="label-mono mb-4">Lifecycle Progress</p>

      {/* Stage dots + connectors */}
      <div className="flex items-center gap-0">
        {STAGES.map((s, i) => {
          const completed = i < safeIndex;
          const current = i === safeIndex;
          const future = i > safeIndex;

          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              {/* Dot */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${
                    completed
                      ? "bg-foreground"
                      : current
                      ? "bg-highlight ring-2 ring-highlight/30"
                      : "bg-grid-500"
                  }`}
                />
                <span
                  className={`mt-1.5 text-[10px] font-medium whitespace-nowrap ${
                    current ? "text-foreground" : future ? "text-muted-2" : "text-muted"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {i < STAGES.length - 1 && (
                <div
                  className={`h-px flex-1 mx-1 ${
                    i < safeIndex ? "bg-foreground" : "bg-grid-500"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Next step guidance */}
      <p className="text-xs text-muted mt-5 border-t border-grid-300 pt-4 leading-relaxed">
        <span className="font-medium text-foreground">Next: </span>
        {nextStep}
      </p>
    </div>
  );
}
