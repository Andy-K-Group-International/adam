"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Local admin check, matching the per-file convention already used in
// sellers.ts (and founding-codes/launch-invite routes) rather than a shared
// helper — this codebase doesn't centralize this check across files.
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .maybeSingle();

  return data?.role === "admin" ? user : null;
}

// ─── Referral lookup for the activation flow ────────────────────────────────
//
// Runs entirely on the admin client, not the request-scoped one — `sellers`
// and `commissions` deliberately have no admin/staff RLS policy (see the
// Phase A self-review: RLS policies scope by row and this project's default
// grants give `authenticated` full column-level access, so every admin-side
// read/write here goes through server actions with the service role instead
// of adding a broad new policy surface just to let the browser client read
// these tables directly).

export interface ClientReferralInfo {
  sellerId: string;
  leadId: string;
  referralCode: string;
  commissionRate: number;
}

export async function getReferralInfoForClient(
  clientId: string
): Promise<ClientReferralInfo | null> {
  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, referred_by_seller_id")
    .eq("converted_to_client_id", clientId)
    .not("referred_by_seller_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (leadError) {
    console.error("[getReferralInfoForClient] lead lookup error:", leadError.message);
    return null;
  }
  if (!lead?.referred_by_seller_id) return null;

  const { data: seller, error: sellerError } = await supabase
    .from("sellers")
    .select("id, referral_code, commission_rate")
    .eq("id", lead.referred_by_seller_id)
    .maybeSingle();

  if (sellerError) {
    console.error("[getReferralInfoForClient] seller lookup error:", sellerError.message);
    return null;
  }
  if (!seller) return null;

  return {
    sellerId: seller.id,
    leadId: lead.id,
    referralCode: seller.referral_code,
    commissionRate: seller.commission_rate,
  };
}

// ─── Commission creation on subscription activation ─────────────────────────
//
// Called from BillingTab.handleActivate() *after* clients.subscription_status
// has already been set to 'active' — this must never be able to block or
// fail that update. The caller wraps this call in its own try/catch on top
// of the try/catch here, matching the defensive pattern in
// activateCompanyAction and the registerSeller rollback fix: errors are
// logged explicitly, never silently swallowed, but never thrown back into
// the activation flow either.
//
// Attribution (seller, lead) is re-derived from clientId server-side, not
// accepted from the caller — the only client-confirmed input trusted here is
// dealValue, which is exactly the number a human already had to type in.

export async function createCommissionForActivation(input: {
  clientId: string;
  dealValue: number;
}): Promise<{ success: true } | { error: string }> {
  try {
    if (!input.dealValue || input.dealValue <= 0) {
      return { error: "Deal value must be greater than 0." };
    }

    const referral = await getReferralInfoForClient(input.clientId);
    if (!referral) {
      return { error: "No seller referral found for this client." };
    }

    const commissionAmount = Math.round(input.dealValue * (referral.commissionRate / 100) * 100) / 100;

    const supabase = createAdminClient();
    const { error: insertError } = await supabase.from("commissions").insert({
      seller_id: referral.sellerId,
      client_id: input.clientId,
      lead_id: referral.leadId,
      deal_value: input.dealValue,
      commission_amount: commissionAmount,
      status: "pending",
      trigger_event: "subscription_activated",
    });

    if (insertError) {
      console.error("[createCommissionForActivation] insert error:", insertError.message);
      return { error: insertError.message };
    }

    const { error: logError } = await supabase.from("activity_log").insert({
      type: "commission_created",
      client_id: input.clientId,
      metadata: {
        seller_id: referral.sellerId,
        lead_id: referral.leadId,
        deal_value: input.dealValue,
        commission_amount: commissionAmount,
      },
    });
    if (logError) {
      console.error("[createCommissionForActivation] activity_log insert error:", logError.message);
    }

    return { success: true };
  } catch (err) {
    console.error("[createCommissionForActivation] unexpected error:", err);
    return { error: err instanceof Error ? err.message : "Unknown error creating commission." };
  }
}

// ─── Admin: list + review commissions ───────────────────────────────────────

export interface CommissionRow {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_referral_code: string;
  client_id: string;
  client_company_name: string;
  deal_value: number;
  commission_amount: number;
  status: "pending" | "approved" | "paid" | "disputed";
  trigger_event: string;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
}

export async function listCommissions(
  statusFilter?: "pending" | "approved" | "paid" | "disputed"
): Promise<CommissionRow[]> {
  const admin = await requireAdmin();
  if (!admin) return [];

  const supabase = createAdminClient();
  let query = supabase
    .from("commissions")
    .select(
      "id, seller_id, client_id, deal_value, commission_amount, status, trigger_event, created_at, approved_at, paid_at, sellers(full_name, referral_code), clients(company_name)"
    )
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[listCommissions] query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const seller = row.sellers as unknown as { full_name: string; referral_code: string } | null;
    const client = row.clients as unknown as { company_name: string } | null;
    return {
      id: row.id,
      seller_id: row.seller_id,
      seller_name: seller?.full_name ?? "Unknown seller",
      seller_referral_code: seller?.referral_code ?? "—",
      client_id: row.client_id,
      client_company_name: client?.company_name ?? "Unknown client",
      deal_value: row.deal_value,
      commission_amount: row.commission_amount,
      status: row.status,
      trigger_event: row.trigger_event,
      created_at: row.created_at,
      approved_at: row.approved_at,
      paid_at: row.paid_at,
    };
  });
}

export async function approveCommission(
  commissionId: string
): Promise<{ success: true } | { error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminClient();

  const { data: commission, error: fetchError } = await supabase
    .from("commissions")
    .select("id, status")
    .eq("id", commissionId)
    .maybeSingle();

  if (fetchError || !commission) return { error: "Commission not found." };
  if (commission.status !== "pending") {
    return { error: `Cannot approve a commission with status '${commission.status}'.` };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("commissions")
    .update({ status: "approved", approved_at: now, approved_by: admin.id })
    .eq("id", commissionId);

  if (updateError) {
    console.error("[approveCommission] update error:", updateError.message);
    return { error: "Failed to approve commission." };
  }

  const { error: logError } = await supabase.from("activity_log").insert({
    type: "commission_approved",
    actor_id: admin.id,
    metadata: { commission_id: commissionId },
  });
  if (logError) console.error("[approveCommission] activity_log insert error:", logError.message);

  return { success: true };
}

// Payments are never automated in this app (same rule as invoices, Revolut
// activation, etc.) — this only records that an admin has already sent the
// payment manually via Revolut. The explicit-confirmation step lives in the
// UI (a modal the admin must read and confirm before this is called), not as
// a "confirmed" flag passed to this action — admins already have full DB
// access via the service role elsewhere in this app, so a passed-in boolean
// would be a no-op safeguard; the point of the modal is to prevent an
// accidental click turning real money into "paid" in the system, not to
// defend against a malicious admin.
export async function markCommissionPaid(
  commissionId: string
): Promise<{ success: true } | { error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminClient();

  const { data: commission, error: fetchError } = await supabase
    .from("commissions")
    .select("id, status")
    .eq("id", commissionId)
    .maybeSingle();

  if (fetchError || !commission) return { error: "Commission not found." };
  if (commission.status !== "approved") {
    return { error: `Cannot mark as paid — commission status is '${commission.status}', not 'approved'.` };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("commissions")
    .update({ status: "paid", paid_at: now, paid_by: admin.id })
    .eq("id", commissionId);

  if (updateError) {
    console.error("[markCommissionPaid] update error:", updateError.message);
    return { error: "Failed to mark commission as paid." };
  }

  const { error: logError } = await supabase.from("activity_log").insert({
    type: "commission_paid",
    actor_id: admin.id,
    metadata: { commission_id: commissionId },
  });
  if (logError) console.error("[markCommissionPaid] activity_log insert error:", logError.message);

  return { success: true };
}
