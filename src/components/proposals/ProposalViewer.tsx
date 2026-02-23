"use client";

import { Pencil } from "lucide-react";

interface Section {
  key: string;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
}

interface ProposalViewerProps {
  sections: Section[];
  status: string;
  onEditSection?: (key: string) => void;
}

export default function ProposalViewer({
  sections,
  status,
  onEditSection,
}: ProposalViewerProps) {
  const visibleSections = sections
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  if (visibleSections.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-grid-300 p-8 text-center">
        <p className="text-sm text-muted-2">No proposal sections yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleSections.map((section) => (
        <div
          key={section.key}
          className="bg-white rounded-xl border border-grid-300 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {section.title}
            </h3>
            {onEditSection && (
              <button
                onClick={() => onEditSection(section.key)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-2 hover:text-highlight transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
          </div>
          <div className="text-sm text-muted-2 leading-relaxed whitespace-pre-wrap">
            {section.content}
          </div>
        </div>
      ))}
    </div>
  );
}
