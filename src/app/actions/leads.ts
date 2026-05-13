"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendLeadRejection } from "./email";

export async function qualifyLead(leadId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: "qualified", updated_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
}

export async function rejectLead(leadId: string, reason: string): Promise<void> {
  const supabase = createAdminClient();

  const coolingUntil = new Date();
  coolingUntil.setMonth(coolingUntil.getMonth() + 6);

  const { data: lead, error } = await supabase
    .from("leads")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      cooling_period_until: coolingUntil.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select("name, email")
    .single();

  if (error) throw new Error(error.message);

  await sendLeadRejection({
    name: lead.name,
    email: lead.email,
    reason: reason.trim() || undefined,
  });
}
