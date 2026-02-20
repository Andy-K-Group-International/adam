"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { listAll, listAllSections, toggleActive } from "@/lib/supabase/queries/question-items";
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

interface QuestionData {
  id: string;
  question_id: string;
  number: number;
  question: string;
  type: string;
  required: boolean;
  options: { label: string; value: string }[] | null;
  placeholder: string | null;
  conditional_on: { questionId: string; value: string } | null;
  section: string;
  subsection: string;
  is_active: boolean;
}

interface SectionData {
  id: string;
  section_id: string;
  title: string;
  subsections: { id: string; title: string }[];
  order: number;
  is_active: boolean;
}

export default function AdminQuestionsPage() {
  const [allQuestions, setAllQuestions] = useState<QuestionData[] | undefined>(undefined);
  const [allSections, setAllSections] = useState<SectionData[] | undefined>(undefined);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      listAll(supabase),
      listAllSections(supabase),
    ]).then(([questions, sections]) => {
      setAllQuestions(questions as QuestionData[]);
      setAllSections(sections as SectionData[]);
    }).catch(() => {
      setAllQuestions([]);
      setAllSections([]);
    });
  }, []);

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
          q.question_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(q.number).includes(searchQuery)
      )
    : allQuestions;

  const editingQuestionData = editingQuestion
    ? allQuestions.find((q) => q.question_id === editingQuestion)
    : null;

  const handleToggleActive = async (questionId: string, isActive: boolean) => {
    const supabase = createClient();
    await toggleActive(supabase, questionId, !isActive);
    // Refresh
    const updated = await listAll(supabase);
    setAllQuestions(updated as QuestionData[]);
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
              key={q.question_id}
              question={{ id: q.question_id, number: q.number, question: q.question, type: q.type, required: q.required, isActive: q.is_active }}
              onEdit={() => setEditingQuestion(q.question_id)}
              onToggleActive={() => handleToggleActive(q.question_id, q.is_active)}
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
              (q) => q.section === section.section_id
            );
            if (sectionQuestions.length === 0) return null;

            const isExpanded = expandedSections[section.section_id] ?? false;
            const activeCount = sectionQuestions.filter((q) => q.is_active).length;

            return (
              <div
                key={section.section_id}
                className="rounded-xl border border-grid-300 bg-background overflow-hidden"
              >
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.section_id)}
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
                              key={q.question_id}
                              question={{ id: q.question_id, number: q.number, question: q.question, type: q.type, required: q.required, isActive: q.is_active }}
                              onEdit={() => setEditingQuestion(q.question_id)}
                              onToggleActive={() => handleToggleActive(q.question_id, q.is_active)}
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
          question={{ id: editingQuestionData.question_id, number: editingQuestionData.number, question: editingQuestionData.question, type: editingQuestionData.type, required: editingQuestionData.required, options: editingQuestionData.options, placeholder: editingQuestionData.placeholder, conditionalOn: editingQuestionData.conditional_on, section: editingQuestionData.section, subsection: editingQuestionData.subsection, isActive: editingQuestionData.is_active }}
          allQuestions={allQuestions.map((q) => ({ id: q.question_id, number: q.number, question: q.question, type: q.type, required: q.required, options: q.options, placeholder: q.placeholder, conditionalOn: q.conditional_on, section: q.section, subsection: q.subsection, isActive: q.is_active }))}
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
      <span className="text-xs font-mono text-muted-2 w-7 shrink-0">
        #{question.number}
      </span>
      <p className="text-sm text-foreground flex-1 min-w-0 truncate">
        {question.question}
      </p>
      <span
        className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
          TYPE_COLORS[question.type] || "bg-grid-300 text-muted"
        )}
      >
        {question.type}
      </span>
      {question.required && (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-highlight/10 text-highlight shrink-0">
          required
        </span>
      )}
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
