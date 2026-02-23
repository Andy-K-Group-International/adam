"use client";

import { useState } from "react";

interface ProposalSectionEditorProps {
  sectionKey: string;
  title: string;
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export default function ProposalSectionEditor({
  sectionKey,
  title,
  content,
  onSave,
  onCancel,
}: ProposalSectionEditorProps) {
  const [editedContent, setEditedContent] = useState(content);

  return (
    <div className="bg-white rounded-xl border border-grid-300 p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>

      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        rows={16}
        className="w-full text-sm border border-grid-500 rounded-lg px-3 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30 font-mono"
      />

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => onSave(editedContent)}
          className="bg-highlight text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors"
        >
          Save Section
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-2 border border-grid-300 hover:bg-grid-300/20 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
