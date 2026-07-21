import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMonthlyReport } from "@/app/actions/email";
import { cronAuth } from "@/lib/cron-auth";

// Convert snake_case activity type to a human-readable label for email content.
function activityLabel(type: string, metadata: Record<string, unknown> | null): string {
  const labels: Record<string, string> = {
    contract_created:           "Contract created",
    contract_published:         "Contract sent to client",
    contract_viewed:            "Contract viewed by client",
    contract_changes_requested: "Client requested contract changes",
    contract_client_signed:     "Client signed contract",
    contract_countersigned:     "Contract countersigned",
    contract_finalized:         "Contract finalised",
    appendix_uploaded:          "Document appendix uploaded",
    appendix_verified:          "Appendix verified",
    appendix_rejected:          "Appendix rejected",
    comment_added:              "Comment added",
    client_created:             "Client account created",
    questionnaire_submitted:    "Questionnaire submitted",
    questionnaire_ai_evaluated: "Questionnaire AI-evaluated",
    questionnaire_proceed:      "Questionnaire: proceed decision",
    questionnaire_flag:         "Questionnaire: flagged for review",
    questionnaire_reject:       "Questionnaire: rejected",
    client_stage_changed:       "Client stage updated",
  };

  const base = labels[type] ?? type.replace(/_/g, " ");

  // Safely extract an optional detail from metadata without risking a throw.
  try {
    if (metadata && typeof metadata === "object") {
      const detail = metadata.title ?? metadata.note ?? metadata.to ?? null;
      if (detail && typeof detail === "string") return `${base}: ${detail}`;
    }
  } catch {
    // metadata shape mismatch — fall through to base label
  }

  return base;
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

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, company_name, contact_email, contact_name, health_score, stage")
    .eq("archived", false)
    .in("stage", ["contract", "invoice", "kickoff", "active"]);

  if (clientsError) {
    console.error("[cron/reports] Failed to fetch clients:", clientsError.message);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const client of clients ?? []) {
    try {
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
          .select("type, metadata, created_at")
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

      if (milestonesRes.error) {
        console.error(`[cron/reports] milestones query failed for client ${client.id}:`, milestonesRes.error.message);
      }
      if (invoicesRes.error) {
        console.error(`[cron/reports] invoices query failed for client ${client.id}:`, invoicesRes.error.message);
      }
      if (activitiesRes.error) {
        console.error(`[cron/reports] activity_log query failed for client ${client.id}:`, activitiesRes.error.message);
      }

      const milestonesCompleted = milestonesRes.data ?? [];
      const invoices = invoicesRes.data ?? [];
      const activities = activitiesRes.data ?? [];
      const primaryContact = contactRes.data;

      const invoicesPaid = invoices.filter((i) => i.status === "paid");
      const invoicesOutstanding = invoices.filter((i) => ["sent", "overdue"].includes(i.status));

      const recipientEmail = primaryContact?.email ?? client.contact_email;
      const recipientName  = primaryContact?.name  ?? client.contact_name;

      const recentActivities = activities
        .map((a) => {
          try {
            return activityLabel(
              a.type ?? "",
              (a.metadata as Record<string, unknown> | null) ?? null,
            );
          } catch {
            console.error(`[cron/reports] Failed to build activity label for client ${client.id}`, a);
            return "";
          }
        })
        .filter(Boolean)
        .slice(0, 5);

      await sendMonthlyReport({
        clientEmail:         recipientEmail,
        clientName:          recipientName,
        companyName:         client.company_name,
        month:               monthLabel,
        healthScore:         client.health_score ?? 0,
        milestonesCompleted: milestonesCompleted.map((m) => m.title),
        invoicesPaid:        invoicesPaid.length,
        invoicesOutstanding: invoicesOutstanding.length,
        recentActivities,
      });

      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cron/reports] Failed to process client ${client.id} (${client.company_name}):`, msg);
      errors.push(`${client.company_name}: ${msg}`);
    }
  }

  return NextResponse.json({
    status: errors.length === 0 ? "ok" : "partial",
    timestamp: now.toISOString(),
    month: monthLabel,
    reports_sent: sent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
