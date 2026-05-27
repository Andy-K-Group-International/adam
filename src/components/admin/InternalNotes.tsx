"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Pin, CheckCircle, Circle, ChevronDown, ChevronRight, Reply, Filter } from "lucide-react";
import type { DocumentNote, NoteDocumentType, NoteVisibility } from "@/lib/supabase/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const VISIBILITY_CONFIG: Record<NoteVisibility, { label: string; color: string; bg: string }> = {
  operational:    { label: "Operational",    color: "#525a70", bg: "#f1efe9" },
  legal:          { label: "Legal",          color: "#7c3aed", bg: "#f5f3ff" },
  onboarding:     { label: "Onboarding",     color: "#0369a1", bg: "#f0f9ff" },
  billing:        { label: "Billing",        color: "#d97706", bg: "#fffbeb" },
  implementation: { label: "Implementation", color: "#16a34a", bg: "#f0fdf4" },
  escalation:     { label: "Escalation",     color: "#dc2626", bg: "#fef2f2" },
};

const VISIBILITY_OPTIONS = Object.entries(VISIBILITY_CONFIG) as [NoteVisibility, (typeof VISIBILITY_CONFIG)[NoteVisibility]][];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function authorName(note: DocumentNote) {
  if (!note.author) return "Unknown";
  return `${note.author.first_name} ${note.author.last_name}`.trim();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VisibilityBadge({ visibility }: { visibility: NoteVisibility }) {
  const cfg = VISIBILITY_CONFIG[visibility];
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

function NoteRow({
  note,
  depth = 0,
  onResolve,
  onPin,
  onReply,
}: {
  note: DocumentNote;
  depth?: number;
  onResolve: (id: string, resolved: boolean) => void;
  onPin: (id: string, pinned: boolean) => void;
  onReply: (parentId: string) => void;
}) {
  const [repliesOpen, setRepliesOpen] = useState(true);
  const hasReplies = (note.replies?.length ?? 0) > 0;

  return (
    <div className={cn("relative", depth > 0 && "ml-6 pl-4 border-l border-grid-300")}>
      <div
        className={cn(
          "rounded-lg border px-4 py-3 mb-2 transition-colors",
          note.is_pinned
            ? "border-highlight/30 bg-[rgba(47,158,154,0.04)]"
            : note.is_resolved
            ? "border-grid-300 bg-white opacity-60"
            : "border-grid-300 bg-white",
          !note.is_resolved && !note.is_pinned && "border-l-[3px] border-l-highlight/50",
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-semibold text-foreground">{authorName(note)}</span>
            <span className="text-[11px] text-muted-2 font-mono">{formatDateTime(note.created_at)}</span>
            {note.edited && (
              <span className="text-[10px] text-muted-2 italic">edited</span>
            )}
            <VisibilityBadge visibility={note.visibility} />
            {note.section_id && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-grid-300 text-[10px] font-mono text-muted-2">
                §{note.section_id}
              </span>
            )}
            {note.is_pinned && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-highlight font-semibold">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onPin(note.id, !note.is_pinned)}
              title={note.is_pinned ? "Unpin" : "Pin"}
              className={cn(
                "p-1 rounded transition-colors",
                note.is_pinned ? "text-highlight" : "text-muted-2 hover:text-foreground",
              )}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onResolve(note.id, !note.is_resolved)}
              title={note.is_resolved ? "Re-open" : "Resolve"}
              className={cn(
                "p-1 rounded transition-colors",
                note.is_resolved ? "text-green-600" : "text-muted-2 hover:text-foreground",
              )}
            >
              {note.is_resolved ? <CheckCircle className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            </button>
            {depth === 0 && (
              <button
                onClick={() => onReply(note.id)}
                title="Reply"
                className="p-1 rounded text-muted-2 hover:text-foreground transition-colors"
              >
                <Reply className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
      </div>

      {/* Replies toggle + thread */}
      {hasReplies && (
        <div className="mb-2">
          <button
            onClick={() => setRepliesOpen((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-muted-2 hover:text-foreground mb-1 ml-1 transition-colors"
          >
            {repliesOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {note.replies!.length} {note.replies!.length === 1 ? "reply" : "replies"}
          </button>
          {repliesOpen && note.replies!.map((r) => (
            <NoteRow key={r.id} note={r} depth={depth + 1} onResolve={onResolve} onPin={onPin} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Compose box ───────────────────────────────────────────────────────────────

function ComposeBox({
  onSubmit,
  onCancel,
  placeholder,
  isReply,
}: {
  onSubmit: (content: string, visibility: NoteVisibility) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  isReply?: boolean;
}) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<NoteVisibility>("operational");
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textRef.current?.focus(); }, []);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSubmitting(true);
    await onSubmit(content.trim(), visibility);
    setContent("");
    setSubmitting(false);
  }

  return (
    <div className={cn("rounded-lg border border-grid-300 bg-white", isReply && "ml-6")}>
      <textarea
        ref={textRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder ?? "Add a note…"}
        rows={3}
        className="w-full px-4 pt-3 pb-2 text-sm text-foreground bg-transparent resize-none focus:outline-none placeholder:text-muted-2"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
      />
      <div className="flex items-center justify-between px-3 pb-2 border-t border-grid-300 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="h-3 w-3 text-muted-2 shrink-0" />
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as NoteVisibility)}
            className="text-xs text-muted bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {VISIBILITY_OPTIONS.map(([v, cfg]) => (
              <option key={v} value={v}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button onClick={onCancel} className="text-xs text-muted-2 hover:text-foreground px-2 py-1">
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="px-3 py-1 rounded-md bg-highlight text-white text-xs font-medium disabled:opacity-40 transition-opacity"
          >
            {submitting ? "Saving…" : isReply ? "Reply" : "Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface InternalNotesProps {
  documentType: NoteDocumentType;
  documentId: string;
}

export default function InternalNotes({ documentType, documentId }: InternalNotesProps) {
  const [notes, setNotes] = useState<DocumentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<NoteVisibility | "all">("all");
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    fetch(`/api/notes?documentType=${documentType}&documentId=${documentId}`)
      .then((r) => r.json())
      .then((data) => { setNotes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [documentType, documentId]);

  async function addNote(content: string, visibility: NoteVisibility, parentId?: string) {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_type: documentType, document_id: documentId, content, visibility, parent_id: parentId }),
    });
    const created: DocumentNote = await res.json();

    if (parentId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === parentId ? { ...n, replies: [...(n.replies ?? []), created] } : n,
        ),
      );
    } else {
      setNotes((prev) => [...prev, { ...created, replies: [] }]);
    }
    setReplyingTo(null);
  }

  async function patchNote(id: string, patch: { is_resolved?: boolean; is_pinned?: boolean }) {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const updated: DocumentNote = await res.json();

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) return { ...updated, replies: n.replies };
        if (n.replies?.some((r) => r.id === id)) {
          return { ...n, replies: n.replies.map((r) => (r.id === id ? updated : r)) };
        }
        return n;
      }),
    );
  }

  const displayNotes = notes
    .filter((n) => showResolved || !n.is_resolved)
    .filter((n) => visibilityFilter === "all" || n.visibility === visibilityFilter);

  const pinnedNotes = displayNotes.filter((n) => n.is_pinned);
  const unpinnedNotes = displayNotes.filter((n) => !n.is_pinned);
  const resolvedCount = notes.filter((n) => n.is_resolved).length;

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <p className="label-mono">Internal Notes</p>
          {notes.length > 0 && (
            <span className="text-[11px] font-mono text-muted-2">{notes.length} total</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Visibility filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as NoteVisibility | "all")}
            className="text-xs text-muted bg-white border border-grid-300 rounded-md px-2 py-1 focus:outline-none"
          >
            <option value="all">All types</option>
            {VISIBILITY_OPTIONS.map(([v, cfg]) => (
              <option key={v} value={v}>{cfg.label}</option>
            ))}
          </select>
          {resolvedCount > 0 && (
            <button
              onClick={() => setShowResolved((v) => !v)}
              className="text-xs text-muted-2 hover:text-foreground transition-colors"
            >
              {showResolved ? "Hide resolved" : `Show resolved (${resolvedCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Compose */}
      <div className="mb-4">
        <ComposeBox
          onSubmit={(content, visibility) => addNote(content, visibility)}
          placeholder="Add an internal note — visible to admin and staff only…"
        />
      </div>

      {/* Notes list */}
      {loading ? (
        <p className="text-xs text-muted-2 py-4 text-center">Loading notes…</p>
      ) : displayNotes.length === 0 ? (
        <p className="text-xs text-muted-2 py-4 text-center">No notes yet.</p>
      ) : (
        <div>
          {pinnedNotes.map((n) => (
            <div key={n.id}>
              <NoteRow
                note={n}
                onResolve={(id, resolved) => patchNote(id, { is_resolved: resolved })}
                onPin={(id, pinned) => patchNote(id, { is_pinned: pinned })}
                onReply={(parentId) => setReplyingTo(parentId)}
              />
              {replyingTo === n.id && (
                <div className="mb-3">
                  <ComposeBox
                    isReply
                    onSubmit={(content, visibility) => addNote(content, visibility, n.id)}
                    onCancel={() => setReplyingTo(null)}
                    placeholder="Reply to this note…"
                  />
                </div>
              )}
            </div>
          ))}
          {unpinnedNotes.map((n) => (
            <div key={n.id}>
              <NoteRow
                note={n}
                onResolve={(id, resolved) => patchNote(id, { is_resolved: resolved })}
                onPin={(id, pinned) => patchNote(id, { is_pinned: pinned })}
                onReply={(parentId) => setReplyingTo(parentId)}
              />
              {replyingTo === n.id && (
                <div className="mb-3">
                  <ComposeBox
                    isReply
                    onSubmit={(content, visibility) => addNote(content, visibility, n.id)}
                    onCancel={() => setReplyingTo(null)}
                    placeholder="Reply to this note…"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
