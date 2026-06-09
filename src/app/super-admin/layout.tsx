import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SuperAdminSidebar from "@/components/super-admin/SuperAdminSidebar";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== "ceo@andykgroup.com") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen">
      <SuperAdminSidebar />
      <main className="flex-1 bg-bg-light min-h-screen section-bg-grid">
        <div className="p-6 lg:p-8 max-w-screen-2xl">{children}</div>
      </main>
    </div>
  );
}
