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

  // TODO(Phase B): do NOT add 'seller' to this allowed list. Sellers should
  // land here today only via the signIn() redirect-loop bug tracked in
  // src/app/actions/auth.ts (see the TODO there) — once that's fixed to send
  // sellers to their own portal instead, this guard should keep bouncing
  // 'seller' to /sign-in, not admit it. Seller-facing pages need their own
  // layout/guard, not admin access.
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
