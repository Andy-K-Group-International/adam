import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { WebhookEvent } from "@/lib/webhooks";
import { randomBytes } from "crypto";

const VALID_EVENTS: WebhookEvent[] = [
  "client.created",
  "client.activated",
  "contract.signed",
  "invoice.paid",
  "lead.qualified",
  "proposal.approved",
];

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // Was comparing users.id (internal PK) against the auth user id, which
  // never matches — this always returned null, making every admin action
  // in this route unreachable. auth_id is the correct join column.
  const { data } = await supabase.from("users").select("role").eq("auth_id", user.id).single();
  return data?.role === "admin" || data?.role === "staff" ? user : null;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("webhook_endpoints")
    .select("id, url, events, active, description, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { url, events, description } = body as {
    url?: string;
    events?: string[];
    description?: string;
  };

  if (!url?.startsWith("https://")) {
    return NextResponse.json({ error: "url must be a valid https URL" }, { status: 400 });
  }
  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "events must be a non-empty array" }, { status: 400 });
  }
  const invalid = events.filter((e) => !VALID_EVENTS.includes(e as WebhookEvent));
  if (invalid.length) {
    return NextResponse.json({ error: `Invalid events: ${invalid.join(", ")}` }, { status: 400 });
  }

  const secret = randomBytes(32).toString("hex");
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("webhook_endpoints")
    .insert({ url, events, description: description ?? null, secret })
    .select("id, url, events, active, description, created_at, secret")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, url, events, active, description } = body as {
    id?: string;
    url?: string;
    events?: string[];
    active?: boolean;
    description?: string;
  };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (url !== undefined) patch.url = url;
  if (events !== undefined) patch.events = events;
  if (active !== undefined) patch.active = active;
  if (description !== undefined) patch.description = description;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("webhook_endpoints")
    .update(patch)
    .eq("id", id)
    .select("id, url, events, active, description, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("webhook_endpoints").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
