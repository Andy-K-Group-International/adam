import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateReadiness, parseRevenue, parseCompanySize11Plus } from "@/lib/readiness-score";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clientId } = await params;
  const supabase = createAdminClient();

  const [clientRes, contactsRes, kycRes, proposalsRes, contractsRes, requestsRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, questionnaire_id, website_url, strategy_type")
      .eq("id", clientId)
      .single(),
    supabase
      .from("contacts")
      .select("is_primary, phone")
      .eq("client_id", clientId),
    supabase
      .from("kyc_verifications")
      .select("status")
      .eq("client_id", clientId)
      .maybeSingle(),
    supabase
      .from("proposals")
      .select("sent_to_client_at, client_approved_at")
      .eq("client_id", clientId)
      .order("sent_to_client_at", { ascending: false })
      .limit(5),
    supabase
      .from("contracts")
      .select("published_at, viewed_at")
      .eq("client_id", clientId)
      .order("published_at", { ascending: false })
      .limit(5),
    supabase
      .from("client_requests")
      .select("created_at, status")
      .eq("client_id", clientId)
      .eq("status", "pending"),
  ]);

  if (clientRes.error || !clientRes.data) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const client = clientRes.data;
  const contacts = contactsRes.data ?? [];
  const kyc = kycRes.data;
  const proposals = proposalsRes.data ?? [];
  const contracts = contractsRes.data ?? [];
  const pendingRequests = requestsRes.data ?? [];

  let questionnaire: { annual_revenue: string | null; b2b_data: Record<string, unknown> | null; attachment_ids: string[] | null } | null = null;
  if (client.questionnaire_id) {
    const { data: qData } = await supabase
      .from("questionnaires")
      .select("annual_revenue, b2b_data, attachment_ids")
      .eq("id", client.questionnaire_id)
      .single();
    questionnaire = qData;
  }

  const primaryContact = contacts.find((c) => c.is_primary) ?? contacts[0] ?? null;

  // Responsiveness: null if no sent proposals/contracts, else boolean
  const sentProposals = proposals.filter((p) => p.sent_to_client_at);
  const respondedToProposalWithin48h: boolean | null = sentProposals.length === 0
    ? null
    : sentProposals.some((p) => {
        if (!p.client_approved_at) return false;
        const diff = new Date(p.client_approved_at).getTime() - new Date(p.sent_to_client_at!).getTime();
        return diff > 0 && diff < 48 * 60 * 60 * 1000;
      });

  const publishedContracts = contracts.filter((c) => c.published_at);
  const respondedToContractWithin48h: boolean | null = publishedContracts.length === 0
    ? null
    : publishedContracts.some((c) => {
        if (!c.viewed_at) return false;
        const diff = new Date(c.viewed_at).getTime() - new Date(c.published_at!).getTime();
        return diff > 0 && diff < 48 * 60 * 60 * 1000;
      });

  const hasPendingRequestsOlderThan7Days = pendingRequests.some((r) => {
    return Date.now() - new Date(r.created_at).getTime() > 7 * 24 * 60 * 60 * 1000;
  });

  const rawCompanySize = (questionnaire?.b2b_data as Record<string, unknown> | null)?.company_size as string | null ?? null;

  const result = calculateReadiness({
    hasQuestionnaire: !!client.questionnaire_id,
    kycVerified: kyc?.status === "verified",
    hasDocumentUploaded: Array.isArray(questionnaire?.attachment_ids) && (questionnaire!.attachment_ids?.length ?? 0) > 0,
    respondedToProposalWithin48h,
    respondedToContractWithin48h,
    hasPendingRequestsOlderThan7Days,
    hasWebsite: !!client.website_url,
    companySize11Plus: parseCompanySize11Plus(rawCompanySize),
    revenueAbove250k: parseRevenue(questionnaire?.annual_revenue) >= 250_000,
    contactCount: contacts.length,
    primaryContactHasPhone: !!(primaryContact?.phone),
    hasStrategyType: !!client.strategy_type,
  });

  const { error: updateErr } = await supabase
    .from("clients")
    .update({
      readiness_score: result.score,
      readiness_score_updated_at: new Date().toISOString(),
      readiness_breakdown: result.breakdown,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }

  return NextResponse.json(result);
}
