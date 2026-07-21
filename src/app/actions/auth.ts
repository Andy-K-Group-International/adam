"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function signIn(email: string, password: string): Promise<{ error: string } | void> {
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Failed to get user after sign in" };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, account_status")
    .eq("auth_id", user.id)
    .single();

  if (profile?.account_status === "pending") {
    redirect("/change-password");
  }

  if (profile?.role === "client") {
    redirect("/dashboard");
  } else if (profile?.role === "seller") {
    redirect("/seller");
  } else {
    redirect("/admin");
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<{ error?: string }> {
  // The app's stated policy (8 chars) was enforced client-side only — a
  // direct call to this action bypassed it entirely.
  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  // Verify current password by re-authenticating
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return { error: "Current password is incorrect" };

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { error: updateError.message };

  // Mark account as active
  const adminClient = createAdminClient();
  await adminClient
    .from("users")
    .update({ account_status: "active", updated_at: new Date().toISOString() })
    .eq("auth_id", user.id);

  return {};
}
