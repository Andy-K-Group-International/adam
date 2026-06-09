"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth-signout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  LayoutDashboard,
  GitBranch,
  Target,
  Users,
  FileText,
  ClipboardList,
  MessageSquareText,
  Lightbulb,
  Receipt,
  BarChart2,
  LogOut,
  BookOpen,
  Star,
  Shield,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pipeline", href: "/admin/pipeline", icon: GitBranch },
  { label: "Leads", href: "/admin/leads", icon: Target },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Proposals", href: "/admin/proposals", icon: Lightbulb },
  { label: "Strategy",  href: "/admin/strategy",  icon: BookOpen },
  { label: "Contracts", href: "/admin/contracts", icon: FileText },
  { label: "Invoices", href: "/admin/invoices", icon: Receipt },
  { label: "Reports", href: "/admin/reports", icon: BarChart2 },
  { label: "Questionnaires", href: "/admin/questionnaires", icon: ClipboardList },
  { label: "Questions", href: "/admin/questions", icon: MessageSquareText },
  { label: "Founding Clients", href: "/admin/founding-codes", icon: Star },
];

const SUPER_ADMIN_EMAIL = "ceo@andykgroup.com";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const isCeo = user?.email === SUPER_ADMIN_EMAIL;

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-background border-r border-grid-300">
      {/* Logo */}
      <div className="px-6 py-5 shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/images/adam-logo.png" alt="A.D.A.M." style={{ height: "40px", width: "auto" }} />
          <div>
            <p className="text-foreground font-bold text-base tracking-tight leading-none">A.D.A.M.</p>
            <p className="label-mono mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      <div className="mx-4 h-px bg-grid-300 shrink-0" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <p className="label-mono px-3 mb-2">Navigation</p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all mb-0.5 rounded-lg border-l-2",
                isActive
                  ? "bg-[rgba(47,158,154,0.08)] text-highlight border-l-highlight"
                  : "text-foreground border-l-transparent hover:bg-[rgba(47,158,154,0.05)]"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-highlight" : "text-[#525a70]"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isCeo && (
        <>
          <div className="mx-4 h-px bg-grid-300 shrink-0" />
          <div className="px-3 py-3 shrink-0">
            <p className="label-mono px-3 mb-2">CEO Access</p>
            <Link
              href="/super-admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all mb-0.5 rounded-lg border-l-2",
                pathname.startsWith("/super-admin")
                  ? "bg-[rgba(47,158,154,0.08)] text-highlight border-l-highlight"
                  : "text-foreground border-l-transparent hover:bg-[rgba(47,158,154,0.05)]"
              )}
            >
              <Shield
                className={cn(
                  "h-4 w-4 shrink-0",
                  pathname.startsWith("/super-admin") ? "text-highlight" : "text-[#2F9E9A]"
                )}
              />
              Super Admin
            </Link>
          </div>
        </>
      )}

      <div className="mx-4 h-px bg-grid-300 shrink-0" />

      {/* Sign out */}
      <div className="p-3 shrink-0">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#525a70] hover:text-highlight transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
