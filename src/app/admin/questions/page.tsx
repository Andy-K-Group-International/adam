"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import QuestionEditor from "@/components/admin/QuestionEditor";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Edit2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  text: "bg-blue-500/10 text-blue-500",
  url: "bg-indigo-500/10 text-indigo-500",
  email: "bg-cyan-500/10 text-cyan-500",
  phone: "bg-teal-500/10 text-teal-500",
  "long-text": "bg-violet-500/10 text-violet-500",
  "single-select": "bg-amber-500/10 text-amber-500",
  "multi-select": "bg-orange-500/10 text-orange-500",
  checkbox: "bg-green-500/10 text-green-500",
  address: "bg-rose-500/10 text-rose-500",
  file: "bg-pink-500/10 text-pink-500",
  group: "bg-gray-500/10 text-gray-500",
};

export default function AdminQuestionsPage() {
  const allQuestions = useQuery(api.questionItems.listAll);
  const allSections = useQuery(api.questionItems.listAllSections);
  const toggleActive = useMutation(api.questionItems.toggleActive);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (allQuestions === undefined || allSections === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const filteredQuestions = searchQuery
    ? allQuestions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(q.number).includes(searchQuery)
      )
    : allQuestions;

  const editingQuestionData = editingQuestion
    ? allQuestions.find((q) => q.id === editingQuestion)
    : null;

  const handleToggleActive = async (questionId: string, isActive: boolean) => {
    await toggleActive({ questionId, isActive: !isActive });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Questions</h1>
          <p className="text-sm text-muted-2 mt-0.5">
            {allQuestions.length} questions across {allSections.length} sections
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions by text, ID, or number..."
          className="w-full rounded-lg border border-grid-300 bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/50"
        />
      </div>

      {/* Search results mode */}
      {searchQuery ? (
        <div className="rounded-xl border border-grid-300 bg-background overflow-hidden">
          <div className="px-5 py-3 border-b border-grid-300">
            <p className="text-sm font-medium text-muted-2">
              {filteredQuestions.length} result{filteredQuestions.length !== 1 ? "s" : ""}
            </p>
          </div>
          {filteredQuestions.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              onEdit={() => setEditingQuestion(q.id)}
              onToggleActive={() => handleToggleActive(q.id, q.isActive)}
            />
          ))}
          {filteredQuestions.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-2">
              No questions match your search
            </div>
          )}
        </div>
      ) : (
        /* Section accordion mode */
        <div className="space-y-3">
          {allSections.map((section) => {
            const sectionQuestions = allQuestions.filter(
              (q) => q.section === section.id
            );
            if (sectionQuestions.length === 0) return null;

            const isExpanded = expandedSections[section.id] ?? false;
            const activeCount = sectionQuestions.filter((q) => q.isActive).length;

            return (
              <div
                key={section.id}
                className="rounded-xl border border-grid-300 bg-background overflow-hidden"
              >
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between px-5 py-4 cursor-pointer hover:bg-grid-300/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {section.title}
                    </h3>
                    <span className="text-xs text-muted-2">
                      {activeCount}/{sectionQuestions.length} active
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {/* Questions list */}
                <div
                  className={cn(
                    "transition-all duration-300 ease-out overflow-hidden",
                    isExpanded
                      ? "max-h-[5000px] opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="border-t border-grid-300">
                    {/* Subsection groups */}
                    {section.subsections.map((sub) => {
                      const subQuestions = sectionQuestions.filter(
                        (q) => q.subsection === sub.id
                      );
                      if (subQuestions.length === 0) return null;

                      return (
                        <div key={sub.id}>
                          <div className="px-5 py-2 bg-grid-300/30">
                            <p className="text-xs font-medium text-muted-2 uppercase tracking-wider">
                              {sub.title}
                            </p>
                          </div>
                          {subQuestions.map((q) => (
                            <QuestionRow
                              key={q.id}
                              question={q}
                              onEdit={() => setEditingQuestion(q.id)}
                              onToggleActive={() =>
                                handleToggleActive(q.id, q.isActive)
                              }
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {editingQuestionData && (
        <QuestionEditor
          question={editingQuestionData}
          allQuestions={allQuestions}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
}

// ─── Question row sub-component ───

interface QuestionRowProps {
  question: {
    id: string;
    number: number;
    question: string;
    type: string;
    required: boolean;
    isActive: boolean;
  };
  onEdit: () => void;
  onToggleActive: () => void;
}

function QuestionRow({ question, onEdit, onToggleActive }: QuestionRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-3 border-b border-grid-300 last:border-b-0 hover:bg-grid-300/30 transition-colors",
        !question.isActive && "opacity-50"
      )}
    >
      {/* Number */}
      <span className="text-xs font-mono text-muted-2 w-7 shrink-0">
        #{question.number}
      </span>

      {/* Question text */}
      <p className="text-sm text-foreground flex-1 min-w-0 truncate">
        {question.question}
      </p>

      {/* Type badge */}
      <span
        className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
          TYPE_COLORS[question.type] || "bg-grid-300 text-muted"
        )}
      >
        {question.type}
      </span>

      {/* Required badge */}
      {question.required && (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-highlight/10 text-highlight shrink-0">
          required
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onToggleActive}
          className="p-1.5 rounded-md text-muted-2 hover:text-foreground hover:bg-grid-300/50 transition-colors cursor-pointer"
          title={question.isActive ? "Deactivate" : "Activate"}
        >
          {question.isActive ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-md text-muted-2 hover:text-highlight hover:bg-highlight/10 transition-colors cursor-pointer"
          title="Edit question"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
