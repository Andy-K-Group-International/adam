"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth-signout";
import { usePreviewContext } from "@/lib/preview-context";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  User,
  Lightbulb,
  Receipt,
  LogOut,
  CheckSquare,
  BarChart2,
  ArrowLeft,
} from "lucide-react";

const BASE_NAV = [
  { label: "Overview",   href: "/dashboard",            icon: LayoutDashboard },
  { label: "Milestones", href: "/dashboard/milestones", icon: CheckSquare },
  { label: "Reports",    href: "/dashboard/reports",    icon: BarChart2 },
  { label: "Proposals",  href: "/dashboard/proposals",  icon: Lightbulb },
  { label: "Contracts",  href: "/dashboard/contracts",  icon: FileText },
  { label: "Invoices",   href: "/dashboard/invoices",   icon: Receipt },
  { label: "Documents",  href: "/dashboard/documents",  icon: FolderOpen },
  { label: "Profile",    href: "/dashboard/profile",    icon: User },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isPreview, previewClientId } = usePreviewContext();

  // In preview mode, all nav links carry ?preview=clientId so the param
  // survives page-to-page navigation within the dashboard.
  const navItems = BASE_NAV.map((item) => ({
    ...item,
    href: isPreview && previewClientId
      ? `${item.href}?preview=${previewClientId}`
      : item.href,
  }));

  const handleExitPreview = () => {
    router.push(previewClientId ? `/admin/clients/${previewClientId}` : "/admin");
  };

  return (
    <aside className="w-64 min-h-screen sticky top-0 flex flex-col bg-background border-r border-grid-300">
      {/* Logo */}
      <div className="px-6 py-5 shrink-0">
        <Link href={navItems[0].href} className="flex items-center gap-2">
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{ mixBlendMode: "screen", height: "40px", width: "auto" }}
          >
            <source src="/images/adam-logo.mp4" type="video/mp4" />
            <img src="/images/adam-logo.png" alt="A.D.A.M." width={34} height={34} />
          </video>
          <div>
            <p className="text-foreground font-bold text-base tracking-tight leading-none">A.D.A.M.</p>
            <p className="label-mono mt-0.5">
              {isPreview ? "Preview Mode" : "Client Dashboard"}
            </p>
          </div>
        </Link>
      </div>

      <div className="mx-4 h-px bg-grid-300 shrink-0" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <p className="label-mono px-3 mb-2">Navigation</p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href.split("?")[0] ||
            (item.href.split("?")[0] !== "/dashboard" &&
              pathname.startsWith(item.href.split("?")[0]));
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

      {/* Bottom action — Exit Preview or Sign Out */}
      <div className="p-3 shrink-0">
        {isPreview ? (
          <button
            onClick={handleExitPreview}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-warning hover:bg-warning/8 transition-all"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Exit Preview
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#525a70] hover:text-highlight transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
