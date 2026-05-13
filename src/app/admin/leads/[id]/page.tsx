"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getLeadById, updateLead, convertLeadToClient } from "@/lib/supabase/queries/leads";
import type { Lead, LeadStatus, LeadSource } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft, Save, ArrowRight, User, Mail, Phone, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "rejected", label: "Rejected" },
  { value: "converted", label: "Converted" },
];

const sourceOptions: { value: LeadSource; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "outreach", label: "Outreach" },
  { value: "direct", label: "Direct" },
  { value: "social", label: "Social Media" },
  { value: "partnership", label: "Partnership" },
];

function statusStyle(status: LeadStatus): string {
  switch (status) {
    case "new":        return "bg-info/10 text-info";
    case "contacted":  return "bg-warning/10 text-warning";
    case "qualified":  return "bg-success/10 text-success";
    case "rejected":   return "bg-error/10 text-error";
    case "converted":  return "bg-success/10 text-success";
  }
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    getLeadById(supabase, leadId)
      .then((data) => {
        setLead(data);
        setNotes(data.notes || "");
        setStatus(data.status);
      })
      .catch(() => setLead(null));
  }, [leadId]);

  if (lead === undefined) return <LoadingSpinner className="min-h-[60vh]" />;
  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Lead not found.</p>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const updated = await updateLead(supabase, leadId, {
        notes: notes.trim() || null,
        status,
      });
      setLead(updated);
    } catch (err) {
      console.error("Failed to save lead:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const supabase = createClient();
      const client = await convertLeadToClient(supabase, leadId);
      router.push(`/admin/clients/${client.id}`);
    } catch (err) {
      console.error("Failed to convert lead:", err);
      setIsConverting(false);
    }
  };

  const sourceLabel = sourceOptions.find((s) => s.value === lead.source)?.label ?? lead.source;
  const canConvert = lead.status !== "converted" && lead.status !== "rejected";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/leads" className="text-muted-2 hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{lead.name}</h1>
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                statusStyle(lead.status)
              )}>
                {statusOptions.find((s) => s.value === lead.status)?.label}
              </span>
            </div>
            <p className="text-sm text-muted-2 mt-0.5">Added {formatDate(lead.created_at)}</p>
          </div>
        </div>
        {canConvert && (
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="inline-flex items-center gap-2 bg-highlight text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors disabled:opacity-50"
          >
            {isConverting ? "Converting..." : (
              <>Convert to Client <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        )}
        {lead.converted_to_client_id && (
          <Link
            href={`/admin/clients/${lead.converted_to_client_id}`}
            className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
          >
            View Client <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {/* Contact info */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-2 shrink-0" />
              <span className="text-sm text-foreground">{lead.name}</span>
            </div>
            {lead.company && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-2 shrink-0" />
                <span className="text-sm text-foreground">{lead.company}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-2 shrink-0" />
              <a href={`mailto:${lead.email}`} className="text-sm text-highlight hover:underline">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-2 shrink-0" />
                <span className="text-sm text-foreground">{lead.phone}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-grid-300">
            <span className="text-xs text-muted-2">Source: </span>
            <span className="text-xs font-medium text-foreground">{sourceLabel}</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  status === opt.value
                    ? "bg-highlight text-white border-highlight"
                    : "bg-white text-muted border-grid-500 hover:bg-grid-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Conversation notes, qualification details, follow-up actions..."
            rows={8}
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
          />
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-highlight text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/leads" className="text-sm text-muted-2 hover:text-foreground transition-colors px-4 py-2.5">
            Back to Leads
          </Link>
        </div>
      </div>
    </div>
  );
}
