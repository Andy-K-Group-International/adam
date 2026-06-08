import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_CODES = 20;
const CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const chars = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => CODE_CHARSET[b % CODE_CHARSET.length])
    .join("");
  return `FOUNDING-${chars}`;
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("users").select("role").eq("auth_id", user.id).single();
  return data?.role === "admin" ? user : null;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("founding_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data, total: data?.length ?? 0, max: MAX_CODES });
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const discountPercent = Number(body.discount_percent ?? 20);

  if (discountPercent < 0 || discountPercent > 20) {
    return NextResponse.json({ error: "discount_percent must be 0–20" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Enforce max 20 codes
  const { count } = await supabase
    .from("founding_codes")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) >= MAX_CODES) {
    return NextResponse.json({ error: "Maximum of 20 Founding Client codes already issued" }, { status: 409 });
  }

  // Generate unique code (retry on collision)
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from("founding_codes")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  const { data, error } = await supabase
    .from("founding_codes")
    .insert({ code, discount_percent: discountPercent, max_uses: 1 })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, active } = body as { id?: string; active?: boolean };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("founding_codes")
    .update({ active })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
