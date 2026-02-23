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
      // After login, check user role to redirect appropriately
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
        if (profile?.role === "admin" || profile?.role === "staff") {
          return NextResponse.redirect(`${origin}/admin`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code error — redirect to error page or sign-in
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`);
}
