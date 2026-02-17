"use client";

import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/questionnaire-schema";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
} from "lucide-react";

interface QuestionCardProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function QuestionCard({
  question,
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
}: QuestionCardProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(timer);
  }, [question.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Allow Enter in textareas for newlines (shift+enter is default)
      if (question.type === "long-text") return;
      e.preventDefault();
      onNext();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case "text":
      case "url":
      case "email":
      case "phone":
        return (
          <Input
            type={
              question.type === "phone"
                ? "tel"
                : question.type === "url"
                  ? "url"
                  : question.type === "email"
                    ? "email"
                    : "text"
            }
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={question.placeholder || ""}
            className="max-w-xl"
            autoFocus
          />
        );

      case "long-text":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              // Ctrl/Cmd+Enter to advance for long text
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                onNext();
              }
            }}
            placeholder={question.placeholder || ""}
            rows={5}
            className="max-w-xl resize-y"
            autoFocus
          />
        );

      case "single-select":
        return (
          <div className="grid gap-3 max-w-xl">
            {question.options?.map((option) => {
              const selected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    // Auto-advance on single-select after a short delay
                    setTimeout(onNext, 300);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200 cursor-pointer",
                    selected
                      ? "border-highlight bg-highlight/5 text-foreground shadow-sm"
                      : "border-grid-500 bg-background text-foreground hover:border-grid-700 hover:bg-grid-300"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
                      selected
                        ? "border-highlight bg-highlight"
                        : "border-grid-500"
                    )}
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        );

      case "multi-select":
        return (
          <div className="grid gap-3 max-w-xl">
            {question.options?.map((option) => {
              const selectedValues: string[] = Array.isArray(value)
                ? value
                : [];
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const updated = isSelected
                      ? selectedValues.filter((v) => v !== option.value)
                      : [...selectedValues, option.value];
                    onChange(updated);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-highlight bg-highlight/5 text-foreground shadow-sm"
                      : "border-grid-500 bg-background text-foreground hover:border-grid-700 hover:bg-grid-300"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors duration-200",
                      isSelected
                        ? "border-highlight bg-highlight"
                        : "border-grid-500"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        );

      case "checkbox":
        return (
          <label className="flex items-start gap-3 max-w-xl cursor-pointer group">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked) => onChange(checked)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
              {question.question}
            </span>
          </label>
        );

      case "address":
        return (
          <div className="grid gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Address Line 1
              </label>
              <Input
                value={value?.line1 || ""}
                onChange={(e) =>
                  onChange({ ...value, line1: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Street address"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Address Line 2
              </label>
              <Input
                value={value?.line2 || ""}
                onChange={(e) =>
                  onChange({ ...value, line2: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  City
                </label>
                <Input
                  value={value?.city || ""}
                  onChange={(e) =>
                    onChange({ ...value, city: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Postcode
                </label>
                <Input
                  value={value?.postcode || ""}
                  onChange={(e) =>
                    onChange({ ...value, postcode: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Postcode"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Country
              </label>
              <Input
                value={value?.country || ""}
                onChange={(e) =>
                  onChange({ ...value, country: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Country"
              />
            </div>
          </div>
        );

      case "file":
        return (
          <div className="max-w-xl">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 cursor-pointer",
                "border-grid-500 hover:border-highlight/50 hover:bg-highlight/5"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // File handling placeholder
                const files = Array.from(e.dataTransfer.files);
                onChange(files.map((f) => f.name));
              }}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.onchange = () => {
                  if (input.files) {
                    const files = Array.from(input.files);
                    onChange(files.map((f) => f.name));
                  }
                };
                input.click();
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-grid-300">
                <Upload className="h-5 w-5 text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop files here or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-2">
                  PDF, DOCX, PPTX, images up to 10MB
                </p>
              </div>
            </div>
            {Array.isArray(value) && value.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {value.map((name: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md bg-grid-300 px-3 py-1.5 text-xs text-foreground"
                  >
                    <Check className="h-3 w-3 text-success" />
                    <span className="truncate">{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "transition-all duration-300 ease-out",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3"
      )}
    >
      <div className="mb-8">
        {/* For checkbox type, the question text is rendered inside the checkbox label */}
        {question.type !== "checkbox" && (
          <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-snug">
            {question.question}
            {question.required && (
              <span className="text-highlight ml-1">*</span>
            )}
          </h2>
        )}
      </div>

      <div className="mb-10">{renderInput()}</div>

      <div className="flex items-center justify-between mt-14">
        <div>
          {!isFirst && (
            <Button
              variant="secondary"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {question.type === "long-text" && (
            <span className="text-xs text-muted-2 hidden sm:inline">
              Press Ctrl+Enter to continue
            </span>
          )}
          <Button onClick={onNext} className="gap-2">
            {isLast ? (
              <>
                Review Answers
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
