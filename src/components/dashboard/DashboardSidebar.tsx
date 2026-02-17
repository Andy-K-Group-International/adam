"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contracts", href: "/dashboard/contracts", icon: FileText },
  { label: "Documents", href: "/dashboard/documents", icon: FolderOpen },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-foreground text-white flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          A.D.A.M.
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
                isActive
                  ? "bg-highlight/20 text-highlight"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <a
          href="/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </a>
      </div>
    </aside>
  );
}
