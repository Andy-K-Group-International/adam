import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTokenReminder } from "@/app/actions/email";

export async function POST(req: NextRequest) {
  // Require service-role key as bearer token
  const auth = req.headers.get("authorization");
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  // Leads with active tokens, sent 3+ days ago, not yet converted
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, email, questionnaire_token, token_expires_at")
    .eq("status", "qualified")
    .not("questionnaire_token", "is", null)
    .gt("token_expires_at", now)
    .lt("token_sent_at", threeDaysAgo)
    .neq("status", "converted");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ sent: 0, message: "No reminders needed" });
  }

  const results = await Promise.allSettled(
    leads.map((lead) =>
      sendTokenReminder({
        name:           lead.name,
        email:          lead.email,
        token:          lead.questionnaire_token!,
        tokenExpiresAt: lead.token_expires_at!,
      })
    )
  );

  const sent      = results.filter((r) => r.status === "fulfilled").length;
  const failed    = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, total: leads.length });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
