"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendSellerInvitation } from "@/app/actions/email";

const REFERRAL_CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateReferralCode(): string {
  const chars = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => REFERRAL_CODE_CHARSET[b % REFERRAL_CODE_CHARSET.length])
    .join("");
  return `SELLER-${chars}`;
}

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

// ─── Admin: list sellers ────────────────────────────────────────────────────

export interface SellerRow {
  id: string;
  full_name: string;
  email: string;
  referral_code: string;
  status: "invited" | "pending_nda" | "active" | "suspended";
  commission_rate: number;
  invited_by: string;
  invited_at: string;
  registered_at: string | null;
  activated_at: string | null;
  leadCount: number;
  // Sum of commission_amount across all non-disputed commissions (pending +
  // approved + paid) — total value in their commission pipeline, not just
  // what's been paid out. Disputed commissions are excluded since they're
  // contested, not confirmed.
  totalCommissions: number;
}

export async function listSellers(): Promise<SellerRow[]> {
  const admin = await requireAdmin();
  if (!admin) return [];

  const supabase = createAdminClient();
  const { data: sellers, error } = await supabase
    .from("sellers")
    .select(
      "id, full_name, email, referral_code, status, commission_rate, invited_by, invited_at, registered_at, activated_at"
    )
    .order("invited_at", { ascending: false });

  if (error) {
    console.error("listSellers error:", error);
    return [];
  }
  if (!sellers || sellers.length === 0) return [];

  // Aggregated in JS from flat selects rather than a SQL GROUP BY, matching
  // the existing convention for admin list pages in this codebase (e.g. the
  // kycMap-building pattern in admin/page.tsx / super-admin/companies).
  const sellerIds = sellers.map((s) => s.id);
  const [{ data: leads, error: leadsError }, { data: commissions, error: commissionsError }] =
    await Promise.all([
      supabase.from("leads").select("referred_by_seller_id").in("referred_by_seller_id", sellerIds),
      supabase.from("commissions").select("seller_id, commission_amount, status").in("seller_id", sellerIds),
    ]);

  if (leadsError) console.error("[listSellers] leads query error:", leadsError.message);
  if (commissionsError) console.error("[listSellers] commissions query error:", commissionsError.message);

  const leadCounts = new Map<string, number>();
  for (const lead of leads ?? []) {
    if (!lead.referred_by_seller_id) continue;
    leadCounts.set(lead.referred_by_seller_id, (leadCounts.get(lead.referred_by_seller_id) ?? 0) + 1);
  }

  const commissionTotals = new Map<string, number>();
  for (const c of commissions ?? []) {
    if (c.status === "disputed") continue;
    commissionTotals.set(c.seller_id, (commissionTotals.get(c.seller_id) ?? 0) + c.commission_amount);
  }

  return sellers.map((s) => ({
    ...s,
    leadCount: leadCounts.get(s.id) ?? 0,
    totalCommissions: commissionTotals.get(s.id) ?? 0,
  }));
}

// ─── Admin: suspend a seller ─────────────────────────────────────────────────
//
// The first code path that actually sets status = 'suspended' — before this,
// the value was schema-legal (check constraint, get_my_seller_id() already
// filters on status = 'active') but nothing ever wrote it. Effect, verified
// against what Phase A already built rather than assumed:
//   - Dashboard access: src/app/seller/layout.tsx redirects status ===
//     'suspended' to /seller-agreement (which renders the suspended message
//     for that status) — sellers_select_own RLS has no status check by
//     design (the layout needs to read status for *any* seller to decide
//     where to redirect them), so the guard is the enforcement point, not
//     the policy.
//   - Existing leads/commissions visibility: leads_seller_select_own and
//     commissions_seller_select_own both gate through get_my_seller_id(),
//     which only resolves for status = 'active' — a suspended seller loses
//     read access to their own previously-referred leads/commissions
//     immediately, even via a direct API call bypassing the UI.
//   - New referral attribution: /api/leads/submit's seller lookup requires
//     status = 'active', so a suspended seller's referral link silently
//     stops attributing new leads.
export async function suspendSeller(sellerId: string): Promise<{ success: true } | { error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminClient();

  const { data: seller, error: fetchError } = await supabase
    .from("sellers")
    .select("id, status")
    .eq("id", sellerId)
    .maybeSingle();

  if (fetchError || !seller) return { error: "Seller not found." };
  if (seller.status === "suspended") return { error: "Seller is already suspended." };

  const { error: updateError } = await supabase
    .from("sellers")
    .update({ status: "suspended", updated_at: new Date().toISOString() })
    .eq("id", sellerId);

  if (updateError) {
    console.error("[suspendSeller] update error:", updateError.message);
    return { error: "Failed to suspend seller." };
  }

  const { error: logError } = await supabase.from("activity_log").insert({
    type: "seller_suspended",
    actor_id: admin.id,
    metadata: { seller_id: sellerId },
  });
  if (logError) console.error("[suspendSeller] activity_log insert error:", logError.message);

  return { success: true };
}

// ─── Admin: invite a seller ─────────────────────────────────────────────────

export interface InviteSellerInput {
  email: string;
  fullName: string;
  commissionRate?: number;
  invitedBy: string;
}

export async function inviteSeller(
  input: InviteSellerInput
): Promise<{ success: true } | { error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized" };

  const email = input.email?.trim().toLowerCase();
  const fullName = input.fullName?.trim();
  const invitedBy = input.invitedBy?.trim();
  const commissionRate = input.commissionRate ?? 10;

  if (!email) return { error: "Email is required." };
  if (!fullName) return { error: "Full name is required." };
  if (!invitedBy) return { error: "Missing inviter name." };
  if (commissionRate < 0 || commissionRate > 100) {
    return { error: "Commission rate must be between 0 and 100." };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("sellers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { error: "A seller invite for this email already exists." };
  }

  // Generate unique referral code (retry on collision), same pattern as
  // founding_codes generation.
  let referralCode = generateReferralCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: collision } = await supabase
      .from("sellers")
      .select("id")
      .eq("referral_code", referralCode)
      .maybeSingle();
    if (!collision) break;
    referralCode = generateReferralCode();
    attempts++;
  }

  const registrationToken = crypto.randomUUID();
  const tokenExpiresAt = new Date();
  tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7);

  const { error: insertError } = await supabase.from("sellers").insert({
    full_name: fullName,
    email,
    referral_code: referralCode,
    status: "invited",
    commission_rate: commissionRate,
    invited_by: invitedBy,
    registration_token: registrationToken,
    registration_token_expires_at: tokenExpiresAt.toISOString(),
  });

  if (insertError) {
    console.error("inviteSeller insert error:", insertError);
    return { error: "Failed to create seller invite." };
  }

  const registerUrl = `https://adam.andykgroup.com/seller-register?${new URLSearchParams({
    token: registrationToken,
    name: fullName,
    email,
  }).toString()}`;

  const sent = await sendSellerInvitation({
    fullName,
    email,
    invitedByName: invitedBy,
    registerUrl,
  });

  if (!sent) {
    return { error: "Seller invite saved, but the invitation email failed to send." };
  }

  return { success: true };
}

// ─── Public: complete registration from an invite token ────────────────────
//
// The seller sets their own permanent password here (unlike the admin-issued
// temp-password flow in convertLeadToClientAction), so account_status is set
// straight to 'active' — there's no forced "change your temp password" step
// to gate on. sellers.status moves 'invited' -> 'pending_nda'; the NDA +
// agreement step (piece 3) takes it to 'active'.

export async function registerSeller(input: {
  token: string;
  password: string;
}): Promise<{ success: true } | { error: string }> {
  const token = input.token?.trim();
  const password = input.password;

  if (!token) return { error: "Missing registration token." };
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const adminClient = createAdminClient();

  const { data: seller, error: sellerError } = await adminClient
    .from("sellers")
    .select("id, full_name, email, status, registration_token_expires_at")
    .eq("registration_token", token)
    .maybeSingle();

  if (sellerError || !seller) {
    return { error: "Invalid or expired registration link." };
  }
  if (seller.status !== "invited") {
    return { error: "This registration link has already been used." };
  }
  if (
    seller.registration_token_expires_at &&
    new Date(seller.registration_token_expires_at) < new Date()
  ) {
    return { error: "This registration link has expired. Please ask us for a new invite." };
  }

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: seller.email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error("[registerSeller] createUser error:", authError?.message);
    return { error: "Failed to create your account. Please try again or contact us." };
  }

  const nameParts = seller.full_name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || firstName;
  const now = new Date().toISOString();

  // Rollback: delete the just-created auth user on failure, same chain as
  // activateCompanyAction (companies.ts). Without this, a transient failure
  // here permanently soft-locks the invite — sellers.status stays 'invited'
  // so the seller can retry, but retrying calls createUser with the same
  // email again, which now always fails since the orphaned auth user from
  // the first attempt already claimed it. Deleting it makes the token
  // genuinely retryable.
  const { error: usersError } = await adminClient.from("users").insert({
    auth_id: authData.user.id,
    email: seller.email,
    first_name: firstName,
    last_name: lastName,
    image_url: null,
    role: "seller",
    client_id: null,
    account_status: "active",
    created_at: now,
    updated_at: now,
  });

  if (usersError) {
    console.error("[registerSeller] users insert error:", usersError.message);
    const { error: rollbackAuthErr } = await adminClient.auth.admin.deleteUser(authData.user.id);
    if (rollbackAuthErr) {
      console.error(
        "[registerSeller] rollback failed: orphaned auth user",
        authData.user.id,
        rollbackAuthErr.message
      );
    }
    return { error: "Failed to finish setting up your account. Please try again or contact us." };
  }

  await adminClient
    .from("sellers")
    .update({
      auth_id: authData.user.id,
      status: "pending_nda",
      registered_at: now,
      registration_token: null,
      registration_token_expires_at: null,
      updated_at: now,
    })
    .eq("id", seller.id);

  await adminClient.from("activity_log").insert({
    type: "seller_registered",
    actor_id: authData.user.id,
    metadata: { seller_id: seller.id, email: seller.email },
  });

  // Establish a session (cookie-aware client, not the admin client) so the
  // seller lands on the agreement step already signed in.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: seller.email,
    password,
  });

  if (signInError) {
    console.error("[registerSeller] sign-in error:", signInError.message);
    return { error: "Account created, but automatic sign-in failed. Please sign in manually." };
  }

  return { success: true };
}

// ─── Seller Partner Agreement + NDA acceptance ──────────────────────────────
//
// Reuses the shared nda_signatures table exactly like the demo NDA flow —
// the FK from sellers.nda_signature_id enforces the same guarantee
// (activation cannot happen without a real signature) at the schema level.
// See sellers_active_requires_nda in the schema migration.

export interface MySellerStatus {
  id: string;
  full_name: string;
  email: string;
  status: "invited" | "pending_nda" | "active" | "suspended";
}

// Reads through the sellers_select_own RLS policy (get_my_role() = 'seller'
// AND auth_id = auth.uid()) on the request-scoped client rather than the
// admin client — a seller can only ever see their own row this way, so
// there's no need to re-derive that scoping here.
export async function getMySeller(): Promise<MySellerStatus | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("sellers")
    .select("id, full_name, email, status")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function acceptSellerAgreement(input: {
  company: string;
  jobTitle: string;
  signatureData: string;
  agreedToPartnerTerms: boolean;
}): Promise<{ success: true } | { error: string }> {
  if (!input.agreedToPartnerTerms) {
    return { error: "You must agree to the Seller Partner Agreement to continue." };
  }
  const company = input.company?.trim();
  const jobTitle = input.jobTitle?.trim();
  if (!company) return { error: "Company is required (enter \"N/A\" if you're an individual partner)." };
  if (!jobTitle) return { error: "Job title is required." };
  if (!input.signatureData) return { error: "Please draw your signature before submitting." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const adminClient = createAdminClient();

  const { data: seller, error: sellerError } = await adminClient
    .from("sellers")
    .select("id, full_name, email, status")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (sellerError || !seller) return { error: "Seller account not found." };
  if (seller.status === "suspended") {
    return { error: "Your account access has been suspended — contact us." };
  }
  if (seller.status !== "pending_nda") {
    return { error: "This agreement has already been completed." };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    null;

  const { data: ndaSignature, error: ndaError } = await adminClient
    .from("nda_signatures")
    .insert({
      full_name: seller.full_name,
      company,
      email: seller.email,
      job_title: jobTitle,
      signature_data: input.signatureData,
      ip_address: ip,
    })
    .select("id")
    .single();

  if (ndaError || !ndaSignature) {
    console.error("acceptSellerAgreement nda insert error:", ndaError);
    return { error: "Failed to record your signature. Please try again." };
  }

  const now = new Date().toISOString();

  const { error: updateError } = await adminClient
    .from("sellers")
    .update({
      nda_signature_id: ndaSignature.id,
      seller_agreement_accepted_at: now,
      status: "active",
      activated_at: now,
      updated_at: now,
    })
    .eq("id", seller.id);

  if (updateError) {
    console.error("acceptSellerAgreement seller update error:", updateError);
    return { error: "Signature recorded, but activation failed. Please contact us." };
  }

  await adminClient.from("activity_log").insert({
    type: "seller_activated",
    actor_id: user.id,
    metadata: { seller_id: seller.id, email: seller.email },
  });

  return { success: true };
}

// ─── Seller dashboard (own referral link, leads, commissions) ──────────────
//
// All three queries below use the request-scoped client (not the admin
// client), reading through leads_seller_select_own / commissions_seller_own
// RLS — this is the first place in the app that actually exercises those
// policies for real, rather than just via the audit. The explicit .eq()
// filters are defense-in-depth on top of RLS, matching the convention used
// elsewhere (e.g. listContractsForClient), not a substitute for it.

export interface MyReferredLead {
  id: string;
  name: string;
  company: string | null;
  status: "new" | "contacted" | "qualified" | "rejected" | "converted";
  created_at: string;
}

export interface MyCommission {
  id: string;
  deal_value: number;
  commission_amount: number;
  status: "pending" | "approved" | "paid" | "disputed";
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
}

export interface SellerDashboardData {
  referralCode: string;
  referralUrl: string;
  commissionRate: number;
  leads: MyReferredLead[];
  commissions: MyCommission[];
  totals: { pending: number; approved: number; paid: number };
}

export async function getMySellerDashboard(): Promise<SellerDashboardData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: seller, error: sellerError } = await supabase
    .from("sellers")
    .select("id, referral_code, commission_rate")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (sellerError || !seller) return null;

  const [{ data: leads, error: leadsError }, { data: commissions, error: commissionsError }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id, name, company, status, created_at")
        .eq("referred_by_seller_id", seller.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("commissions")
        .select("id, deal_value, commission_amount, status, created_at, approved_at, paid_at")
        .eq("seller_id", seller.id)
        .order("created_at", { ascending: false }),
    ]);

  if (leadsError) console.error("[getMySellerDashboard] leads query error:", leadsError.message);
  if (commissionsError) {
    console.error("[getMySellerDashboard] commissions query error:", commissionsError.message);
  }

  const totals = (commissions ?? []).reduce(
    (acc, c) => {
      if (c.status === "pending") acc.pending += c.commission_amount;
      if (c.status === "approved") acc.approved += c.commission_amount;
      if (c.status === "paid") acc.paid += c.commission_amount;
      return acc;
    },
    { pending: 0, approved: 0, paid: 0 }
  );

  return {
    referralCode: seller.referral_code,
    referralUrl: `https://adam.andykgroup.com/questionnaire?ref=${seller.referral_code}`,
    commissionRate: seller.commission_rate,
    leads: leads ?? [],
    commissions: commissions ?? [],
    totals,
  };
}
