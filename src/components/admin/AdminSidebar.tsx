"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth-signout";
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
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pipeline", href: "/admin/pipeline", icon: GitBranch },
  { label: "Leads", href: "/admin/leads", icon: Target },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Proposals", href: "/admin/proposals", icon: Lightbulb },
  { label: "Contracts", href: "/admin/contracts", icon: FileText },
  { label: "Invoices", href: "/admin/invoices", icon: Receipt },
  { label: "Reports", href: "/admin/reports", icon: BarChart2 },
  { label: "Questionnaires", href: "/admin/questionnaires", icon: ClipboardList },
  { label: "Questions", href: "/admin/questions", icon: MessageSquareText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-background border-r border-grid-300">
      {/* Logo */}
      <div className="px-6 py-5 shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/adam-logo-simple-no-bg.png"
            alt="A.D.A.M."
            width={34}
            height={34}
          />
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
                  ? "bg-[rgba(201,112,125,0.08)] text-highlight border-l-highlight"
                  : "text-foreground border-l-transparent hover:bg-[rgba(201,112,125,0.05)]"
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
