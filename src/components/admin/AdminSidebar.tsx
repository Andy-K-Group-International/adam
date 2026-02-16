"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  FileText,
  ClipboardList,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pipeline", href: "/admin/pipeline", icon: GitBranch },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Contracts", href: "/admin/contracts", icon: FileText },
  { label: "Questionnaires", href: "/admin/questionnaires", icon: ClipboardList },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-foreground text-white flex flex-col">
      <div className="p-6">
        <Link href="/admin" className="text-xl font-bold tracking-tight">
          A.D.A.M.
        </Link>
        <p className="text-xs text-white/40 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
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
