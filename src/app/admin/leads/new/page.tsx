"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createLead } from "@/lib/supabase/queries/leads";
import type { LeadSource } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const sourceOptions: { value: LeadSource; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "outreach", label: "Outreach" },
  { value: "direct", label: "Direct" },
  { value: "social", label: "Social Media" },
  { value: "partnership", label: "Partnership" },
];

export default function NewLeadPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState<LeadSource>("direct");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const lead = await createLead(supabase, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        company: company.trim() || null,
        source,
        status: "new",
        notes: notes.trim() || null,
        service_interest: null,
        converted_to_client_id: null,
        metadata: null,
        rejected_at: null,
        cooling_period_until: null,
        questionnaire_token: null,
        token_expires_at: null,
        token_sent_at: null,
      });
      router.push(`/admin/leads/${lead.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/leads" className="text-muted-2 hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Add Lead</h1>
          <p className="text-sm text-muted-2 mt-0.5">Manually enter a new lead.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-xl border border-grid-300 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Contact Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Full Name <span className="text-error normal-case font-normal">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Ltd"
                className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Email <span className="text-error normal-case font-normal">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@acme.com"
                className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 900000"
                className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            </div>
          </div>
        </div>

        {/* Source */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Lead Source
          </label>
          <div className="flex flex-wrap gap-2">
            {sourceOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSource(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  source === opt.value
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
            placeholder="Context, referral details, initial conversation notes..."
            rows={5}
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-highlight text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Lead"}
          </button>
          <Link href="/admin/leads" className="text-sm text-muted-2 hover:text-foreground transition-colors px-4 py-2.5">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
