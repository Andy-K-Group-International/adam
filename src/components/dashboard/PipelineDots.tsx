"use client";

import { cn } from "@/lib/utils";

const stages = [
  { key: "questionnaire", label: "Q", title: "Questionnaire" },
  { key: "proposal", label: "P", title: "Proposal" },
  { key: "strategy", label: "S", title: "Strategy" },
  { key: "contract", label: "C", title: "Contract" },
  { key: "invoice", label: "I", title: "Invoice" },
  { key: "kickoff", label: "K", title: "Kick-off" },
];

interface PipelineDotsProps {
  currentStage: string;
}

export default function PipelineDots({ currentStage }: PipelineDotsProps) {
  const currentIndex = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center gap-1.5">
      {stages.map((stage, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        return (
          <div key={stage.key} className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                isPast && "bg-success text-white",
                isCurrent && "bg-highlight text-white ring-2 ring-highlight/30",
                !isPast && !isCurrent && "bg-grid-300 text-muted-2"
              )}
              title={stage.title}
            >
              {stage.label}
            </div>
            {idx < stages.length - 1 && (
              <div
                className={cn(
                  "w-3 h-0.5",
                  idx < currentIndex ? "bg-success" : "bg-grid-300"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
