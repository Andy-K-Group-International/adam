"use client";

import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  label: string;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStepIndex: number;
  /** 0-1 progress within the current step */
  progress: number;
}

const JOURNEY_STEPS: Step[] = [
  { id: "onboarding", label: "Onboarding" },
  { id: "proposal", label: "Proposal" },
  { id: "contract", label: "Contract" },
  { id: "strategy", label: "Strategy" },
  { id: "billing", label: "Billing" },
  { id: "kick-off", label: "Kick-off" },
];

export { JOURNEY_STEPS };

export default function StepProgressBar({
  steps,
  currentStepIndex,
  progress,
}: StepProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isCompleted = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                i < steps.length - 1 ? "flex-1" : "flex-none"
              )}
            >
              {/* Step label + dot */}
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <span
                  className={cn(
                    "font-mono text-[9px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-300",
                    isCurrent
                      ? "text-highlight font-medium"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-2"
                  )}
                >
                  {step.label}
                </span>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300 shrink-0",
                    isCurrent
                      ? "bg-highlight ring-4 ring-highlight/15"
                      : isCompleted
                        ? "bg-foreground"
                        : "bg-grid-500"
                  )}
                />
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-1.5 bg-grid-300 rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                      isCompleted
                        ? "bg-foreground"
                        : isCurrent
                          ? "bg-gradient-to-r from-highlight to-highlight/60"
                          : ""
                    )}
                    style={{
                      width: isCompleted
                        ? "100%"
                        : isCurrent
                          ? `${progress * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
