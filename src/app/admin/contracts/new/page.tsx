"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { listClients } from "@/lib/supabase/queries/clients";
import { createContract } from "@/lib/supabase/queries/contracts";
import type { Client } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface AppendixSlot {
  label: string;
  required: boolean;
}

export default function NewContractPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <NewContractForm />
    </Suspense>
  );
}

function NewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") || "";
  const { user } = useCurrentUser();

  const [clients, setClients] = useState<Client[] | undefined>(undefined);

  const [clientId, setClientId] = useState(preselectedClientId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [appendixSlots, setAppendixSlots] = useState<AppendixSlot[]>([
    { label: "Appendix A", required: true },
    { label: "Appendix B", required: false },
    { label: "Appendix C", required: false },
    { label: "Appendix D", required: false },
    { label: "Appendix E", required: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    listClients(supabase)
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  if (clients === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a contract title.");
      return;
    }
    if (!content.trim()) {
      setError("Please enter contract content.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const appendices = appendixSlots
        .filter((slot) => slot.label.trim())
        .map((slot, index) => ({
          slot: `slot_${index + 1}`,
          label: slot.label.trim(),
          required: slot.required,
          status: "empty" as const,
        }));

      const contract = await createContract(supabase, {
        client_id: clientId,
        title: title.trim(),
        content: content.trim(),
        version: 1,
        appendices: appendices.length > 0 ? appendices : null,
        created_by: user?.id || "",
        proposal_id: null,
        sections: null,
        client_signature: null,
        client_signed_at: null,
        client_signed_by: null,
        admin_signature: null,
        admin_signed_at: null,
        admin_signed_by: null,
        published_at: null,
        viewed_at: null,
        finalized_at: null,
      });

      router.push(`/admin/contracts/${contract.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contract");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSlotLabel = (index: number, label: string) => {
    setAppendixSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, label } : slot))
    );
  };

  const toggleSlotRequired = (index: number) => {
    setAppendixSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, required: !slot.required } : slot
      )
    );
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/contracts"
          className="text-muted-2 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Create Contract</h1>
          <p className="text-sm text-muted-2 mt-0.5">
            Draft a new contract for a client.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Client Select */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Client
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
          >
            <option value="">Select a client...</option>
            {(clients || []).map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name} ({client.contact_email})
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Contract Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Service Agreement - Company X"
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-highlight/30"
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Contract Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter the contract content here..."
            rows={16}
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30 font-mono"
          />
          <p className="text-xs text-muted-2 mt-2">
            HTML is supported for rich formatting.
          </p>
        </div>

        {/* Appendix Slots */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="block text-sm font-semibold text-foreground mb-4">
            Appendix Slots
          </label>
          <div className="space-y-3">
            {appendixSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-muted-2 w-6 shrink-0">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={slot.label}
                  onChange={(e) => updateSlotLabel(index, e.target.value)}
                  placeholder={`Appendix ${String.fromCharCode(65 + index)} label`}
                  className="flex-1 text-sm border border-grid-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-highlight/30"
                />
                <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slot.required}
                    onChange={() => toggleSlotRequired(index)}
                    className="rounded border-grid-500 text-highlight focus:ring-highlight"
                  />
                  <span className="text-xs text-muted-2">Required</span>
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-2 mt-3">
            Leave a label empty to skip that slot. Required appendices must be uploaded before contract finalization.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-highlight text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Contract"}
          </button>
          <Link
            href="/admin/contracts"
            className="text-sm text-muted-2 hover:text-foreground transition-colors px-4 py-2.5"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
