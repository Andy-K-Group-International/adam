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

  // Guard against double conversion (double-click, race, or retry after this
  // questionnaire was already converted in a prior call)
  if (questionnaire.status === "converted") {
    return {
      error: questionnaire.converted_to_client_id
        ? "This questionnaire has already been converted to a client."
        : "This questionnaire is marked converted but has no linked client — contact an engineer.",
      clientId: questionnaire.converted_to_client_id ?? undefined,
    };
  }

  // Create client record — client_ref is assigned by the generate_client_ref()
  // DB trigger (nextval on a real sequence), not computed here, to avoid a
  // count()+1 race under concurrent conversions.
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .insert({
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

  // Create Supabase Auth user
  const tempPassword = generateTempPassword();
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: questionnaire.contact_email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authErr || !authData.user) {
    // Roll back the client row so the questionnaire stays convertible on retry
    // instead of leaving an orphaned client with no login.
    const { error: rollbackErr } = await supabase.from("clients").delete().eq("id", client.id);
    if (rollbackErr) {
      console.error("[convertToClientAction] rollback failed: orphaned client row", client.id, rollbackErr.message);
    }
    return { error: `Failed to create login for this client: ${authErr?.message ?? "unknown error"}` };
  }

  // Split contact_name into first + last
  const nameParts = (questionnaire.contact_name ?? "").trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  // Insert users table record — roll back client + auth user on failure, same
  // reasoning as above: no orphaned state, questionnaire stays retryable.
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
    const { error: rollbackUserErr } = await supabase.from("clients").delete().eq("id", client.id);
    if (rollbackUserErr) {
      console.error("[convertToClientAction] rollback failed: orphaned client row", client.id, rollbackUserErr.message);
    }
    const { error: rollbackAuthErr } = await supabase.auth.admin.deleteUser(authData.user.id);
    if (rollbackAuthErr) {
      console.error("[convertToClientAction] rollback failed: orphaned auth user", authData.user.id, rollbackAuthErr.message);
    }
    return { error: `Failed to create user record: ${userErr.message}` };
  }

  // For company_admin, link the client record back to this user so scoped queries work
  if (role === "company_admin") {
    await supabase
      .from("clients")
      .update({
        assigned_to: authData.user.id,
        onboarding_status: "activated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", client.id);
  }

  // Only now — once the client, auth user, and users row all exist — mark the
  // questionnaire converted and log the activity. Doing this earlier meant a
  // failure below could leave the questionnaire permanently un-retryable.
  await supabase
    .from("questionnaires")
    .update({ status: "converted", converted_to_client_id: client.id, updated_at: new Date().toISOString() })
    .eq("id", questionnaireId);

  await supabase.from("activity_log").insert({
    client_id: client.id,
    action: "converted_from_questionnaire",
    description: "Client created from questionnaire submission",
    created_at: new Date().toISOString(),
  });

  // Send welcome email
  try {
    await sendWelcomeEmail({
      clientEmail: questionnaire.contact_email,
      clientName: firstName || questionnaire.contact_name,
      companyName: questionnaire.company_name,
      clientRef: client.client_ref,
      tempPassword,
    });
  } catch (emailErr) {
    console.error("Welcome email failed:", emailErr);
  }

  return { clientId: client.id };
}
