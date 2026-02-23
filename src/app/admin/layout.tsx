"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login?returnTo=/admin");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!user) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-bg-light">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
