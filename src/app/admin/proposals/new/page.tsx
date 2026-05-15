"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { listClients, getClientById } from "@/lib/supabase/queries/clients";
import { listQuestionnaires } from "@/lib/supabase/queries/questionnaires";
import { createProposal, generateProposalRef } from "@/lib/supabase/queries/proposals";
import { buildDefaultSections, buildAboutYouContent, defaultInvestment } from "@/lib/proposal-content";
import type { Client, Questionnaire, StrategyType } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function NewProposalPage() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const [clients, setClients] = useState<Client[] | undefined>(undefined);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);

  const [clientId, setClientId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      listClients(supabase),
      listQuestionnaires(supabase, { status: "submitted" }).catch(() => [] as Questionnaire[]),
    ]).then(([c, q]) => {
      setClients(c);
      setQuestionnaires(q);
    }).catch(() => setClients([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!clientId) { setError("Please select a client."); return; }
    if (!user) { setError("Not authenticated."); return; }

    setIsSubmitting(true);
    try {
      const supabase = createClient();

      const client = await getClientById(supabase, clientId);
      const serviceType: StrategyType = (client.strategy_type as StrategyType) ?? "b2b";

      // Find linked questionnaire
      const linkedQ = questionnaires.find((q) => q.converted_to_client_id === clientId)
        ?? questionnaires.find((q) => q.contact_email === client.contact_email);

      let aboutYouContent = "";
      if (linkedQ) {
        aboutYouContent = buildAboutYouContent({
          company_name: linkedQ.company_name,
          business_goals: linkedQ.business_goals,
          challenges: linkedQ.challenges,
          usp: linkedQ.usp,
          countries_of_operation: linkedQ.countries_of_operation,
          products_services: linkedQ.products_services,
          years_in_business: linkedQ.years_in_business,
          annual_revenue: linkedQ.annual_revenue,
        });
      } else {
        aboutYouContent = buildAboutYouContent({
          company_name: client.company_name,
          business_goals: "",
          challenges: "",
          usp: "",
          countries_of_operation: "",
        });
      }

      const sections = buildDefaultSections(serviceType, aboutYouContent);
      const proposalRef = await generateProposalRef(supabase, clientId);
      const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const proposal = await createProposal(supabase, {
        client_id: clientId,
        questionnaire_id: linkedQ?.id ?? "",
        template_id: null,
        title: `Proposal — ${client.company_name}`,
        proposal_ref: proposalRef,
        valid_until: validUntil,
        service_type: serviceType,
        commercials_locked: false,
        addons: defaultInvestment(),
        status: "draft",
        sections: sections.map(({ locked: _locked, ...s }) => s),
        ai_evaluation: null,
        admin_notes: adminNotes.trim() || null,
        client_comment: null,
        approved_by_admin_at: null,
        sent_to_client_at: null,
        client_approved_at: null,
        contract_id: null,
      });

      router.push(`/admin/proposals/${proposal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (clients === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/proposals" className="text-muted-2 hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-serif font-semibold text-foreground">New Proposal</h1>
          <p className="text-sm text-muted-2 mt-0.5">Select a client — sections are auto-generated from their profile.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-error/8 border border-error/20 text-error text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="bg-white rounded-xl border border-grid-300 p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Client <span className="text-error">*</span>
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30"
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} {c.client_ref ? `· ${c.client_ref}` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-2 mt-2">
              The proposal title, reference, and sections are auto-generated. All sections can be edited after creation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes — not visible to the client."
              rows={3}
              className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-highlight/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !clientId}
            className="relative inline-flex items-center justify-center h-10 px-6 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
          >
            <span className="relative z-10">{isSubmitting ? "Creating…" : "Create Proposal"}</span>
          </button>
          <Link href="/admin/proposals" className="text-sm text-muted-2 hover:text-foreground transition-colors px-4 py-2.5">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
