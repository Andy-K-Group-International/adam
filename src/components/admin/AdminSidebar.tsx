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
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pipeline", href: "/admin/pipeline", icon: GitBranch },
  { label: "Leads", href: "/admin/leads", icon: Target },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Proposals", href: "/admin/proposals", icon: Lightbulb },
  { label: "Contracts", href: "/admin/contracts", icon: FileText },
  { label: "Questionnaires", href: "/admin/questionnaires", icon: ClipboardList },
  { label: "Questions", href: "/admin/questions", icon: MessageSquareText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 bg-foreground flex flex-col">
      {/* Top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-highlight/60 to-transparent shrink-0" />

      {/* Logo */}
      <div className="px-6 py-5 shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/adam-logo-simple-no-bg.png"
            alt="A.D.A.M."
            width={34}
            height={34}
            className="opacity-90"
          />
          <div>
            <p className="text-white font-bold text-base tracking-tight leading-none">A.D.A.M.</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      <div className="mx-4 h-px bg-white/6 shrink-0" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <p className="label-mono px-3 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Navigation</p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5",
                isActive
                  ? "bg-highlight/15 text-highlight border border-highlight/20"
                  : "text-white/55 hover:text-white/85 hover:bg-white/6 border border-transparent"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 h-px bg-white/6 shrink-0" />

      {/* Sign out */}
      <div className="p-3 shrink-0">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/45 hover:text-white/70 hover:bg-white/6 transition-all border border-transparent"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
