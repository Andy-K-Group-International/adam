import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// Anonymous questionnaire drafts are now handled entirely server-side via
// the admin client, with an opaque per-draft session token as the primary
// lookup key. Falls back to email lookup only when no token is available
// (a genuinely new device / cleared localStorage) — this fallback is weaker
// (anyone who knows the target's email can hit it) but is an explicit,
// narrower, server-enforced version of the previous RLS gap rather than an
// unbounded anon UPDATE grant on the table itself.

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionToken = searchParams.get("sessionToken");
  const email = searchParams.get("email");

  if (!sessionToken && !email) {
    return NextResponse.json({ error: "sessionToken or email required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  let query = supabase.from("questionnaires").select("*").eq("status", "draft");
  query = sessionToken ? query.eq("session_id", sessionToken) : query.eq("contact_email", email!.trim().toLowerCase());

  const { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draft: data ?? null });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { sessionToken, email, answers, selectedSegments, currentPageIndex } = body as {
    sessionToken?: string;
    email?: string;
    answers?: Record<string, unknown>;
    selectedSegments?: string[];
    currentPageIndex?: number;
  };

  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const supabase = createAdminClient();

  let existing: { id: string; session_id: string | null } | null = null;
  if (sessionToken) {
    const { data } = await supabase
      .from("questionnaires")
      .select("id, session_id")
      .eq("session_id", sessionToken)
      .eq("status", "draft")
      .maybeSingle();
    existing = data;
  }
  if (!existing) {
    const { data } = await supabase
      .from("questionnaires")
      .select("id, session_id")
      .eq("contact_email", normalizedEmail)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    existing = data;
  }

  const now = new Date().toISOString();

  if (existing) {
    // Backfill a session token onto legacy/email-only-found drafts so future
    // saves from this browser upgrade to the token-based lookup.
    const tokenToUse = existing.session_id ?? crypto.randomUUID();
    const { data: updated, error } = await supabase
      .from("questionnaires")
      .update({
        contact_email: normalizedEmail,
        answers: answers ?? {},
        selected_segments: selectedSegments ?? [],
        current_page_index: currentPageIndex ?? 0,
        session_id: tokenToUse,
        updated_at: now,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ draft: updated, sessionToken: tokenToUse });
  }

  const newToken = crypto.randomUUID();
  const { data: created, error } = await supabase
    .from("questionnaires")
    .insert({
      contact_email: normalizedEmail,
      answers: answers ?? {},
      selected_segments: selectedSegments ?? [],
      current_page_index: currentPageIndex ?? 0,
      session_id: newToken,
      status: "draft",
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ draft: created, sessionToken: newToken });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const sessionToken = body?.sessionToken as string | undefined;
  const email = body?.email as string | undefined;

  if (!sessionToken && !email) {
    return NextResponse.json({ error: "sessionToken or email required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  let query = supabase.from("questionnaires").delete().eq("status", "draft");
  query = sessionToken ? query.eq("session_id", sessionToken) : query.eq("contact_email", email!.trim().toLowerCase());

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
