"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendCompanyActivationEmail } from "@/app/actions/email";

export interface ActivateCompanyOptions {
  adminEmail: string;
  firstName: string;
  lastName: string;
  licenseTier: "trial" | "full" | "founding";
}

function generateTempPassword(length = 14): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function activateCompanyAction(
  clientId: string,
  options: ActivateCompanyOptions
): Promise<{ authId?: string; error?: string }> {
  const { adminEmail, firstName, lastName, licenseTier } = options;
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // 1. Fetch client — validate it exists and is not already activated
  const { data: client, error: fetchErr } = await supabase
    .from("clients")
    .select("id, company_name, contact_email, assigned_to, onboarding_status")
    .eq("id", clientId)
    .single();

  if (fetchErr || !client) {
    return { error: fetchErr?.message ?? "Client not found" };
  }

  if (client.onboarding_status === "activated" || client.onboarding_status === "completed") {
    return { error: `Company already activated (status: ${client.onboarding_status})` };
  }

  // 2. Guard: no existing company_admin user for this client
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("client_id", clientId)
    .eq("role", "company_admin")
    .maybeSingle();

  if (existingUser) {
    return { error: "A company_admin user already exists for this client" };
  }

  // 3. Create Supabase Auth user
  const tempPassword = generateTempPassword();
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: tempPassword,
    email_confirm: true,
  });

  if (authErr || !authData.user) {
    return { error: authErr?.message ?? "Auth user creation failed" };
  }

  const authId = authData.user.id;

  // 4. Insert users row — rollback: delete auth user on failure
  const { error: userErr } = await supabase.from("users").insert({
    auth_id: authId,
    email: adminEmail,
    first_name: firstName,
    last_name: lastName,
    image_url: null,
    role: "company_admin",
    client_id: clientId,
    account_status: "pending",
    created_at: now,
    updated_at: now,
  });

  if (userErr) {
    const { error: rollbackAuthErr } = await supabase.auth.admin.deleteUser(authId);
    if (rollbackAuthErr) {
      console.error("[activateCompanyAction] rollback failed: orphaned auth user", authId, rollbackAuthErr.message);
    }
    return { error: `Failed to create user record: ${userErr.message}` };
  }

  // 5. Update client record — rollback: delete users row + auth user on failure
  const activationToken = crypto.randomUUID();
  const { error: clientErr } = await supabase
    .from("clients")
    .update({
      assigned_to: authId,
      license_tier: licenseTier,
      company_admin_email: adminEmail,
      onboarding_status: "activated",
      activation_token: activationToken,
      activation_sent_at: now,
      updated_at: now,
    })
    .eq("id", clientId);

  if (clientErr) {
    const { error: rollbackUserErr } = await supabase.from("users").delete().eq("auth_id", authId);
    if (rollbackUserErr) {
      console.error("[activateCompanyAction] rollback failed: orphaned users row", authId, rollbackUserErr.message);
    }
    const { error: rollbackAuthErr } = await supabase.auth.admin.deleteUser(authId);
    if (rollbackAuthErr) {
      console.error("[activateCompanyAction] rollback failed: orphaned auth user", authId, rollbackAuthErr.message);
    }
    return { error: `Failed to update client record: ${clientErr.message}` };
  }

  // 6. Log activity (non-fatal)
  try {
    await supabase.from("activity_log").insert({
      type: "company_activated",
      client_id: clientId,
      metadata: {
        admin_email: adminEmail,
        license_tier: licenseTier,
        auth_id: authId,
      },
      created_at: now,
    });
  } catch (err) {
    console.error("[activateCompanyAction] activity log error", err);
  }

  // 7. Send activation email (non-fatal)
  await sendCompanyActivationEmail({
    adminEmail,
    firstName,
    companyName: client.company_name ?? "",
    licenseTier,
    tempPassword,
  }).catch((err) => console.error("[activateCompanyAction] activation email error", err));

  return { authId };
}
