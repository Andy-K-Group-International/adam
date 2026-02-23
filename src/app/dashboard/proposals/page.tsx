"use client";

import { Lightbulb } from "lucide-react";

export default function ProposalsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
        <p className="text-muted mt-1">Review proposals from Andy&apos;K Group.</p>
      </div>
      <div className="bg-white rounded-xl border border-grid-300 p-12 text-center">
        <Lightbulb className="h-12 w-12 text-muted mx-auto mb-4" />
        <p className="text-muted-2">
          When a proposal is ready for your review, you&apos;ll receive an email with a direct link.
        </p>
      </div>
    </div>
  );
}
