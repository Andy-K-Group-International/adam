"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth-signout";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  User,
  Lightbulb,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Proposals", href: "/dashboard/proposals", icon: Lightbulb },
  { label: "Contracts", href: "/dashboard/contracts", icon: FileText },
  { label: "Documents", href: "/dashboard/documents", icon: FolderOpen },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen sticky top-0 bg-foreground flex flex-col">
      {/* Top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-highlight/60 to-transparent shrink-0" />

      {/* Logo */}
      <div className="px-6 py-5 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/adam-logo-simple-no-bg.png"
            alt="A.D.A.M."
            width={34}
            height={34}
            className="opacity-90"
          />
          <div>
            <p className="text-white font-bold text-base tracking-tight leading-none">A.D.A.M.</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 mt-0.5">Client Dashboard</p>
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
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
