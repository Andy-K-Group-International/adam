"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendSellerApplicationNotification } from "@/app/actions/email";
import { inviteSeller } from "@/app/actions/sellers";

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

const RATE_LIMIT_ENDPOINT = "/become-a-seller";

// ─── Public: submit a seller application ────────────────────────────────────
//
// Does NOT create a seller account — only a review request. Matches Section
// 4 of the Seller Partner Agreement ("Seller Partner access is not
// automatic"). Rate limiting reuses the exact rate_limit_log mechanism from
// /api/leads/submit (IP + endpoint, 3/24h), called from within a server
// action rather than a route handler — the table doesn't care which.

export interface SubmitSellerApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  message?: string;
}

export async function submitSellerApplication(
  input: SubmitSellerApplicationInput
): Promise<{ success: true } | { error: string }> {
  const fullName = input.fullName?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const message = input.message?.trim() || null;

  if (!fullName) return { error: "Full name is required." };
  if (!email) return { error: "Email is required." };
  if (!phone) return { error: "Phone is required." };

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  const supabase = createAdminClient();

  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("rate_limit_log")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("endpoint", RATE_LIMIT_ENDPOINT)
    .gte("created_at", windowStart);

  if ((recentCount ?? 0) >= 3) {
    return { error: "Too many requests. Please try again tomorrow." };
  }

  supabase.from("rate_limit_log").insert({ ip, endpoint: RATE_LIMIT_ENDPOINT }).then(() => {});

  const { data: application, error: insertError } = await supabase
    .from("seller_applications")
    .insert({ full_name: fullName, email, phone, message })
    .select("id")
    .single();

  if (insertError || !application) {
    console.error("[submitSellerApplication] insert error:", insertError?.message);
    return { error: "Failed to submit your application. Please try again." };
  }

  const { error: logError } = await supabase.from("activity_log").insert({
    type: "seller_application_submitted",
    metadata: { application_id: application.id, email },
  });
  if (logError) console.error("[submitSellerApplication] activity_log insert error:", logError.message);

  await sendSellerApplicationNotification({ fullName, email, phone, message }).catch((err) =>
    console.error("[submitSellerApplication] admin email error:", err)
  );

  return { success: true };
}

// ─── Admin: list applications ────────────────────────────────────────────────

export interface SellerApplicationRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export async function listSellerApplications(
  statusFilter?: "pending" | "approved" | "rejected"
): Promise<SellerApplicationRow[]> {
  const admin = await requireAdmin();
  if (!admin) return [];

  const supabase = createAdminClient();
  let query = supabase
    .from("seller_applications")
    .select("id, full_name, email, phone, message, status, created_at, reviewed_at, rejection_reason")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listSellerApplications] query error:", error.message);
    return [];
  }
  return data ?? [];
}

// ─── Admin: approve an application ──────────────────────────────────────────
//
// Invites first, marks 'approved' only once inviteSeller() actually
// succeeds — if the invite fails (email delivery, or a seller invite
// already exists for this email — inviteSeller() itself guards against
// duplicates), the application stays 'pending' so the admin can just retry
// by clicking Approve again. Marking it 'approved' first would leave a
// silently-stuck record with no invite ever sent and no way to retry
// through this same action — the exact partial-failure trap fixed in
// registerSeller() during the Phase A self-review; applying that lesson
// here from the start rather than repeating it.

export async function approveSellerApplication(
  applicationId: string,
  commissionRate?: number
): Promise<{ success: true } | { error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminClient();

  const { data: application, error: fetchError } = await supabase
    .from("seller_applications")
    .select("id, full_name, email, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (fetchError || !application) return { error: "Application not found." };
  if (application.status !== "pending") {
    return { error: `Cannot approve an application with status '${application.status}'.` };
  }

  const { data: adminProfile } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("auth_id", admin.id)
    .maybeSingle();
  const invitedByName = adminProfile
    ? `${adminProfile.first_name} ${adminProfile.last_name}`.trim()
    : "Admin";

  const inviteResult = await inviteSeller({
    email: application.email,
    fullName: application.full_name,
    commissionRate,
    invitedBy: invitedByName,
  });

  if ("error" in inviteResult) {
    console.error("[approveSellerApplication] inviteSeller error:", inviteResult.error);
    return { error: `Failed to send seller invite: ${inviteResult.error}` };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("seller_applications")
    .update({ status: "approved", reviewed_at: now, reviewed_by: admin.id })
    .eq("id", applicationId);

  if (updateError) {
    // The invite already went out — log loudly rather than let this look
    // like nothing happened. A retry would just fail cleanly against
    // inviteSeller()'s own "invite already exists" guard, so this is a
    // status bookkeeping gap only, not a duplicate-invite risk.
    console.error("[approveSellerApplication] status update error:", updateError.message);
    return {
      error: "Seller invite was sent, but updating the application status failed. Check the Sellers list to confirm.",
    };
  }

  const { error: logError } = await supabase.from("activity_log").insert({
    type: "seller_application_approved",
    actor_id: admin.id,
    metadata: { application_id: applicationId, email: application.email },
  });
  if (logError) console.error("[approveSellerApplication] activity_log insert error:", logError.message);

  return { success: true };
}

// ─── Admin: reject an application ───────────────────────────────────────────

export async function rejectSellerApplication(
  applicationId: string,
  reason?: string
): Promise<{ success: true } | { error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminClient();

  const { data: application, error: fetchError } = await supabase
    .from("seller_applications")
    .select("id, email, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (fetchError || !application) return { error: "Application not found." };
  if (application.status !== "pending") {
    return { error: `Cannot reject an application with status '${application.status}'.` };
  }

  const now = new Date().toISOString();
  const trimmedReason = reason?.trim() || null;
  const { error: updateError } = await supabase
    .from("seller_applications")
    .update({
      status: "rejected",
      reviewed_at: now,
      reviewed_by: admin.id,
      rejection_reason: trimmedReason,
    })
    .eq("id", applicationId);

  if (updateError) {
    console.error("[rejectSellerApplication] update error:", updateError.message);
    return { error: "Failed to reject application." };
  }

  const { error: logError } = await supabase.from("activity_log").insert({
    type: "seller_application_rejected",
    actor_id: admin.id,
    metadata: { application_id: applicationId, email: application.email, reason: trimmedReason },
  });
  if (logError) console.error("[rejectSellerApplication] activity_log insert error:", logError.message);

  return { success: true };
}
