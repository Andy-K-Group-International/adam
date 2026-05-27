import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import PreviewGuard from "@/components/dashboard/PreviewGuard";
import PreviewBanner from "@/components/dashboard/PreviewBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (!profile) redirect("/sign-in");

  // Clients use the dashboard normally.
  // Admins are allowed through — PreviewGuard handles the ?preview= check
  // and redirects back to /admin if the param is missing.
  if (profile.role !== "client" && profile.role !== "admin") {
    redirect("/admin");
  }

  return (
    <Suspense>
      <PreviewGuard userRole={profile.role}>
        <div className="flex min-h-screen">
          <DashboardSidebar />
          <main className="flex-1 bg-bg-light min-h-screen section-bg-grid flex flex-col">
            <PreviewBanner />
            <div className="p-6 lg:p-8 max-w-screen-xl">{children}</div>
          </main>
        </div>
      </PreviewGuard>
    </Suspense>
  );
}
