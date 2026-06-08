import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { code, billing } = body as { code?: string; billing?: string };

  if (!code?.trim()) {
    return NextResponse.json({ valid: false, error: "Code is required" }, { status: 400 });
  }

  if (billing === "annual") {
    return NextResponse.json({
      valid: false,
      error: "Founding discount cannot be combined with annual billing. Annual billing already includes 40% discount.",
    });
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("founding_codes")
    .select("id, code, discount_percent, used_count, max_uses, active")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ valid: false, error: "Invalid code" });
  }
  if (!data.active) {
    return NextResponse.json({ valid: false, error: "This code is no longer active" });
  }
  if (data.used_count >= data.max_uses) {
    return NextResponse.json({ valid: false, error: "This code has already been used" });
  }

  return NextResponse.json({ valid: true, discount_percent: data.discount_percent });
}
