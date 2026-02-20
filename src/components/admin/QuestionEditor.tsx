"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateQuestion as updateQuestionQuery } from "@/lib/supabase/queries/question-items";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const QUESTION_TYPES = [
  "text",
  "url",
  "email",
  "phone",
  "long-text",
  "single-select",
  "multi-select",
  "checkbox",
  "address",
  "file",
  "group",
] as const;

interface QuestionData {
  id: string;
  number: number;
  question: string;
  type: string;
  required: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  conditionalOn?: { questionId: string; value: string };
  section: string;
  subsection: string;
  isActive: boolean;
}

interface QuestionEditorProps {
  question: QuestionData;
  allQuestions: QuestionData[];
  onClose: () => void;
}

export default function QuestionEditor({
  question,
  allQuestions,
  onClose,
}: QuestionEditorProps) {
  

  const [text, setText] = useState(question.question);
  const [type, setType] = useState(question.type);
  const [required, setRequired] = useState(question.required);
  const [placeholder, setPlaceholder] = useState(question.placeholder ?? "");
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    question.options ?? []
  );
  const [conditionalQuestionId, setConditionalQuestionId] = useState(
    question.conditionalOn?.questionId ?? ""
  );
  const [conditionalValue, setConditionalValue] = useState(
    question.conditionalOn?.value ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const hasOptions = type === "single-select" || type === "multi-select";

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { label: "", value: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    index: number,
    field: "label" | "value",
    val: string
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: val } : opt))
    );
  };

  const handleSave = async () => {
    setError("");
    if (!text.trim()) {
      setError("Question text is required");
      return;
    }
    if (hasOptions && options.some((o) => !o.label.trim() || !o.value.trim())) {
      setError("All options must have a label and value");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      await updateQuestionQuery(supabase,
        question.id, {
        question: text,
        type: type as any,
        required,
        placeholder: placeholder || undefined,
        options: hasOptions ? options : undefined,
        conditionalOn:
          conditionalQuestionId && conditionalValue
            ? { questionId: conditionalQuestionId, value: conditionalValue }
            : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border border-grid-300 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-grid-300">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Edit Question #{question.number}
            </h3>
            <p className="text-xs text-muted-2 mt-0.5">
              ID: {question.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-2 hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Question text */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Question Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-grid-300 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/50 resize-none"
            />
          </div>

          {/* Type + Required row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-grid-300 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/50"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Required
              </label>
              <button
                type="button"
                onClick={() => setRequired(!required)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  required
                    ? "border-highlight bg-highlight/10 text-highlight"
                    : "border-grid-300 bg-background text-muted-2"
                )}
              >
                {required ? "Required" : "Optional"}
              </button>
            </div>
          </div>

          {/* Placeholder */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Placeholder
            </label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="w-full rounded-lg border border-grid-300 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/50"
              placeholder="Optional placeholder text"
            />
          </div>

          {/* Options editor (for select types) */}
          {hasOptions && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Options
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) =>
                        handleOptionChange(i, "label", e.target.value)
                      }
                      placeholder="Label"
                      className="flex-1 rounded-lg border border-grid-300 bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/50"
                    />
                    <input
                      type="text"
                      value={opt.value}
                      onChange={(e) =>
                        handleOptionChange(i, "value", e.target.value)
                      }
                      placeholder="Value"
                      className="flex-1 rounded-lg border border-grid-300 bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="text-muted-2 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-1.5 text-xs text-highlight hover:text-highlight/80 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add option
                </button>
              </div>
            </div>
          )}

          {/* Conditional logic */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Conditional On (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={conditionalQuestionId}
                onChange={(e) => setConditionalQuestionId(e.target.value)}
                className="rounded-lg border border-grid-300 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/50"
              >
                <option value="">No condition</option>
                {allQuestions
                  .filter((q) => q.id !== question.id)
                  .map((q) => (
                    <option key={q.id} value={q.id}>
                      #{q.number} {q.id}
                    </option>
                  ))}
              </select>
              <input
                type="text"
                value={conditionalValue}
                onChange={(e) => setConditionalValue(e.target.value)}
                placeholder="Required value"
                disabled={!conditionalQuestionId}
                className="rounded-lg border border-grid-300 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/50 disabled:opacity-50"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-grid-300">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
