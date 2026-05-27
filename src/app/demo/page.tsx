import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import DemoContent from "./DemoContent";

export const metadata: Metadata = {
  title: "Private Demo — A.D.A.M. | Andy'K Group International LTD",
  robots: { index: false, follow: false },
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/request-demo");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("demo_tokens")
    .select("id, email, name, company, company_name, contact_name, used_at, expires_at, revoked")
    .eq("token", token)
    .single();

  if (!data) redirect("/request-demo");

  // Revoked
  if (data.revoked) redirect("/request-demo");

  // Expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) redirect("/request-demo");

  const now = new Date().toISOString();

  // Record first visit + update tracking
  await supabase
    .from("demo_tokens")
    .update({
      ...(data.used_at ? {} : { used_at: now }),
      last_accessed_at: now,
    })
    .eq("token", token);

  // Increment access count separately (avoids read-modify-write race)
  try { await supabase.rpc("increment_demo_access", { token_value: token }); } catch {}

  const companyDisplay = data.company_name ?? data.company ?? "";
  const nameDisplay    = data.contact_name ?? data.name ?? "";
  const tokenId        = (data.id as string).slice(0, 8).toUpperCase();

  return (
    <DemoContent
      name={nameDisplay}
      company={companyDisplay}
      tokenId={tokenId}
      accessDate={new Date().toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })}
    />
  );
}
