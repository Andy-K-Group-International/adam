"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  listMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestones,
} from "@/lib/supabase/queries/milestones";
import type { Milestone, MilestoneStatus } from "@/lib/supabase/types";
import { Plus, Trash2, Edit2, Check, X, GripVertical, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; dot: string; text: string; bg: string }> = {
  pending:     { label: "Pending",     dot: "bg-muted-2",   text: "text-muted",    bg: "bg-grid-300/60" },
  in_progress: { label: "In Progress", dot: "bg-info",      text: "text-info",     bg: "bg-info/8" },
  completed:   { label: "Completed",   dot: "bg-success",   text: "text-success",  bg: "bg-success/8" },
  blocked:     { label: "Blocked",     dot: "bg-error",     text: "text-error",    bg: "bg-error/8" },
};

function StatusBadge({ status }: { status: MilestoneStatus }) {
  const s = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", s.bg, s.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

type EditForm = {
  title: string;
  description: string;
  status: MilestoneStatus;
  due_date: string;
};

const emptyForm = (): EditForm => ({
  title: "",
  description: "",
  status: "pending",
  due_date: "",
});

export default function MilestonesTab({ clientId }: { clientId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    listMilestones(supabase, clientId)
      .then(setMilestones)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  const completed = milestones.filter((m) => m.status === "completed").length;
  const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const row = await createMilestone(supabase, {
        client_id: clientId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        due_date: form.due_date || null,
        order: milestones.length,
      });
      setMilestones((prev) => [...prev, row]);
      setForm(emptyForm());
      setAdding(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const updated = await updateMilestone(supabase, id, clientId, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        due_date: form.due_date || null,
      });
      setMilestones((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setEditingId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMilestone(supabase, id, clientId);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickStatus = async (m: Milestone, next: MilestoneStatus) => {
    const updated = await updateMilestone(supabase, m.id, clientId, { status: next });
    setMilestones((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
  };

  // Drag-to-reorder
  const onDragStart = (idx: number) => { dragItem.current = idx; };
  const onDragEnter = (idx: number) => { dragOverItem.current = idx; };
  const onDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    const reordered = [...milestones];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    dragItem.current = null;
    dragOverItem.current = null;
    setMilestones(reordered);
    await reorderMilestones(supabase, clientId, reordered.map((m) => m.id));
  };

  const startEditing = (m: Milestone) => {
    setEditingId(m.id);
    setAdding(false);
    setForm({
      title: m.title,
      description: m.description ?? "",
      status: m.status,
      due_date: m.due_date ?? "",
    });
  };

  if (loading) return <div className="py-10 text-center text-sm text-muted-2">Loading milestones…</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Progress */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-grid-300">
            <div
              className="h-2 rounded-full bg-highlight transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-2 mt-2">
            {completed} of {milestones.length} milestone{milestones.length !== 1 ? "s" : ""} completed
          </p>
        </div>
      )}

      {/* Milestone list */}
      <div className="bg-white rounded-xl border border-grid-300 divide-y divide-grid-300">
        {milestones.length === 0 && !adding && (
          <div className="py-10 text-center text-sm text-muted-2">No milestones yet.</div>
        )}

        {milestones.map((m, idx) => (
          <div
            key={m.id}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragEnter={() => onDragEnter(idx)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-start gap-3 px-4 py-3.5 cursor-grab active:cursor-grabbing hover:bg-grid-300/20 transition-colors"
          >
            <GripVertical className="h-4 w-4 text-muted-2 shrink-0 mt-0.5 cursor-grab" />

            {editingId === m.id ? (
              <div className="flex-1 space-y-3">
                <MilestoneForm form={form} setForm={setForm} />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(m.id)}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-highlight text-white text-xs font-medium disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-grid-500 text-muted-2 text-xs hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{m.title}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  {m.description && (
                    <p className="text-xs text-muted-2 mb-1">{m.description}</p>
                  )}
                  {m.due_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-2">
                      <Calendar className="h-3 w-3" />
                      Due {new Date(m.due_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  )}
                  {/* Quick status cycle */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {(["pending", "in_progress", "completed", "blocked"] as MilestoneStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleQuickStatus(m, s)}
                        disabled={m.status === s}
                        className={cn(
                          "h-6 px-2 rounded text-xs transition-colors",
                          m.status === s
                            ? "bg-grid-300 text-foreground cursor-default"
                            : "text-muted-2 hover:bg-grid-300 hover:text-foreground"
                        )}
                      >
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEditing(m)}
                    className="h-7 w-7 flex items-center justify-center rounded text-muted-2 hover:text-foreground hover:bg-grid-300 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {deletingId === m.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(m.id)} className="h-7 px-2 rounded bg-error text-white text-xs">Yes</button>
                      <button onClick={() => setDeletingId(null)} className="h-7 px-2 rounded border border-grid-500 text-xs">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(m.id)}
                      className="h-7 w-7 flex items-center justify-center rounded text-muted-2 hover:text-error hover:bg-error/8 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add form */}
        {adding && (
          <div className="px-4 py-4 space-y-3">
            <MilestoneForm form={form} setForm={setForm} />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving || !form.title.trim()}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-highlight text-white text-xs font-medium disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                Add Milestone
              </button>
              <button
                onClick={() => { setAdding(false); setForm(emptyForm()); }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-grid-500 text-muted-2 text-xs hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {!adding && (
        <button
          onClick={() => { setAdding(true); setEditingId(null); setForm(emptyForm()); }}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-dashed border-grid-500 text-sm text-muted-2 hover:text-foreground hover:border-highlight/40 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </button>
      )}
    </div>
  );
}

function MilestoneForm({ form, setForm }: { form: EditForm; setForm: (f: EditForm) => void }) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Milestone title"
        className="w-full h-9 rounded-lg border border-grid-500 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
        autoFocus
      />
      <input
        type="text"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description (optional)"
        className="w-full h-9 rounded-lg border border-grid-500 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
      />
      <div className="flex gap-2">
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as MilestoneStatus })}
          className="flex-1 h-9 rounded-lg border border-grid-500 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>
        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          className="flex-1 h-9 rounded-lg border border-grid-500 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
        />
      </div>
    </div>
  );
}
