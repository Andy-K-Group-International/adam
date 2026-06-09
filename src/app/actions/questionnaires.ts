"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/app/actions/email";

function generateTempPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

export async function convertToClientAction(
  questionnaireId: string,
  role: "client" | "company_admin" = "client"
): Promise<{ clientId?: string; error?: string }> {
  const supabase = createAdminClient();

  // Fetch questionnaire
  const { data: questionnaire, error: qErr } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("id", questionnaireId)
    .single();

  if (qErr || !questionnaire) {
    return { error: "Questionnaire not found" };
  }

  // Generate client_ref
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });
  const seq = String((count ?? 0) + 1).padStart(4, "0");
  const clientRef = `AK-${year}-${seq}`;

  // Create client record
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .insert({
      client_ref: clientRef,
      company_name: questionnaire.company_name,
      contact_name: questionnaire.contact_name,
      contact_email: questionnaire.contact_email,
      contact_phone: questionnaire.contact_phone ?? null,
      website_url: questionnaire.website_url ?? null,
      address: questionnaire.address ?? null,
      billing_currency: questionnaire.billing_currency ?? null,
      stage: "questionnaire",
      questionnaire_id: questionnaireId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (clientErr || !client) {
    return { error: clientErr?.message ?? "Failed to create client" };
  }

  // Update questionnaire status
  await supabase
    .from("questionnaires")
    .update({ status: "converted", updated_at: new Date().toISOString() })
    .eq("id", questionnaireId);

  // Log activity
  await supabase.from("activity_log").insert({
    client_id: client.id,
    action: "converted_from_questionnaire",
    description: "Client created from questionnaire submission",
    created_at: new Date().toISOString(),
  });

  // Create Supabase Auth user
  const tempPassword = generateTempPassword();
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: questionnaire.contact_email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authErr || !authData.user) {
    // Auth user creation failed — client record exists but no portal access yet
    console.error("Auth user creation failed:", authErr?.message);
    return { clientId: client.id };
  }

  // Split contact_name into first + last
  const nameParts = (questionnaire.contact_name ?? "").trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  // Insert users table record
  const { error: userErr } = await supabase.from("users").insert({
    auth_id: authData.user.id,
    email: questionnaire.contact_email,
    first_name: firstName,
    last_name: lastName,
    image_url: null,
    role,
    client_id: client.id,
    account_status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (userErr) {
    console.error("Users table insert failed:", userErr.message);
  }

  // For company_admin, link the client record back to this user so scoped queries work
  if (role === "company_admin") {
    await supabase
      .from("clients")
      .update({ assigned_to: authData.user.id, updated_at: new Date().toISOString() })
      .eq("id", client.id);
  }

  // Send welcome email
  try {
    await sendWelcomeEmail({
      clientEmail: questionnaire.contact_email,
      clientName: firstName || questionnaire.contact_name,
      companyName: questionnaire.company_name,
      clientRef,
      tempPassword,
    });
  } catch (emailErr) {
    console.error("Welcome email failed:", emailErr);
  }

  return { clientId: client.id };
}
