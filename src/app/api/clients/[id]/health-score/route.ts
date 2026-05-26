import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Score weights ─────────────────────────────────────────────────────────────

const WEIGHTS = {
  contractSigned:      25,
  invoicePaid:         20,
  questionnaireExists: 15,
  proposalApproved:    15,
  activityRecent:      15, // < 7 days
  activityMid:          5, // 7–30 days
  invoiceOverdue:      -20,
  changesRequested:    -10,
} as const;

// ─── Tier helper ───────────────────────────────────────────────────────────────

export function scoreTier(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "success" };
  if (score >= 60) return { label: "Good",      color: "warning" };
  if (score >= 40) return { label: "At Risk",   color: "orange" };
  return              { label: "Critical",   color: "error" };
}

// ─── Calculation ───────────────────────────────────────────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clientId } = await params;
  const supabase = createAdminClient();

  // Fetch client
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .select("id, questionnaire_id")
    .eq("id", clientId)
    .single();

  if (clientErr || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Fetch contracts, invoices, proposals, and latest activity in parallel
  const [contractsRes, invoicesRes, proposalsRes, activityRes] = await Promise.all([
    supabase
      .from("contracts")
      .select("status")
      .eq("client_id", clientId),
    supabase
      .from("invoices")
      .select("status")
      .eq("client_id", clientId),
    supabase
      .from("proposals")
      .select("status")
      .eq("client_id", clientId),
    supabase
      .from("activity_log")
      .select("created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const contracts  = contractsRes.data  ?? [];
  const invoices   = invoicesRes.data   ?? [];
  const proposals  = proposalsRes.data  ?? [];
  const lastActivity = activityRes.data?.[0] ?? null;

  let score = 0;

  // +25 — any contract fully signed/finalized
  if (contracts.some((c) => c.status === "countersigned" || c.status === "final")) {
    score += WEIGHTS.contractSigned;
  }

  // +20 — any invoice paid
  if (invoices.some((i) => i.status === "paid")) {
    score += WEIGHTS.invoicePaid;
  }

  // +15 — questionnaire linked (completed)
  if (client.questionnaire_id) {
    score += WEIGHTS.questionnaireExists;
  }

  // +15 — any proposal confirmed/approved
  if (proposals.some((p) => p.status === "confirmed" || p.status === "approved")) {
    score += WEIGHTS.proposalApproved;
  }

  // ± activity recency
  if (lastActivity) {
    const daysSince = (Date.now() - new Date(lastActivity.created_at).getTime()) / 86_400_000;
    if (daysSince < 7) {
      score += WEIGHTS.activityRecent;
    } else if (daysSince <= 30) {
      score += WEIGHTS.activityMid;
    }
    // > 30 days → 0 points
  }

  // −20 — any invoice overdue
  if (invoices.some((i) => i.status === "overdue")) {
    score += WEIGHTS.invoiceOverdue;
  }

  // −10 — any contract with changes requested
  if (contracts.some((c) => c.status === "changes_requested")) {
    score += WEIGHTS.changesRequested;
  }

  // Clamp to 0–100
  const finalScore = Math.max(0, Math.min(100, score));

  const { error: updateErr } = await supabase
    .from("clients")
    .update({
      health_score: finalScore,
      health_score_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }

  return NextResponse.json({ score: finalScore, tier: scoreTier(finalScore) });
}
