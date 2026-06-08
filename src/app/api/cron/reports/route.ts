import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMonthlyReport } from "@/app/actions/email";

function cronAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token === process.env.CRON_SECRET;
}

export async function GET(req: NextRequest) {
  if (!cronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  // Month window: first day of previous month → first day of current month
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const monthEnd   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const { data: clients } = await supabase
    .from("clients")
    .select("id, company_name, contact_email, contact_name, health_score, stage")
    .eq("archived", false)
    .in("stage", ["contract", "invoice", "kickoff", "active"]);

  let sent = 0;

  for (const client of clients ?? []) {
    const [milestonesRes, invoicesRes, activitiesRes, contactRes] = await Promise.all([
      supabase
        .from("milestones")
        .select("title, status, completed_at")
        .eq("client_id", client.id)
        .eq("status", "completed")
        .gte("completed_at", monthStart)
        .lt("completed_at", monthEnd),
      supabase
        .from("invoices")
        .select("invoice_number, status, total_amount, currency, due_date")
        .eq("client_id", client.id),
      supabase
        .from("activity_log")
        .select("action, description, created_at")
        .eq("client_id", client.id)
        .gte("created_at", monthStart)
        .lt("created_at", monthEnd)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("contacts")
        .select("name, email")
        .eq("client_id", client.id)
        .eq("is_primary", true)
        .maybeSingle(),
    ]);

    const milestonesCompleted = milestonesRes.data ?? [];
    const invoices = invoicesRes.data ?? [];
    const activities = activitiesRes.data ?? [];
    const primaryContact = contactRes.data;

    const invoicesPaid = invoices.filter((i) => i.status === "paid");
    const invoicesOutstanding = invoices.filter((i) => ["sent", "overdue"].includes(i.status));

    const recipientEmail = primaryContact?.email ?? client.contact_email;
    const recipientName  = primaryContact?.name  ?? client.contact_name;

    await sendMonthlyReport({
      clientEmail:           recipientEmail,
      clientName:            recipientName,
      companyName:           client.company_name,
      month:                 monthLabel,
      healthScore:           client.health_score ?? 0,
      milestonesCompleted:   milestonesCompleted.map((m) => m.title),
      invoicesPaid:          invoicesPaid.length,
      invoicesOutstanding:   invoicesOutstanding.length,
      recentActivities:      activities.map((a) => a.description ?? a.action).slice(0, 5),
    });

    sent++;
  }

  return NextResponse.json({
    status: "ok",
    timestamp: now.toISOString(),
    month: monthLabel,
    reports_sent: sent,
  });
}
