"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendDemoInvitation } from "@/app/actions/email";

export interface InviteCompanyToDemoInput {
  companyName: string;
  contactEmail: string;
  contactName: string;
  invitedBy: string;
}

export async function inviteCompanyToDemo(
  input: InviteCompanyToDemoInput
): Promise<{ success: true } | { error: string }> {
  const companyName = input.companyName?.trim();
  const contactName = input.contactName?.trim();
  const contactEmail = input.contactEmail?.trim();
  const invitedBy = input.invitedBy?.trim();

  if (!companyName) return { error: "Company name is required." };
  if (!contactName) return { error: "Contact name is required." };
  if (!contactEmail) return { error: "Contact email is required." };
  if (!invitedBy) return { error: "Missing inviter name." };

  // This does NOT create a demo_token. The invite only sends a pre-filled
  // link to /nda-sign — the normal NDA flow (submitNdaSignature) is the only
  // code path allowed to create a demo_token, and the DB now enforces that
  // via a NOT NULL FK from demo_tokens to nda_signatures. No bypass here.
  const ndaSignUrl = `https://adam.andykgroup.com/nda-sign?${new URLSearchParams({
    company: companyName,
    email: contactEmail,
    name: contactName,
  }).toString()}`;

  const result = await sendDemoInvitation({
    contactName,
    contactEmail,
    companyName,
    invitedByName: invitedBy,
    ndaSignUrl,
  });

  if (!result) {
    return { error: "Failed to send invitation email. Please try again." };
  }

  const supabase = createAdminClient();
  const { error: logError } = await supabase.from("demo_invites").insert({
    company_name: companyName,
    contact_name: contactName,
    contact_email: contactEmail,
    invited_by: invitedBy,
  });

  if (logError) {
    console.error("demo_invites insert error:", logError);
    // Email already sent successfully — don't fail the action over logging.
  }

  return { success: true };
}

export interface DemoInviteRow {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  invited_by: string;
  invited_at: string;
  signed: boolean;
}

export async function listDemoInvites(): Promise<DemoInviteRow[]> {
  const supabase = createAdminClient();

  const { data: invites, error } = await supabase
    .from("demo_invites")
    .select("id, company_name, contact_name, contact_email, invited_by, invited_at")
    .order("invited_at", { ascending: false });

  if (error) {
    console.error("demo_invites list error:", error);
    return [];
  }
  if (!invites || invites.length === 0) return [];

  const emails = [...new Set(invites.map((i) => i.contact_email))];
  const { data: signatures } = await supabase
    .from("nda_signatures")
    .select("email")
    .in("email", emails);

  const signedEmails = new Set((signatures ?? []).map((s) => s.email));

  return invites.map((invite) => ({
    ...invite,
    signed: signedEmails.has(invite.contact_email),
  }));
}
