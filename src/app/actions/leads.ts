"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendLeadRejection, sendQuestionnaireInvite } from "./email";

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

export async function approveLeadWithToken(leadId: string): Promise<void> {
  const supabase = createAdminClient();

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: lead, error } = await supabase
    .from("leads")
    .update({
      status: "qualified",
      questionnaire_token: token,
      token_expires_at: expiresAt.toISOString(),
      token_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select("name, email, company")
    .single();

  if (error) throw new Error(error.message);

  await sendQuestionnaireInvite({
    name: lead.name,
    email: lead.email,
    company: lead.company,
    token,
    expiresAt: expiresAt.toISOString(),
  });
}
