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
  if (!token) redirect("/nda-sign");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("demo_tokens")
    .select("id, email, name, company, used_at")
    .eq("token", token)
    .single();

  if (!data) redirect("/nda-sign");

  // Record first visit
  if (!data.used_at) {
    await supabase
      .from("demo_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);
  }

  return <DemoContent name={data.name ?? ""} company={data.company ?? ""} />;
}
