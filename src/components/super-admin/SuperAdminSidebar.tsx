"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth-signout";
import {
  LayoutDashboard,
  ClipboardList,
  Star,
  Key,
  Building2,
  LogOut,
  ArrowLeft,
  Shield,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",        href: "/super-admin",                   icon: LayoutDashboard },
  { label: "Applications",     href: "/super-admin/applications",      icon: ClipboardList },
  { label: "Founding Clients", href: "/super-admin/founding-clients",  icon: Star },
  { label: "Licenses",         href: "/super-admin/licenses",          icon: Key },
  { label: "Companies",        href: "/super-admin/companies",         icon: Building2 },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-background border-r border-grid-300">
      {/* Logo */}
      <div className="px-6 py-5 shrink-0">
        <Link href="/super-admin" className="flex items-center gap-2">
          <img src="/images/adam-logo.png" alt="A.D.A.M." style={{ height: "40px", width: "auto" }} />
          <div>
            <p className="text-foreground font-bold text-base tracking-tight leading-none">A.D.A.M.</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#2F9E9A] mt-0.5">
              Super Admin
            </p>
          </div>
        </Link>
      </div>

      <div className="mx-4 h-px bg-grid-300 shrink-0" />

      {/* Badge */}
      <div className="px-5 py-3 shrink-0">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#2F9E9A] bg-[rgba(47,158,154,0.08)] border border-[rgba(47,158,154,0.25)] px-3 py-1.5 rounded-lg">
          <Shield className="h-3 w-3" />
          CEO Access
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="label-mono px-3 mb-2">Navigation</p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/super-admin" && pathname.startsWith(item.href));
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

      <div className="mx-4 h-px bg-grid-300 shrink-0" />

      {/* Back to Admin + Sign out */}
      <div className="p-3 space-y-0.5 shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-2 hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to Admin
        </Link>
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
