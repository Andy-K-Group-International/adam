import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password reset flow: skip role-based redirect, go directly to reset page
      if (next === "/reset-password") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Normal login: role-based redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("auth_id", user.id)
          .single();

        if (profile?.role === "client") {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
        if (profile?.role === "admin" || profile?.role === "staff" || profile?.role === "company_admin") {
          return NextResponse.redirect(`${origin}/admin`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code error — redirect to sign-in
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`);
}
