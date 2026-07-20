"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// business_verifications has RLS enabled with zero policies (service-role
// only by design), so this must go through the admin client — matching the
// convention already used for sellers/commissions/seller_applications.
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  return data?.role === "admin" || data?.role === "staff" ? user : null;
}

export async function getBusinessVerification(clientId: string) {
  const admin = await requireAdmin();
  if (!admin) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("business_verifications")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function updateBusinessVerificationStatus(
  verificationId: string,
  status: "verified" | "rejected",
  adminNotes: string,
  adminEmail: string | undefined
): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("business_verifications")
    .update({
      status,
      admin_notes: adminNotes || null,
      verified_by: adminEmail ?? null,
      verified_at: status === "verified" ? now : null,
      updated_at: now,
    })
    .eq("id", verificationId);

  if (error) return { error: error.message };
  return {};
}
