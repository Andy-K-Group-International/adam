"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Get user role to determine redirect
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Failed to get user after sign in" };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (profile?.role === "client") {
    redirect("/dashboard");
  } else {
    redirect("/admin");
  }
}
