"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// client_agreement_snapshots has RLS enabled with zero policies (service-role
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

export async function listAgreementSnapshots(clientId: string) {
  const admin = await requireAdmin();
  if (!admin) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("client_agreement_snapshots")
    .select("*")
    .eq("client_id", clientId)
    .order("accepted_at", { ascending: false });

  return data ?? [];
}
