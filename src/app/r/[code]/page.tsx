import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ReferralRedirectPage({ params }: Props) {
  const { code } = await params;
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();

  if (!client) {
    redirect("/");
  }

  // Redirect to questionnaire with referral source pre-filled
  redirect(`/questionnaire?source=referral&ref=${code}`);
}
