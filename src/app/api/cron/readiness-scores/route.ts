import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateReadiness, parseRevenue, parseCompanySize11Plus } from "@/lib/readiness-score";

function cronAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token === process.env.CRON_SECRET;
}

async function calcReadiness(
  supabase: ReturnType<typeof createAdminClient>,
  clientId: string,
  questionnaireId: string | null,
  websiteUrl: string | null,
  strategyType: string | null,
) {
  const [contactsRes, kycRes, proposalsRes, contractsRes, requestsRes] = await Promise.all([
    supabase.from("contacts").select("is_primary, phone").eq("client_id", clientId),
    supabase.from("kyc_verifications").select("status").eq("client_id", clientId).maybeSingle(),
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

  const contacts       = contactsRes.data  ?? [];
  const kyc            = kycRes.data;
  const proposals      = proposalsRes.data ?? [];
  const contracts      = contractsRes.data ?? [];
  const pendingRequests = requestsRes.data ?? [];

  let questionnaire: { annual_revenue: string | null; b2b_data: Record<string, unknown> | null; attachment_ids: string[] | null } | null = null;
  if (questionnaireId) {
    const { data: qData } = await supabase
      .from("questionnaires")
      .select("annual_revenue, b2b_data, attachment_ids")
      .eq("id", questionnaireId)
      .single();
    questionnaire = qData;
  }

  const primaryContact = contacts.find((c) => c.is_primary) ?? contacts[0] ?? null;

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

  const hasPendingRequestsOlderThan7Days = pendingRequests.some(
    (r) => Date.now() - new Date(r.created_at).getTime() > 7 * 24 * 60 * 60 * 1000,
  );

  const rawCompanySize = (questionnaire?.b2b_data as Record<string, unknown> | null)?.company_size as string | null ?? null;

  return calculateReadiness({
    hasQuestionnaire:              !!questionnaireId,
    kycVerified:                   kyc?.status === "verified",
    hasDocumentUploaded:           Array.isArray(questionnaire?.attachment_ids) && (questionnaire!.attachment_ids?.length ?? 0) > 0,
    respondedToProposalWithin48h,
    respondedToContractWithin48h,
    hasPendingRequestsOlderThan7Days,
    hasWebsite:                    !!websiteUrl,
    companySize11Plus:             parseCompanySize11Plus(rawCompanySize),
    revenueAbove250k:              parseRevenue(questionnaire?.annual_revenue) >= 250_000,
    contactCount:                  contacts.length,
    primaryContactHasPhone:        !!(primaryContact?.phone),
    hasStrategyType:               !!strategyType,
  });
}

export async function GET(req: NextRequest) {
  if (!cronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, questionnaire_id, website_url, strategy_type, company_name")
    .eq("archived", false)
    .in("stage", ["proposal", "strategy", "contract", "invoice", "kickoff", "active"]);

  if (clientsError) {
    console.error("[cron/readiness-scores] Failed to fetch clients:", clientsError.message);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }

  let updated = 0;
  const errors: string[] = [];

  for (const client of clients ?? []) {
    try {
      const result = await calcReadiness(
        supabase,
        client.id,
        client.questionnaire_id,
        client.website_url,
        client.strategy_type,
      );

      const { error: updateErr } = await supabase
        .from("clients")
        .update({
          readiness_score:            result.score,
          readiness_breakdown:        result.breakdown,
          readiness_score_updated_at: now,
          updated_at:                 now,
        })
        .eq("id", client.id);

      if (updateErr) throw new Error(updateErr.message);

      updated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cron/readiness-scores] Failed for client ${client.id} (${client.company_name}):`, msg);
      errors.push(`${client.company_name}: ${msg}`);
    }
  }

  return NextResponse.json({
    status: errors.length === 0 ? "ok" : "partial",
    timestamp: now,
    updated,
    errors: errors.length > 0 ? errors : undefined,
  });
}
