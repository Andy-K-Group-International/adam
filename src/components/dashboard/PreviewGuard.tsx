"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PreviewContext } from "@/lib/preview-context";

interface Props {
  children: ReactNode;
  userRole: string;
}

export default function PreviewGuard({ children, userRole }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("preview");
  const isAdminPreview = userRole === "admin" && !!previewClientId;
  const [clientName, setClientName] = useState<string | null>(null);

  // Admins without a preview param don't belong in the client dashboard
  useEffect(() => {
    if (userRole === "admin" && !previewClientId) {
      router.replace("/admin");
    }
  }, [userRole, previewClientId, router]);

  // Fetch the preview client's display name for the banner
  useEffect(() => {
    if (!previewClientId) return;
    const supabase = createClient();
    supabase
      .from("clients")
      .select("company_name")
      .eq("id", previewClientId)
      .single()
      .then(({ data }) => setClientName(data?.company_name ?? null));
  }, [previewClientId]);

  // Hide content while redirecting
  if (userRole === "admin" && !previewClientId) return null;

  return (
    <PreviewContext.Provider
      value={{
        isPreview: isAdminPreview,
        previewClientId: isAdminPreview ? previewClientId : null,
        previewClientName: clientName,
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
}
