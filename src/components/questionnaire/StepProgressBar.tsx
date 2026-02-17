"use client";

import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  label: string;
  /** Number of pages inside this step */
  pageCount: number;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStepIndex: number;
  /** 0-based page within the current step */
  currentPageInStep: number;
}

export default function StepProgressBar({
  steps,
  currentStepIndex,
  currentPageInStep,
}: StepProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isCompleted = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;
          const isFuture = i > currentStepIndex;

          // Progress within the current step (0 to 1)
          const stepProgress = isCurrent
            ? step.pageCount > 1
              ? currentPageInStep / (step.pageCount - 1)
              : 1
            : isCompleted
              ? 1
              : 0;

          return (
            <div key={step.id} className={cn("flex items-center", i < steps.length - 1 ? "flex-1" : "flex-none")}>
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

              {/* Connector line (not after last step) */}
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
                          ? `${stepProgress * 100}%`
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
