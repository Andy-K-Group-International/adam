"use client";

import PipelineBoard from "@/components/admin/PipelineBoard";

export default function PipelinePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
        <p className="text-muted mt-1">
          Track clients through each stage of the onboarding process.
        </p>
      </div>

      <PipelineBoard />
    </div>
  );
}
