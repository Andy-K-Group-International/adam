import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreTier } from "@/app/api/clients/[id]/health-score/route";

const WEIGHTS = {
  contractSigned:      25,
  invoicePaid:         20,
  questionnaireExists: 15,
  proposalApproved:    15,
  activityRecent:      15,
  activityMid:          5,
  invoiceOverdue:      -20,
  changesRequested:    -10,
} as const;

function cronAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token === process.env.CRON_SECRET;
}

async function calcScore(supabase: ReturnType<typeof createAdminClient>, clientId: string, questionnaireId: string | null): Promise<number> {
  const [contractsRes, invoicesRes, proposalsRes, activityRes] = await Promise.all([
    supabase.from("contracts").select("status").eq("client_id", clientId),
    supabase.from("invoices").select("status").eq("client_id", clientId),
    supabase.from("proposals").select("status").eq("client_id", clientId),
    supabase.from("activity_log").select("created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(1),
  ]);

  const contracts    = contractsRes.data  ?? [];
  const invoices     = invoicesRes.data   ?? [];
  const proposals    = proposalsRes.data  ?? [];
  const lastActivity = activityRes.data?.[0] ?? null;

  let score = 0;

  if (contracts.some((c: { status: string }) => c.status === "countersigned" || c.status === "final")) score += WEIGHTS.contractSigned;
  if (invoices.some((i: { status: string }) => i.status === "paid"))   score += WEIGHTS.invoicePaid;
  if (questionnaireId)                                                   score += WEIGHTS.questionnaireExists;
  if (proposals.some((p: { status: string }) => p.status === "confirmed" || p.status === "approved")) score += WEIGHTS.proposalApproved;

  if (lastActivity) {
    const daysSince = (Date.now() - new Date(lastActivity.created_at).getTime()) / 86_400_000;
    if (daysSince < 7)       score += WEIGHTS.activityRecent;
    else if (daysSince <= 30) score += WEIGHTS.activityMid;
  }

  if (invoices.some((i: { status: string }) => i.status === "overdue"))            score += WEIGHTS.invoiceOverdue;
  if (contracts.some((c: { status: string }) => c.status === "changes_requested")) score += WEIGHTS.changesRequested;

  return Math.max(0, Math.min(100, score));
}

export async function GET(req: NextRequest) {
  if (!cronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, questionnaire_id, health_score, company_name, contact_email, contact_name")
    .eq("archived", false)
    .in("stage", ["proposal", "strategy", "contract", "invoice", "kickoff", "active"]);

  if (clientsError) {
    console.error("[cron/health-scores] Failed to fetch clients:", clientsError.message);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }

  const atRisk: string[] = [];
  let updated = 0;
  const errors: string[] = [];

  for (const client of clients ?? []) {
    try {
      const newScore = await calcScore(supabase, client.id, client.questionnaire_id);
      const prevScore = client.health_score ?? newScore;
      const dropped = prevScore - newScore;

      const { error: updateErr } = await supabase
        .from("clients")
        .update({ health_score: newScore, health_score_updated_at: now, updated_at: now })
        .eq("id", client.id);

      if (updateErr) throw new Error(updateErr.message);

      updated++;

      if (newScore < 60 && dropped > 10) {
        atRisk.push(client.company_name);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cron/health-scores] Failed for client ${client.id} (${client.company_name}):`, msg);
      errors.push(`${client.company_name}: ${msg}`);
    }
  }

  // Send admin alert if any clients dropped below 60
  if (atRisk.length > 0) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Andy'K Group International LTD <info@andykgroup.com>",
          to: ["info@andykgroup.com"],
          subject: `⚠️ ${atRisk.length} client(s) dropped below health score 60`,
          text: `The following clients dropped more than 10 points and are now below 60:\n\n${atRisk.map((n) => `• ${n}`).join("\n")}\n\nReview at: https://adam.andykgroup.com/admin`,
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    status: errors.length === 0 ? "ok" : "partial",
    timestamp: now,
    updated,
    at_risk: atRisk,
    errors: errors.length > 0 ? errors : undefined,
  });
}
