import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendLaunchInvitation } from "@/app/actions/email";

export async function POST(req: NextRequest) {
  // Verify admin session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { lead_id, email, name, company, plan } = body as {
    lead_id: string;
    email: string;
    name: string;
    company?: string | null;
    plan?: string | null;
  };

  if (!lead_id || !email || !name) {
    return NextResponse.json({ error: "Missing required fields: lead_id, email, name" }, { status: 400 });
  }

  // Check not already sent
  const { data: lead } = await adminClient
    .from("leads")
    .select("id, launch_invite_sent")
    .eq("id", lead_id)
    .maybeSingle();

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  if (lead.launch_invite_sent) {
    return NextResponse.json({ error: "Launch invitation already sent for this lead" }, { status: 409 });
  }

  // Send the email
  await sendLaunchInvitation({ name, email, company, plan });

  // Mark invite as sent and update status to qualified
  const now = new Date().toISOString();
  await adminClient
    .from("leads")
    .update({
      launch_invite_sent: true,
      launch_invite_sent_at: now,
      status: "qualified",
      updated_at: now,
    })
    .eq("id", lead_id);

  // Log to activity_log
  await adminClient.from("activity_log").insert({
    type: "launch_invite_sent",
    metadata: {
      lead_id,
      email,
      name,
      company: company ?? null,
      plan: plan ?? null,
      sent_by: user.id,
      sent_at: now,
    },
  });

  return NextResponse.json({ success: true });
}
