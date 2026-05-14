"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
} from "@/lib/supabase/queries/proposal-templates";
import type { ProposalTemplate } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface Section {
  key: string;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
}

interface TemplateForm {
  name: string;
  version: number;
  is_active: boolean;
  system_prompt: string;
  sections: Section[];
}

const emptyForm = (): TemplateForm => ({
  name: "",
  version: 1,
  is_active: true,
  system_prompt: "",
  sections: [],
});

export default function TemplatesPage() {
  const { user } = useCurrentUser();
  const [templates, setTemplates] = useState<ProposalTemplate[] | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<TemplateForm>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedPrompt, setExpandedPrompt] = useState(false);

  const fetchTemplates = async () => {
    const supabase = createClient();
    try {
      const data = await listTemplates(supabase);
      setTemplates(data);
    } catch {
      setTemplates([]);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setExpandedPrompt(false);
    setIsCreating(true);
  };

  const startEdit = (template: ProposalTemplate) => {
    setIsCreating(false);
    setEditingId(template.id);
    setForm({
      name: template.name,
      version: template.version,
      is_active: template.is_active,
      system_prompt: template.system_prompt,
      sections: [...template.sections].sort((a, b) => a.order - b.order),
    });
    setError("");
    setExpandedPrompt(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm(emptyForm());
    setError("");
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Template name is required.");
      return;
    }
    if (form.sections.length === 0) {
      setError("At least one section is required.");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        name: form.name.trim(),
        version: form.version,
        is_active: form.is_active,
        system_prompt: form.system_prompt.trim(),
        sections: form.sections.map((s, i) => ({ ...s, order: i })),
        created_by: user?.id || null,
      };

      if (editingId) {
        await updateTemplate(supabase, editingId, payload);
      } else {
        await createTemplate(supabase, payload);
      }

      await fetchTemplates();
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (template: ProposalTemplate) => {
    const supabase = createClient();
    try {
      await updateTemplate(supabase, template.id, { is_active: !template.is_active });
      setTemplates((prev) =>
        (prev || []).map((t) =>
          t.id === template.id ? { ...t, is_active: !t.is_active } : t
        )
      );
    } catch {
      // silent
    }
  };

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          key: `section_${Date.now()}`,
          title: "New Section",
          content: "",
          order: prev.sections.length,
          isVisible: true,
        },
      ],
    }));
  };

  const removeSection = (index: number) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const updateSection = (index: number, field: keyof Section, value: string | boolean | number) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...form.sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;
    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
    setForm((prev) => ({ ...prev, sections: newSections }));
  };

  if (templates === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const showForm = isCreating || editingId !== null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/proposals"
          className="text-muted-2 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-serif font-semibold text-foreground">Proposal Templates</h1>
          <p className="text-sm text-muted-2 mt-0.5">
            Manage reusable proposal templates with sections and AI prompts.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={startCreate}
            className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        )}
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="bg-white rounded-xl border border-grid-300 p-5 mb-8 space-y-6">
          <h2 className="text-sm font-semibold text-foreground">
            {editingId ? "Edit Template" : "New Template"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Name + Version + Active */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., B2B Lead Generation"
                className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Version
              </label>
              <input
                type="number"
                min={1}
                value={form.version}
                onChange={(e) => setForm((f) => ({ ...f, version: parseInt(e.target.value) || 1 }))}
                className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="rounded border-grid-500 text-highlight focus:ring-highlight"
            />
            <span className="text-sm text-foreground">Active (available when creating proposals)</span>
          </label>

          {/* System Prompt */}
          <div>
            <button
              type="button"
              onClick={() => setExpandedPrompt(!expandedPrompt)}
              className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 hover:text-foreground transition-colors"
            >
              {expandedPrompt ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              AI System Prompt
            </button>
            {expandedPrompt && (
              <textarea
                value={form.system_prompt}
                onChange={(e) => setForm((f) => ({ ...f, system_prompt: e.target.value }))}
                placeholder="Instructions for AI to generate proposal content from a questionnaire..."
                rows={8}
                className="w-full text-sm font-mono border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            )}
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Sections
              </label>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-highlight hover:text-highlight/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Section
              </button>
            </div>

            {form.sections.length === 0 ? (
              <div className="bg-grid-300/40 rounded-lg px-4 py-6 text-center">
                <p className="text-sm text-muted-2">No sections yet. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {form.sections.map((section, index) => (
                  <div
                    key={section.key}
                    className="border border-grid-500 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(index, "title", e.target.value)}
                        placeholder="Section title"
                        className="flex-1 text-sm font-medium border border-grid-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-highlight/30"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveSection(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 text-muted-2 hover:text-foreground transition-colors disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(index, "down")}
                          disabled={index === form.sections.length - 1}
                          className="p-1.5 text-muted-2 hover:text-foreground transition-colors disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSection(index, "isVisible", !section.isVisible)}
                          className="p-1.5 text-muted-2 hover:text-foreground transition-colors"
                          title={section.isVisible ? "Hide from client" : "Show to client"}
                        >
                          {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(index)}
                          className="p-1.5 text-muted-2 hover:text-error transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(index, "content", e.target.value)}
                      placeholder="Default section content (can be overridden per proposal)..."
                      rows={4}
                      className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
                    />
                    {!section.isVisible && (
                      <p className="text-xs text-muted-2">Hidden from client view by default</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="relative inline-flex items-center justify-center h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
            >
              {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Template"}
            </button>
            <button
              onClick={cancelEdit}
              className="text-sm text-muted-2 hover:text-foreground transition-colors px-4 py-2.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Template list */}
      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="bg-white rounded-xl border border-grid-300 p-12 text-center">
            <p className="text-muted-2">No templates yet.</p>
            <p className="text-sm text-muted-2 mt-1">
              Create your first template to speed up proposal creation.
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "bg-white rounded-xl border p-4",
                editingId === template.id
                  ? "border-highlight/30"
                  : "border-grid-300"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{template.name}</p>
                      <span className="text-xs text-muted-2">v{template.version}</span>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          template.is_active
                            ? "bg-success/10 text-success"
                            : "bg-grid-300 text-muted"
                        )}
                      >
                        {template.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-2 mt-0.5">
                      {template.sections.length} section{template.sections.length !== 1 ? "s" : ""} &middot; Updated {formatDate(template.updated_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(template)}
                    className="text-xs text-muted-2 hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-grid-300"
                  >
                    {template.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() =>
                      editingId === template.id ? cancelEdit() : startEdit(template)
                    }
                    className="text-xs font-medium text-highlight hover:text-highlight/80 transition-colors px-2 py-1.5 rounded hover:bg-highlight/5"
                  >
                    {editingId === template.id ? "Cancel" : "Edit"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
