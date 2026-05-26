"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { listMeetings, createMeeting, updateMeeting, deleteMeeting } from "@/lib/supabase/queries/meetings";
import type { Meeting, MeetingType, MeetingActionItem } from "@/lib/supabase/types";
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<MeetingType, string> = {
  discovery: "Discovery",
  strategy: "Strategy",
  review: "Review",
  kickoff: "Kickoff",
  other: "Other",
};

const TYPE_COLORS: Record<MeetingType, string> = {
  discovery: "bg-info/10 text-info",
  strategy: "bg-highlight/10 text-highlight",
  review: "bg-warning/10 text-warning",
  kickoff: "bg-success/10 text-success",
  other: "bg-grid-300 text-muted",
};

type MeetingForm = {
  date: string;
  type: MeetingType;
  attendees: string;
  notes: string;
  actionItems: MeetingActionItem[];
  newActionItem: string;
};

const emptyForm = (): MeetingForm => ({
  date: "",
  type: "other",
  attendees: "",
  notes: "",
  actionItems: [],
  newActionItem: "",
});

export default function MeetingsTab({ clientId }: { clientId: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MeetingForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    listMeetings(supabase, clientId)
      .then(setMeetings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  const parseAttendees = (s: string) =>
    s.split(",").map((a) => a.trim()).filter(Boolean);

  const handleSave = async () => {
    if (!form.date || !form.type) return;
    setSaving(true);
    try {
      const payload = {
        client_id: clientId,
        date: new Date(form.date).toISOString(),
        type: form.type,
        attendees: parseAttendees(form.attendees),
        notes: form.notes.trim() || undefined,
        action_items: form.actionItems,
      };
      if (editingId) {
        const updated = await updateMeeting(supabase, editingId, clientId, payload);
        setMeetings((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
      } else {
        const row = await createMeeting(supabase, payload);
        setMeetings((prev) => [row, ...prev]);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMeeting(supabase, id, clientId);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  };

  const startEdit = (m: Meeting) => {
    setEditingId(m.id);
    setShowForm(true);
    setForm({
      date: m.date.slice(0, 16),
      type: m.type,
      attendees: m.attendees.join(", "),
      notes: m.notes ?? "",
      actionItems: m.action_items ?? [],
      newActionItem: "",
    });
  };

  const addActionItem = () => {
    if (!form.newActionItem.trim()) return;
    setForm((prev) => ({
      ...prev,
      actionItems: [...prev.actionItems, { id: crypto.randomUUID(), text: prev.newActionItem.trim(), done: false }],
      newActionItem: "",
    }));
  };

  const toggleActionItem = (id: string) =>
    setForm((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((a) => a.id === id ? { ...a, done: !a.done } : a),
    }));

  const removeActionItem = (id: string) =>
    setForm((prev) => ({ ...prev, actionItems: prev.actionItems.filter((a) => a.id !== id) }));

  // Toggle action item done state in list view (non-form)
  const toggleListActionItem = async (meeting: Meeting, itemId: string) => {
    const updated = {
      ...meeting,
      action_items: meeting.action_items.map((a) => a.id === itemId ? { ...a, done: !a.done } : a),
    };
    await updateMeeting(supabase, meeting.id, clientId, { action_items: updated.action_items });
    setMeetings((prev) => prev.map((m) => m.id === meeting.id ? updated : m));
  };

  if (loading) return <div className="py-10 text-center text-sm text-muted-2">Loading meetings…</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Form panel */}
      {showForm && (
        <div className="bg-white rounded-xl border border-grid-300 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {editingId ? "Edit Meeting" : "Log Meeting"}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-mono block mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full h-9 rounded-lg border border-grid-500 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            </div>
            <div>
              <label className="label-mono block mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MeetingType })}
                className="w-full h-9 rounded-lg border border-grid-500 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
              >
                {(Object.keys(TYPE_LABELS) as MeetingType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-mono block mb-1">Attendees</label>
            <input
              type="text"
              value={form.attendees}
              onChange={(e) => setForm({ ...form, attendees: e.target.value })}
              placeholder="Separate by comma — e.g. John Smith, Jane Doe"
              className="w-full h-9 rounded-lg border border-grid-500 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
            />
          </div>

          <div>
            <label className="label-mono block mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              placeholder="Meeting notes, decisions made, context…"
              className="w-full rounded-lg border border-grid-500 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
            />
          </div>

          {/* Action items */}
          <div>
            <label className="label-mono block mb-2">Action Items</label>
            <div className="space-y-1.5 mb-2">
              {form.actionItems.map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={a.done}
                    onChange={() => toggleActionItem(a.id)}
                    className="h-4 w-4 rounded border-grid-500 accent-highlight"
                  />
                  <span className={cn("flex-1 text-sm", a.done && "line-through text-muted-2")}>{a.text}</span>
                  <button onClick={() => removeActionItem(a.id)} className="text-muted-2 hover:text-error">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.newActionItem}
                onChange={(e) => setForm({ ...form, newActionItem: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addActionItem())}
                placeholder="Add action item…"
                className="flex-1 h-8 rounded-lg border border-grid-500 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
              <button
                onClick={addActionItem}
                className="h-8 px-3 rounded-lg bg-grid-300 text-sm hover:bg-grid-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !form.date}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-highlight text-white text-sm font-medium disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {saving ? "Saving…" : editingId ? "Update" : "Log Meeting"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm()); }}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-grid-500 text-sm text-muted-2 hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Meeting list */}
      <div className="bg-white rounded-xl border border-grid-300 divide-y divide-grid-300">
        {meetings.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-2">No meetings logged yet.</div>
        )}
        {meetings.map((m) => {
          const isExpanded = expanded === m.id;
          const doneCount = m.action_items.filter((a) => a.done).length;
          return (
            <div key={m.id}>
              <div
                className="flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-grid-300/20 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : m.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", TYPE_COLORS[m.type])}>
                      {TYPE_LABELS[m.type]}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(m.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {m.attendees.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-2">
                      <Users className="h-3 w-3" />
                      {m.attendees.join(" · ")}
                    </div>
                  )}
                  {m.action_items.length > 0 && (
                    <p className="text-xs text-muted-2 mt-0.5">
                      {doneCount}/{m.action_items.length} action items done
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(m); }}
                    className="h-7 w-7 flex items-center justify-center rounded text-muted-2 hover:text-foreground hover:bg-grid-300 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {deletingId === m.id ? (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleDelete(m.id)} className="h-7 px-2 rounded bg-error text-white text-xs">Yes</button>
                      <button onClick={() => setDeletingId(null)} className="h-7 px-2 rounded border border-grid-500 text-xs">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingId(m.id); }}
                      className="h-7 w-7 flex items-center justify-center rounded text-muted-2 hover:text-error hover:bg-error/8 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-2" /> : <ChevronDown className="h-4 w-4 text-muted-2" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 bg-grid-300/10">
                  {m.notes && (
                    <div>
                      <p className="label-mono mb-1">Notes</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{m.notes}</p>
                    </div>
                  )}
                  {m.action_items.length > 0 && (
                    <div>
                      <p className="label-mono mb-2">Action Items</p>
                      <div className="space-y-1.5">
                        {m.action_items.map((a) => (
                          <div key={a.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={a.done}
                              onChange={() => toggleListActionItem(m, a.id)}
                              className="h-4 w-4 rounded border-grid-500 accent-highlight"
                            />
                            <span className={cn("text-sm", a.done && "line-through text-muted-2")}>
                              {a.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showForm && (
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-dashed border-grid-500 text-sm text-muted-2 hover:text-foreground hover:border-highlight/40 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Meeting
        </button>
      )}
    </div>
  );
}
