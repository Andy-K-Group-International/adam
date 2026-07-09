import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Verify admin/staff role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  // 'seller' is intentionally excluded — signIn() (src/app/actions/auth.ts)
  // routes sellers to /seller, which has its own layout guard
  // (src/app/seller/layout.tsx). Do not add 'seller' here; it needs its own
  // access surface, not admin access.
  if (!profile || !['admin', 'staff', 'company_admin'].includes(profile.role)) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-bg-light min-h-screen section-bg-grid">
        <div className="p-6 lg:p-8 max-w-screen-2xl">{children}</div>
      </main>
    </div>
  );
}
