"use client";

import Link from "next/link";
import { Shield, Briefcase, ArrowRight } from "lucide-react";

export default function AccessPortal() {
  return (
    <section id="access" className="py-20 px-8 bg-background">
      <div className="max-w-[1200px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="label-mono mb-3 block">Platform Access</span>
          <h2 className="text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-3">
            Your Access Portal
          </h2>
          <p className="text-base text-muted font-light">
            Select your access level to continue
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[680px] mx-auto">

          {/* Admin card — dark */}
          <div
            className="rounded-2xl p-8 flex flex-col"
            style={{ backgroundColor: "#0E282D" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 shrink-0"
              style={{ backgroundColor: "rgba(47,158,154,0.12)" }}
            >
              <Shield className="h-5 w-5" style={{ color: "#2F9E9A" }} />
            </div>

            <div className="flex-1">
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: "#2F9E9A" }}
              >
                Team Access
              </p>
              <h3
                className="text-lg font-serif font-semibold mb-3"
                style={{ color: "#f0f4f4" }}
              >
                Admin Panel
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#4a4a72" }}>
                Andy&apos;K Group team access. Manage clients, proposals,
                contracts and operations.
              </p>
            </div>

            <Link
              href="/sign-in?role=admin"
              className="mt-8 inline-flex items-center justify-center gap-2 h-11 px-5 text-sm font-medium rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#f0f4f4", color: "#0E282D" }}
            >
              Admin Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Client card — light */}
          <div className="rounded-2xl p-8 border border-grid-300 bg-white flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center mb-6 shrink-0">
              <Briefcase className="h-5 w-5 text-foreground" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-2 mb-2">
                Client Access
              </p>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-3">
                Client Portal
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Access your proposals, contracts, invoices and implementation
                progress.
              </p>
            </div>

            <Link
              href="/sign-in?role=client"
              className="mt-8 inline-flex items-center justify-center gap-2 h-11 px-5 text-sm font-medium rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0E282D", color: "#f0f4f4" }}
            >
              Client Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
