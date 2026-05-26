"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
} from "@/lib/supabase/queries/contacts";
import type { Contact, ContactRole } from "@/lib/supabase/types";
import { Plus, Pencil, Trash2, Star, Phone, Mail, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLES: { value: ContactRole; label: string; color: string }[] = [
  { value: "primary",    label: "Primary",    color: "bg-highlight/10 text-highlight" },
  { value: "billing",    label: "Billing",    color: "bg-info/10 text-info" },
  { value: "legal",      label: "Legal",      color: "bg-warning/10 text-warning" },
  { value: "operations", label: "Operations", color: "bg-success/10 text-success" },
  { value: "signatory",  label: "Signatory",  color: "bg-grid-500 text-foreground" },
];

function RoleBadge({ role }: { role: ContactRole }) {
  const cfg = ROLES.find((r) => r.value === role) ?? ROLES[0];
  return (
    <span className={cn("text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider", cfg.color)}>
      {cfg.label}
    </span>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  role: ContactRole;
  is_primary: boolean;
  notes: string;
}

const emptyForm = (): FormState => ({
  name: "",
  email: "",
  phone: "",
  job_title: "",
  role: "primary",
  is_primary: false,
  notes: "",
});

function ContactForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormState;
  onSave: (f: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (k: keyof FormState, v: string | boolean | ContactRole) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="bg-white rounded-xl border border-grid-300 p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-mono block mb-1.5">Name *</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Smith"
            className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
          />
        </div>
        <div>
          <label className="label-mono block mb-1.5">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@company.com"
            className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
          />
        </div>
        <div>
          <label className="label-mono block mb-1.5">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+44 7700 900000"
            className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
          />
        </div>
        <div>
          <label className="label-mono block mb-1.5">Job Title</label>
          <input
            value={form.job_title}
            onChange={(e) => set("job_title", e.target.value)}
            placeholder="Chief Financial Officer"
            className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
          />
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="label-mono block mb-2">Role *</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => set("role", r.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                form.role === r.value
                  ? "bg-highlight text-white border-highlight"
                  : "bg-white text-muted border-grid-500 hover:bg-grid-300"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_primary}
          onChange={(e) => set("is_primary", e.target.checked)}
          className="h-4 w-4 rounded border-grid-500 accent-highlight"
        />
        <span className="text-sm text-foreground">Set as primary contact</span>
        <Star className="h-3.5 w-3.5 text-warning" />
      </label>

      {/* Notes */}
      <div>
        <label className="label-mono block mb-1.5">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="Optional context…"
          className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name.trim() || !form.email.trim()}
          className="relative inline-flex items-center justify-center gap-2 h-9 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Contact"}
        </button>
        <button
          onClick={onCancel}
          className="h-9 px-4 text-sm text-muted-2 hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Contact card ─────────────────────────────────────────────────────────────

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-grid-300 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{contact.name}</span>
            {contact.is_primary && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning uppercase tracking-wider">
                <Star className="h-2.5 w-2.5" />
                Primary
              </span>
            )}
            <RoleBadge role={contact.role} />
          </div>

          <div className="space-y-1">
            {contact.job_title && (
              <div className="flex items-center gap-2 text-xs text-muted-2">
                <Briefcase className="h-3 w-3 shrink-0" />
                <span>{contact.job_title}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted">
              <Mail className="h-3 w-3 shrink-0" />
              <a href={`mailto:${contact.email}`} className="hover:text-highlight transition-colors truncate">
                {contact.email}
              </a>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Phone className="h-3 w-3 shrink-0" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.notes && (
              <p className="text-xs text-muted-2 mt-1.5 italic">{contact.notes}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-2 hover:text-foreground hover:bg-grid-300 transition-colors"
            title="Edit contact"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDelete}
                className="h-8 px-2 rounded-lg text-xs font-medium text-white bg-error hover:bg-error/90 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="h-8 px-2 rounded-lg text-xs text-muted-2 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-2 hover:text-error hover:bg-error/10 transition-colors"
              title="Delete contact"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export default function ContactsTab({ clientId }: { clientId: string }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    listContacts(supabase, clientId)
      .then(setContacts)
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, [clientId]);

  const handleAdd = async (form: FormState) => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const contact = await createContact(supabase, {
        client_id: clientId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        job_title: form.job_title.trim() || null,
        role: form.role,
        is_primary: form.is_primary,
        notes: form.notes.trim() || null,
      });
      // If new contact is primary, clear primary flag on others in local state
      setContacts((prev) => [
        ...(form.is_primary ? prev.map((c) => ({ ...c, is_primary: false })) : prev),
        contact,
      ]);
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, form: FormState) => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const updated = await updateContact(supabase, id, clientId, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        job_title: form.job_title.trim() || null,
        role: form.role,
        is_primary: form.is_primary,
        notes: form.notes.trim() || null,
      });
      setContacts((prev) =>
        prev.map((c) =>
          c.id === id
            ? updated
            : form.is_primary
            ? { ...c, is_primary: false }
            : c
        )
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contact");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      await deleteContact(supabase, id, clientId);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-2 py-8 text-center">Loading contacts…</div>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Smart routing hint */}
      <div className="rounded-lg bg-grid-300/40 border border-grid-300 px-4 py-3">
        <p className="text-xs text-muted leading-relaxed font-mono">
          <strong className="text-foreground">Smart routing:</strong>{" "}
          invoices → billing contact · contracts → signatory contact · general → primary contact.
          Falls back to primary, then to the client record.
        </p>
      </div>

      {/* Contacts list */}
      {contacts.length === 0 && !showAdd ? (
        <div className="bg-white rounded-xl border border-grid-300 p-8 text-center">
          <p className="text-sm text-muted-2 mb-4">No contacts added yet.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="relative inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium text-foreground btn-primary-gradient"
          >
            <Plus className="h-4 w-4" />
            Add First Contact
          </button>
        </div>
      ) : (
        <>
          {contacts.map((contact) =>
            editingId === contact.id ? (
              <ContactForm
                key={contact.id}
                initial={{
                  name: contact.name,
                  email: contact.email,
                  phone: contact.phone ?? "",
                  job_title: contact.job_title ?? "",
                  role: contact.role,
                  is_primary: contact.is_primary,
                  notes: contact.notes ?? "",
                }}
                onSave={(form) => handleUpdate(contact.id, form)}
                onCancel={() => setEditingId(null)}
                saving={saving}
              />
            ) : (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={() => {
                  setShowAdd(false);
                  setEditingId(contact.id);
                }}
                onDelete={() => handleDelete(contact.id)}
              />
            )
          )}
        </>
      )}

      {/* Add form or button */}
      {showAdd ? (
        <ContactForm
          initial={emptyForm()}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          saving={saving}
        />
      ) : contacts.length > 0 && !editingId ? (
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-grid-500 text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      ) : null}
    </div>
  );
}
