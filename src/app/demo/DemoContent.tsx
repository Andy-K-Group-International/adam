"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// ── Section config ──────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "overview",   label: "Overview" },
  { id: "leads",      label: "Lead Capture" },
  { id: "pipeline",   label: "Pipeline" },
  { id: "proposals",  label: "Proposals" },
  { id: "contracts",  label: "Contracts" },
  { id: "invoices",   label: "Invoices" },
  { id: "portal",     label: "Client Portal" },
  { id: "reporting",  label: "Reporting" },
  { id: "notes",      label: "Collaboration" },
  { id: "strategy",   label: "Strategy" },
  { id: "kyc",        label: "KYC & Compliance" },
  { id: "health",     label: "Health Score" },
  { id: "analytics",  label: "Analytics" },
  { id: "cta",        label: "Get Started" },
];

// ── Nav dots ────────────────────────────────────────────────────────────────

function NavDots({ active }: { active: string }) {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-2.5 hidden lg:flex">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          title={s.label}
          className="group flex items-center gap-2 justify-end"
        >
          <span className={cn(
            "text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-muted-2 whitespace-nowrap",
            active === s.id && "opacity-100 text-highlight"
          )}>
            {s.label}
          </span>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full transition-all duration-200",
            active === s.id ? "bg-highlight scale-125" : "bg-grid-500 hover:bg-highlight/50"
          )} />
        </button>
      ))}
    </div>
  );
}

// ── Shared components ───────────────────────────────────────────────────────

function SectionWrapper({ id, dark = false, children }: { id: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className={cn(
        "min-h-screen flex flex-col justify-center px-6 lg:px-16 py-24",
        dark ? "bg-foreground" : "bg-background"
      )}
    >
      <div className="max-w-5xl mx-auto w-full">{children}</div>
    </section>
  );
}

function SectionLabel({ label, dark = false }: { label: string; dark?: boolean }) {
  return <p className={cn("label-mono mb-3", dark ? "text-highlight" : "text-highlight")}>{label}</p>;
}

function SectionHeadline({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 className={cn(
      "font-serif text-4xl lg:text-5xl font-semibold tracking-tight mb-4 leading-[1.15]",
      dark ? "text-white" : "text-foreground"
    )}>
      {children}
    </h2>
  );
}

function SectionSub({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={cn("text-lg leading-relaxed mb-10 max-w-xl", dark ? "text-white/60" : "text-muted")}>
      {children}
    </p>
  );
}

function MockCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-grid-300 shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
}

function MockBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={cn("inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full", color)}>
      {children}
    </span>
  );
}

function StatCard({ value, label, delta }: { value: string; label: string; delta?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-grid-300 p-5">
      <p className="text-2xl font-serif font-bold text-foreground mb-0.5">{value}</p>
      <p className="text-xs text-muted-2 font-mono uppercase tracking-wider">{label}</p>
      {delta && <p className="text-xs text-success mt-1.5">{delta}</p>}
    </div>
  );
}

// ── Visibility badge ────────────────────────────────────────────────────────

type Visibility = "operational" | "legal" | "implementation" | "billing" | "onboarding" | "escalation";
const VIS_CFG: Record<Visibility, { label: string; color: string; bg: string }> = {
  operational:    { label: "Operational",    color: "#525a70", bg: "#f1efe9" },
  legal:          { label: "Legal",          color: "#7c3aed", bg: "#f5f3ff" },
  implementation: { label: "Implementation", color: "#16a34a", bg: "#f0fdf4" },
  billing:        { label: "Billing",        color: "#d97706", bg: "#fffbeb" },
  onboarding:     { label: "Onboarding",     color: "#0369a1", bg: "#f0f9ff" },
  escalation:     { label: "Escalation",     color: "#dc2626", bg: "#fef2f2" },
};

function VisBadge({ v }: { v: Visibility }) {
  const c = VIS_CFG[v];
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
}

// ── Revenue chart data ──────────────────────────────────────────────────────

const revenueData = [
  { month: "Dec", revenue: 7800 },
  { month: "Jan", revenue: 11200 },
  { month: "Feb", revenue: 9600 },
  { month: "Mar", revenue: 14300 },
  { month: "Apr", revenue: 16800 },
  { month: "May", revenue: 21400 },
];

const monthlyData = [
  { week: "W1", revenue: 2800 },
  { week: "W2", revenue: 3650 },
  { week: "W3", revenue: 3200 },
  { week: "W4", revenue: 2800 },
];

// ── Main component ──────────────────────────────────────────────────────────

export default function DemoContent({ name, company }: { name: string; company: string }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [portalTab, setPortalTab] = useState<"milestones" | "documents" | "activity" | "reports" | "kyc">("milestones");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="relative">
      <NavDots active={activeSection} />

      {/* ── HERO HEADER ───────────────────────────────────────────────────── */}
      <div className="relative bg-background overflow-hidden">
        <div className="absolute inset-0 cartesian-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
          <div className="flex items-center gap-3 mb-8">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#01011b" strokeWidth="4" fill="none" />
              <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#c9707d" strokeWidth="3" fill="none" />
              <text x="50" y="57" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="#01011b">A</text>
            </svg>
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-2">Confidential · Private Demo</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-highlight/8 border border-highlight/20 text-highlight text-xs font-mono px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-highlight animate-pulse" />
            NDA Protected
          </div>
          <h1 className="font-serif text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.1] mb-5">
            Welcome to A.D.A.M.
            <br />
            <span className="italic font-light text-highlight">Your Private Demo</span>
          </h1>
          <p className="text-xl text-muted leading-relaxed max-w-2xl mb-8">
            Here&apos;s how A.D.A.M. transforms your business operations — from first client contact to signed contract, automated invoicing, collaboration, strategy, compliance, and beyond.
          </p>
          {name && (
            <p className="text-sm text-muted-2 font-mono">
              Prepared for <span className="text-foreground font-semibold">{name}</span>
              {company && <> · <span className="text-foreground">{company}</span></>}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
                className="h-8 px-3 rounded-lg border border-grid-500 text-xs text-muted hover:text-highlight hover:border-highlight/40 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 1: OVERVIEW ───────────────────────────────────────────── */}
      <SectionWrapper id="overview">
        <SectionLabel label="01 · Overview" />
        <SectionHeadline>One intelligent system.<br />Your entire client lifecycle.</SectionHeadline>
        <SectionSub>A.D.A.M. manages leads, proposals, strategies, contracts, invoicing, KYC, health scoring, and client collaboration — all in one place.</SectionSub>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard value="12" label="Active Clients" delta="↑ 3 this month" />
          <StatCard value="£284k" label="Pipeline Value" delta="↑ 18% MoM" />
          <StatCard value="3" label="Pending Actions" />
          <StatCard value="94%" label="Health Score" delta="Excellent" />
        </div>

        <MockCard>
          <div className="border-b border-grid-300 px-5 py-3 flex items-center justify-between bg-grid-300/20">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-2">Clients — All</span>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-error/40" />
              <div className="h-2 w-2 rounded-full bg-warning/40" />
              <div className="h-2 w-2 rounded-full bg-success/40" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grid-300">
                  {["Company", "Stage", "Health", "Pipeline Value", "Last Activity"].map((h) => (
                    <th key={h} className="text-left text-xs font-mono uppercase tracking-wider text-muted-2 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { co: "Nexora Group Ltd",  stage: "Contract",      stageCls: "bg-warning/10 text-warning",   health: "94 Excellent", hCls: "text-success", val: "£24,600" },
                  { co: "Summit Partners",   stage: "Proposal",      stageCls: "bg-info/10 text-info",          health: "82 Good",      hCls: "text-success", val: "£18,000" },
                  { co: "Atlas Ventures",    stage: "Strategy",      stageCls: "bg-highlight/10 text-highlight",health: "76 Good",      hCls: "text-success", val: "£36,000" },
                  { co: "Brightfield Co",    stage: "Questionnaire", stageCls: "bg-grid-300 text-muted",        health: "—",            hCls: "text-muted-2", val: "—" },
                ].map((row) => (
                  <tr key={row.co} className="border-b border-grid-300 last:border-0 hover:bg-grid-300/10">
                    <td className="px-5 py-3.5 font-medium text-foreground">{row.co}</td>
                    <td className="px-5 py-3.5"><MockBadge color={row.stageCls}>{row.stage}</MockBadge></td>
                    <td className={cn("px-5 py-3.5 text-sm font-medium", row.hCls)}>{row.health}</td>
                    <td className="px-5 py-3.5 text-foreground font-mono text-sm">{row.val}</td>
                    <td className="px-5 py-3.5 text-muted-2 text-xs">2h ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MockCard>
      </SectionWrapper>

      {/* ── SECTION 2: LEAD CAPTURE ───────────────────────────────────────── */}
      <SectionWrapper id="leads" dark>
        <SectionLabel label="02 · Lead Capture" />
        <SectionHeadline dark>Only qualified leads<br />enter your pipeline.</SectionHeadline>
        <SectionSub dark>Clients apply through your branded gateway. A.D.A.M. scores every submission automatically — so you only speak to the right people.</SectionSub>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-6 w-6 rounded-md bg-highlight/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-highlight" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-white/60 text-xs font-mono uppercase tracking-wider">Pre-qualification Form</span>
            </div>
            {[
              { label: "Company Name",        val: "Nexora Group Ltd" },
              { label: "Annual Revenue",       val: "£2M – £10M" },
              { label: "Primary Market",       val: "B2G / Government" },
              { label: "Decision Timeline",    val: "Within 3 months" },
              { label: "Decision Authority",   val: "Yes — I'm the CEO" },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-white/40 font-mono mb-1">{f.label}</p>
                <div className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 flex items-center text-sm text-white/80">{f.val}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-1">AI Lead Score</p>
                  <p className="text-white font-semibold text-lg">Nexora Group Ltd</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-serif font-bold text-highlight">85</p>
                  <p className="text-xs text-white/40 font-mono">/100</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/10 mb-5">
                <div className="h-2 rounded-full bg-highlight" style={{ width: "85%" }} />
              </div>
              <div className="space-y-3">
                {[
                  { label: "Revenue Band",        score: 20, max: 25 },
                  { label: "Decision Authority",  score: 25, max: 25 },
                  { label: "Timeline",            score: 20, max: 25 },
                  { label: "Market Fit",          score: 20, max: 25 },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="text-xs text-white/40 w-36 shrink-0 font-mono">{r.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/10">
                      <div className="h-1.5 rounded-full bg-highlight/60" style={{ width: `${(r.score / r.max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-white/40 font-mono w-10 text-right">{r.score}/{r.max}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-success/20 bg-success/8 p-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-success" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-success">Qualified — Proceed</p>
                <p className="text-xs text-success/70">AI recommendation: create client record</p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── SECTION 3: PIPELINE ───────────────────────────────────────────── */}
      <SectionWrapper id="pipeline">
        <SectionLabel label="03 · Pipeline Board" />
        <SectionHeadline>See your entire pipeline<br />at a glance.</SectionHeadline>
        <SectionSub>Drag clients between stages. Every action is logged. Nothing falls through the cracks.</SectionSub>

        <MockCard>
          <div className="border-b border-grid-300 px-5 py-3 flex items-center gap-2 bg-grid-300/20">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-2">Pipeline — Active</span>
          </div>
          <div className="grid grid-cols-5 divide-x divide-grid-300 overflow-x-auto">
            {[
              {
                stage: "Questionnaire", color: "text-muted", count: 1,
                clients: [{ name: "Brightfield Co", info: "Applied 3d ago", score: "72" }],
              },
              {
                stage: "Proposal", color: "text-info", count: 1,
                clients: [{ name: "Summit Partners", info: "£18,000/yr", score: "79" }],
              },
              {
                stage: "NDA", color: "text-purple-500", count: 1,
                clients: [{ name: "Orion Systems", info: "NDA pending", score: "81" }],
              },
              {
                stage: "Contract", color: "text-warning", count: 2,
                clients: [
                  { name: "Nexora Group Ltd", info: "£24,600/yr", score: "94" },
                  { name: "Atlas Ventures",   info: "£36,000/yr", score: "82" },
                ],
              },
              {
                stage: "Kickoff", color: "text-success", count: 1,
                clients: [{ name: "Meridian Corp", info: "Kicked off May 2025", score: "96" }],
              },
            ].map((col) => (
              <div key={col.stage} className="p-4 min-w-[160px]">
                <div className="flex items-center justify-between mb-4">
                  <span className={cn("text-xs font-mono uppercase tracking-wider", col.color)}>{col.stage}</span>
                  <span className="text-xs bg-grid-300 text-muted-2 px-1.5 py-0.5 rounded font-mono">{col.count}</span>
                </div>
                <div className="space-y-2.5">
                  {col.clients.map((c) => (
                    <div key={c.name} className="bg-white rounded-xl border border-grid-300 p-3 shadow-sm">
                      <p className="text-sm font-medium text-foreground mb-1">{c.name}</p>
                      <p className="text-xs text-muted-2 mb-2">{c.info}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1 rounded-full bg-grid-300">
                          <div className="h-1 rounded-full bg-success" style={{ width: `${c.score}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-2 font-mono">{c.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MockCard>
      </SectionWrapper>

      {/* ── SECTION 4: PROPOSALS ──────────────────────────────────────────── */}
      <SectionWrapper id="proposals" dark>
        <SectionLabel label="04 · Proposals" />
        <SectionHeadline dark>AI-generated proposals<br />in minutes.</SectionHeadline>
        <SectionSub dark>A.D.A.M. generates professional proposals from your client&apos;s questionnaire data. Editable, beautiful, and ready to send.</SectionSub>

        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-highlight/20 flex items-center justify-center">
                <svg viewBox="0 0 100 100" fill="none" className="h-5 w-5">
                  <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#c9707d" strokeWidth="6" fill="none" />
                  <text x="50" y="60" textAnchor="middle" fontFamily="Georgia,serif" fontSize="30" fontWeight="700" fill="#c9707d">A</text>
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Proposal — Nexora Group Ltd</p>
                <p className="text-white/40 text-xs font-mono">AK-2025-PRO-0042 · Valid 30 days</p>
              </div>
            </div>
            <MockBadge color="bg-success/20 text-success">Confirmed</MockBadge>
          </div>

          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            <div className="p-6 space-y-5">
              {[
                {
                  title: "Executive Summary",
                  content: "Nexora Group Ltd operates in a high-value B2G procurement environment where responsiveness, compliance, and relationship depth determine contract wins. A.D.A.M. is purpose-built to systematise exactly these capabilities.",
                },
                {
                  title: "Recommended Services",
                  content: "End-to-End Business Development — Full lifecycle management including CPV code analysis, tender monitoring, proposal preparation, and contract management across EU and UK government procurement frameworks.",
                },
                {
                  title: "Market Analysis",
                  content: "Your target segments (ICT, Professional Services) represent £4.2B in annual UK government spend. A structured BD approach yields 3–5× improvement in win rate within 18 months.",
                },
              ].map((s) => (
                <div key={s.title} className="border-b border-white/8 pb-5 last:border-0 last:pb-0">
                  <p className="text-xs font-mono uppercase tracking-wider text-highlight mb-2">{s.title}</p>
                  <p className="text-sm text-white/70 leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>

            <div className="p-6">
              <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">Investment Overview</p>
              <div className="space-y-3 mb-6">
                {[
                  { item: "End-to-End Business Development", price: "£1,299/mo", type: "Recurring" },
                  { item: "Onboarding & Strategy Session",   price: "£1,500",    type: "One-time" },
                  { item: "Market Analysis Report",          price: "£750",      type: "One-time" },
                ].map((r) => (
                  <div key={r.item} className="flex items-start justify-between gap-4 py-3 border-b border-white/8 last:border-0">
                    <div>
                      <p className="text-sm text-white/80">{r.item}</p>
                      <p className="text-xs text-white/30 font-mono">{r.type}</p>
                    </div>
                    <p className="text-sm font-semibold text-white shrink-0 font-mono">{r.price}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-highlight/15 border border-highlight/20 p-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-white/50 font-mono">Monthly</span>
                  <span className="font-mono font-bold text-white text-xl">£1,299</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-white/50 font-mono">One-time setup</span>
                  <span className="font-mono text-white/70">£2,250</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-white/40 font-mono">Payment Terms: 30 days · Currency: GBP</p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── SECTION 5: CONTRACTS ──────────────────────────────────────────── */}
      <SectionWrapper id="contracts">
        <SectionLabel label="05 · Contracts" />
        <SectionHeadline>Digital contracts with<br />full audit trail.</SectionHeadline>
        <SectionSub>From draft to countersigned — every action is timestamped. Clients sign online, admins countersign, and the final PDF is stored automatically.</SectionSub>

        <MockCard>
          <div className="border-b border-grid-300 px-6 py-4 flex items-center justify-between bg-grid-300/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground">Nexora Group Ltd — End-to-End Agreement</p>
                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-highlight/10 text-highlight uppercase tracking-wider">End-to-End</span>
                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-info/10 text-info uppercase tracking-wider">Service Agreement</span>
              </div>
              <p className="text-xs text-muted-2 font-mono">AK-2025-CON-0017 · v1</p>
            </div>
            <MockBadge color="bg-success/10 text-success">Final</MockBadge>
          </div>

          <div className="px-6 py-8">
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 right-3.5 h-px bg-grid-300" />
              <div className="grid grid-cols-4 gap-4 relative">
                {[
                  { label: "Created",       date: "1 May 2025",  done: true },
                  { label: "Published",     date: "3 May 2025",  done: true },
                  { label: "Client Signed", date: "14 May 2025", done: true },
                  { label: "Countersigned", date: "14 May 2025", done: true },
                ].map((step, i) => (
                  <div key={step.label} className="flex flex-col items-center text-center">
                    <div className={cn(
                      "h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs mb-3 relative z-10",
                      step.done ? "bg-success border-success text-white" : "bg-white border-grid-500 text-muted-2"
                    )}>
                      {step.done ? (
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : i + 1}
                    </div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">{step.label}</p>
                    <p className="text-[10px] text-muted-2 font-mono">{step.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-grid-300 border-t border-grid-300">
            {[
              { role: "Client Signature",           name: "James Meridith",  date: "14 May 2025, 11:42 BST", company: "Nexora Group Ltd" },
              { role: "Andy’K Group Signature", name: "Andrej Kneisl",   date: "14 May 2025, 14:18 BST", company: "Andy’K Group International LTD" },
            ].map((sig) => (
              <div key={sig.role} className="p-5">
                <p className="text-xs text-muted-2 font-mono uppercase tracking-wider mb-2">{sig.role}</p>
                <p className="font-serif italic text-xl text-foreground mb-1">{sig.name}</p>
                <p className="text-xs text-muted-2">{sig.company}</p>
                <p className="text-xs text-success font-mono mt-1">✓ {sig.date}</p>
              </div>
            ))}
          </div>
        </MockCard>
      </SectionWrapper>

      {/* ── SECTION 6: INVOICES ───────────────────────────────────────────── */}
      <SectionWrapper id="invoices" dark>
        <SectionLabel label="06 · Invoices" />
        <SectionHeadline dark>Automated invoicing<br />with payment tracking.</SectionHeadline>
        <SectionSub dark>Invoices are generated from contract data and sent automatically. Payment status is tracked in real time — no chasing.</SectionSub>

        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg viewBox="0 0 100 100" fill="none" className="h-7 w-7">
                    <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#c9707d" strokeWidth="6" fill="none" />
                    <text x="50" y="60" textAnchor="middle" fontFamily="Georgia,serif" fontSize="30" fontWeight="700" fill="#c9707d">A</text>
                  </svg>
                  <div>
                    <p className="text-white text-xs font-bold">A.D.A.M.</p>
                    <p className="text-white/30 text-[10px] font-mono">Andy&apos;K Group International LTD</p>
                  </div>
                </div>
                <p className="text-white/40 text-[10px] font-mono">86-90 Paul Street, London EC2A 4NE</p>
                <p className="text-white/40 text-[10px] font-mono">Reg: 16453500</p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-xs font-mono mb-1">INVOICE</p>
                <p className="text-white font-mono font-bold">AK-2025-0001-INV-001</p>
                <p className="text-white/40 text-xs font-mono mt-1">Due: 31 May 2025</p>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-white/10 grid grid-cols-2">
              <div>
                <p className="text-white/30 text-[10px] font-mono uppercase mb-1">Billed To</p>
                <p className="text-white text-sm font-semibold">Nexora Group Ltd</p>
                <p className="text-white/50 text-xs">James Meridith · CFO</p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-[10px] font-mono uppercase mb-1">Issue Date</p>
                <p className="text-white text-sm">1 May 2025</p>
              </div>
            </div>

            <div className="px-6 py-4 space-y-2 border-b border-white/10">
              {[
                { desc: "End-to-End Business Development", price: "£1,299.00" },
                { desc: "VAT (20%)",                       price: "£259.80" },
              ].map((r) => (
                <div key={r.desc} className="flex justify-between text-sm">
                  <span className="text-white/60">{r.desc}</span>
                  <span className="text-white font-mono">{r.price}</span>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-white/30 text-[10px] font-mono uppercase">Total Due</p>
                <p className="text-2xl font-serif font-bold text-white">£1,558.80</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <MockBadge color="bg-success/20 text-success">✓ Paid</MockBadge>
                <p className="text-xs text-white/30 font-mono">12 May 2025</p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── SECTION 7: CLIENT PORTAL ──────────────────────────────────────── */}
      <SectionWrapper id="portal">
        <SectionLabel label="07 · Client Portal" />
        <SectionHeadline>Your clients get a<br />premium private portal.</SectionHeadline>
        <SectionSub>Every client gets their own secure dashboard — milestones, reports, contracts, invoices, documents, and KYC. No email threads, no confusion.</SectionSub>

        <MockCard>
          {/* Portal header */}
          <div className="border-b border-grid-300 bg-foreground px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 100 100" fill="none" className="h-6 w-6">
                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="white" strokeWidth="6" fill="none" />
                <text x="50" y="60" textAnchor="middle" fontFamily="Georgia,serif" fontSize="30" fontWeight="700" fill="white">A</text>
              </svg>
              <span className="text-white text-sm font-semibold">A.D.A.M.</span>
              <span className="text-white/30 text-xs font-mono">Client Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 font-mono">Nexora Group Ltd</span>
              <div className="h-7 w-7 rounded-full bg-highlight/20 flex items-center justify-center text-xs text-highlight font-bold">N</div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-grid-300 bg-grid-300/10 px-4 overflow-x-auto">
            {(["milestones", "documents", "reports", "activity", "kyc"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setPortalTab(tab)}
                className={cn(
                  "px-4 py-3 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors capitalize",
                  portalTab === tab
                    ? "border-highlight text-highlight"
                    : "border-transparent text-muted-2 hover:text-foreground"
                )}
              >
                {tab === "kyc" ? "KYC" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {portalTab === "milestones" && (
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-2 mb-1.5">
                  <span>Overall Progress</span><span>3/5 completed</span>
                </div>
                <div className="h-2 rounded-full bg-grid-300">
                  <div className="h-2 rounded-full bg-highlight" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { title: "Initial Strategy Call",    done: true,  date: "8 May" },
                  { title: "Market Analysis Delivered", done: true,  date: "15 May" },
                  { title: "First Tender Submitted",    done: true,  date: "22 May" },
                  { title: "Q2 Pipeline Review",        done: false, date: "15 Jun" },
                  { title: "First Contract Win",        done: false, date: "TBD" },
                ].map((m) => (
                  <div key={m.title} className="flex items-center gap-3 py-2 border-b border-grid-300 last:border-0">
                    <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0", m.done ? "bg-success border-success" : "border-grid-500")}>
                      {m.done && <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <span className={cn("text-sm flex-1", m.done ? "text-muted-2 line-through" : "text-foreground")}>{m.title}</span>
                    <span className="text-xs text-muted-2 font-mono">{m.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {portalTab === "documents" && (
            <div className="p-6 space-y-2.5">
              {[
                { name: "Service Agreement",      type: "Contract", badge: "bg-success/10 text-success", status: "Final" },
                { name: "Market Analysis Report", type: "Strategy", badge: "bg-highlight/10 text-highlight", status: "Delivered" },
                { name: "May 2025 Report",         type: "Monthly", badge: "bg-info/10 text-info", status: "New" },
                { name: "Invoice #001",            type: "Invoice", badge: "bg-success/10 text-success", status: "Paid" },
              ].map((d) => (
                <div key={d.name} className="flex items-center gap-3 py-2 border-b border-grid-300 last:border-0">
                  <div className="h-8 w-8 rounded-lg bg-grid-300 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-muted-2" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{d.name}</p>
                    <p className="text-[10px] text-muted-2 font-mono">{d.type}</p>
                  </div>
                  <MockBadge color={d.badge}>{d.status}</MockBadge>
                </div>
              ))}
            </div>
          )}

          {portalTab === "reports" && (
            <div className="p-6">
              <p className="label-mono mb-4">Monthly Reports</p>
              <div className="space-y-2.5">
                {[
                  { title: "May 2025 — Monthly Report",   date: "1 Jun 2025",  badge: "bg-info/10 text-info",       status: "New" },
                  { title: "Apr 2025 — Monthly Report",   date: "1 May 2025",  badge: "bg-success/10 text-success", status: "Read" },
                  { title: "Mar 2025 — Monthly Report",   date: "1 Apr 2025",  badge: "bg-success/10 text-success", status: "Read" },
                  { title: "Q1 2025 — Quarterly Review",  date: "15 Apr 2025", badge: "bg-highlight/10 text-highlight", status: "Delivered" },
                ].map((r) => (
                  <div key={r.title} className="flex items-center justify-between py-2 border-b border-grid-300 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.title}</p>
                      <p className="text-[10px] text-muted-2 font-mono">{r.date}</p>
                    </div>
                    <MockBadge color={r.badge}>{r.status}</MockBadge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {portalTab === "activity" && (
            <div className="p-6 space-y-4">
              {[
                { label: "Monthly report published",  time: "2h ago",   icon: "📊" },
                { label: "Contract countersigned",    time: "14 May",   icon: "🔏" },
                { label: "Invoice paid — £1,558.80",  time: "12 May",   icon: "✅" },
                { label: "Strategy session completed", time: "8 May",   icon: "🎯" },
                { label: "NDA signed",                time: "1 May",    icon: "📋" },
              ].map((a) => (
                <div key={a.label} className="flex gap-3 text-sm">
                  <span className="text-base shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-foreground text-xs">{a.label}</p>
                    <p className="text-muted-2 text-[10px] font-mono">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {portalTab === "kyc" && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-success/5 border border-success/20">
                <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-success" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-success">KYC Verified</p>
                  <p className="text-xs text-success/70">Verified 15 May 2025 · Contract activation enabled</p>
                </div>
              </div>
              <p className="label-mono mb-3">Submitted Documents</p>
              <div className="space-y-2">
                {[
                  { name: "Company Registry Extract", date: "10 May 2025" },
                  { name: "Director ID / Passport",   date: "10 May 2025" },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center gap-3 py-2 border-b border-grid-300 last:border-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-muted-2 shrink-0" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm flex-1 text-foreground">{doc.name}</span>
                    <span className="text-[10px] text-muted-2 font-mono">{doc.date}</span>
                    <MockBadge color="bg-success/10 text-success">Verified</MockBadge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </MockCard>
      </SectionWrapper>

      {/* ── SECTION 8: REPORTING ──────────────────────────────────────────── */}
      <SectionWrapper id="reporting" dark>
        <SectionLabel label="08 · Reporting" />
        <SectionHeadline dark>Full operational visibility<br />in real time.</SectionHeadline>
        <SectionSub dark>Revenue trends, pipeline health, client scores, and activity summaries — all updated automatically, always current.</SectionSub>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-1">Revenue — Last 6 months</p>
            <p className="text-2xl font-serif font-bold text-white mb-5">£81,100 <span className="text-sm font-sans font-normal text-success">↑ 22%</span></p>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barCategoryGap="30%">
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v) => [`£${Number(v).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ background: "#1a1425", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                    itemStyle={{ color: "#c9707d" }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenueData.map((_, i) => (
                      <Cell key={i} fill={i === revenueData.length - 1 ? "#c9707d" : "rgba(201,112,125,0.3)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Pipeline Value",   val: "£284,000", sub: "4 active clients" },
                { label: "Conversion Rate",  val: "68%",      sub: "Leads → Clients" },
                { label: "Avg Deal Size",    val: "£21,600",  sub: "Annual contract" },
                { label: "Avg Close Time",   val: "34 days",  sub: "From lead to signed" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-serif font-bold text-white">{s.val}</p>
                  <p className="text-xs text-white/40 font-mono uppercase tracking-wider">{s.label}</p>
                  <p className="text-xs text-white/30 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-3">Client Health Distribution</p>
              <div className="space-y-2">
                {[
                  { label: "Excellent (80–100)", count: 8, color: "bg-success", pct: 67 },
                  { label: "Good (60–79)",        count: 3, color: "bg-info",    pct: 25 },
                  { label: "At Risk (40–59)",     count: 1, color: "bg-warning", pct: 8 },
                ].map((h) => (
                  <div key={h.label} className="flex items-center gap-3">
                    <span className="text-xs text-white/40 w-36 shrink-0">{h.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/10">
                      <div className={cn("h-1.5 rounded-full", h.color)} style={{ width: `${h.pct}%` }} />
                    </div>
                    <span className="text-xs text-white/50 font-mono w-4 text-right">{h.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── SECTION 9: INTERNAL NOTES & COLLABORATION ─────────────────────── */}
      <SectionWrapper id="notes">
        <SectionLabel label="09 · Collaboration" />
        <SectionHeadline>Internal notes and<br />client requests — built in.</SectionHeadline>
        <SectionSub>Admin teams track operational context with threaded internal notes. Clients submit change requests directly on documents. Everything is structured, not scattered.</SectionSub>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Internal Notes panel */}
          <MockCard>
            <div className="border-b border-grid-300 px-5 py-3 bg-grid-300/20 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-2">Internal Notes — Nexora Group Ltd</span>
              <span className="text-[10px] font-mono text-muted-2">3 notes</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Note 1 — pinned, operational */}
              <div className="rounded-lg border-l-[3px] border-l-highlight/50 border border-highlight/20 bg-[rgba(201,112,125,0.03)] px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">Andrej K.</span>
                    <span className="text-[10px] text-muted-2 font-mono">25 May 2025, 09:14</span>
                    <VisBadge v="operational" />
                    <span className="text-[10px] text-highlight font-semibold">📌 Pinned</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <div className="h-5 w-5 rounded bg-grid-300 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-muted-2" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    </div>
                    <div className="h-5 w-5 rounded bg-grid-300 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-muted-2" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground">Client confirmed budget approved for Phase 1. Ready to proceed.</p>
              </div>

              {/* Note 2 — legal */}
              <div className="rounded-lg border border-grid-300 bg-white px-4 py-3 border-l-[3px] border-l-highlight/50">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">Andrej K.</span>
                    <span className="text-[10px] text-muted-2 font-mono">24 May 2025, 14:30</span>
                    <VisBadge v="legal" />
                  </div>
                </div>
                <p className="text-sm text-foreground">Awaiting VAT registration confirmation from client.</p>
              </div>

              {/* Note 3 — implementation */}
              <div className="rounded-lg border border-grid-300 bg-white px-4 py-3 border-l-[3px] border-l-highlight/50">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">Andrej K.</span>
                    <span className="text-[10px] text-muted-2 font-mono">26 May 2025, 08:00</span>
                    <VisBadge v="implementation" />
                  </div>
                </div>
                <p className="text-sm text-foreground">Implementation delayed — missing access credentials. Follow up Monday.</p>
              </div>

              {/* Compose box */}
              <div className="rounded-lg border border-grid-300 bg-white">
                <div className="px-4 py-2.5 text-sm text-muted-2 text-xs italic">Add a note…</div>
                <div className="flex items-center justify-between px-3 py-2 border-t border-grid-300">
                  <span className="text-xs text-muted-2">Operational</span>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded bg-highlight text-white text-xs font-medium">Add Note</span>
                  </div>
                </div>
              </div>
            </div>
          </MockCard>

          {/* Client Request panel */}
          <MockCard>
            <div className="border-b border-grid-300 px-5 py-3 bg-grid-300/20">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-2">Client Request — Contract</span>
            </div>
            <div className="p-5">
              {/* Submitted request */}
              <div className="rounded-xl border border-grid-300 bg-white p-4 mb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#f0f9ff] text-[#0369a1]">
                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Acknowledged
                  </span>
                  <span className="text-[11px] text-muted-2 font-mono">20 May 2025</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-3">Please adjust the implementation timeline by 2 weeks.</p>
                <div className="border-t border-grid-300 pt-3">
                  <p className="text-[11px] text-muted-2 font-semibold uppercase tracking-wider mb-1.5">Response from Andy&apos;K Group</p>
                  <p className="text-sm text-foreground leading-relaxed">Timeline updated, new Phase 1 start: 1 June 2025.</p>
                  <p className="text-[11px] text-muted-2 mt-1.5 font-mono">22 May 2025</p>
                </div>
              </div>

              {/* Request form */}
              <div className="rounded-xl border border-grid-300 p-4">
                <p className="label-mono mb-3">Submit a New Request</p>
                <div className="mb-3">
                  <div className="h-20 rounded-lg border border-grid-300 bg-grid-300/10 px-3 py-2 text-xs text-muted-2 italic">Describe what you&apos;d like changed or clarified…</div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-2">We respond within 2 business days.</p>
                  <span className="px-4 py-2 rounded-lg bg-highlight text-white text-xs font-medium">Submit Request</span>
                </div>
              </div>
            </div>
          </MockCard>
        </div>
      </SectionWrapper>

      {/* ── SECTION 10: STRATEGY WORKSPACE ────────────────────────────────── */}
      <SectionWrapper id="strategy" dark>
        <SectionLabel label="10 · Strategy Workspace" />
        <SectionHeadline dark>Implementation blueprints<br />for every client.</SectionHeadline>
        <SectionSub dark>Each client gets a structured strategy document built from a professional template. Sections cover market position, priorities, roadmap, and KPIs.</SectionSub>

        <MockCard>
          <div className="border-b border-grid-300 px-6 py-4 bg-grid-300/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Nexora Group Ltd — Strategy</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-highlight/10 text-highlight uppercase tracking-wider">End-to-End</span>
                  <span className="text-[10px] text-muted-2 font-mono">Last updated 25 May 2025</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-highlight/40 text-highlight bg-white">
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Load Template
              </span>
              <MockBadge color="bg-success/10 text-success">Draft Ready</MockBadge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-grid-300">
            {[
              {
                title: "1. Executive Overview",
                content: "Nexora Group Ltd is a mid-market B2G services provider targeting central government ICT procurement. The engagement objective is to systematise their BD capability and achieve first tender award within 90 days.",
              },
              {
                title: "2. Current State Assessment",
                content: "Current BD activity is ad hoc. No formal CPV code mapping. Win rate on tenders below 15%. Team of 2 handling business development without dedicated tooling or process framework.",
              },
              {
                title: "3. Strategic Priorities",
                content: "Priority 1: CPV architecture and portal registration. Priority 2: Tender pipeline management. Priority 3: Bid/no-bid criteria framework. Priority 4: Compliance documentation baseline.",
              },
            ].map((s) => (
              <div key={s.title} className="p-5">
                <p className="text-xs font-mono uppercase tracking-wider text-highlight mb-2">{s.title}</p>
                <p className="text-sm text-muted leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          {/* Attached note */}
          <div className="border-t border-grid-300 px-6 py-4 bg-grid-300/10">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded bg-highlight/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-highlight" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-2 uppercase tracking-wider">Internal Note · Operational</span>
                <p className="text-xs text-foreground mt-0.5">Strategy draft approved internally. Ready for client review.</p>
              </div>
            </div>
          </div>
        </MockCard>
      </SectionWrapper>

      {/* ── SECTION 11: KYC & COMPLIANCE ──────────────────────────────────── */}
      <SectionWrapper id="kyc">
        <SectionLabel label="11 · KYC & Compliance" />
        <SectionHeadline>Identity verification<br />before activation.</SectionHeadline>
        <SectionSub>A.D.A.M. enforces KYC before any contract can be countersigned. Clients upload documents, admins verify, and the system unlocks automatically.</SectionSub>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* KYC status card */}
          <MockCard>
            <div className="border-b border-grid-300 px-5 py-3 bg-grid-300/20 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-2">KYC Status — Nexora Group Ltd</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20 mb-6">
                <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-success" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-success">KYC Verified</p>
                  <p className="text-sm text-success/70">Nexora Group Ltd · Verified 15 May 2025</p>
                  <p className="text-xs text-success/60 font-mono mt-0.5">Contract activation enabled ✓</p>
                </div>
              </div>

              <p className="label-mono mb-3">Verification Details</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Company Name",    val: "Nexora Group Ltd" },
                  { label: "Reg. Number",     val: "12345678" },
                  { label: "VAT Number",      val: "GB 987 654 321" },
                  { label: "Country",         val: "United Kingdom" },
                  { label: "Director",        val: "James Meridith" },
                  { label: "Verified By",     val: "Andrej K." },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between py-1.5 border-b border-grid-300 last:border-0">
                    <span className="text-muted-2 text-xs font-mono">{f.label}</span>
                    <span className="text-foreground text-xs font-medium">{f.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </MockCard>

          {/* Documents */}
          <MockCard>
            <div className="border-b border-grid-300 px-5 py-3 bg-grid-300/20">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-2">Submitted Documents</span>
            </div>
            <div className="p-6 space-y-4">
              {[
                { name: "Company Registry Extract", type: "registry_extract", uploaded: "10 May 2025", size: "1.2 MB" },
                { name: "Director ID / Passport",   type: "id_passport",      uploaded: "10 May 2025", size: "0.8 MB" },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center gap-4 p-4 rounded-xl border border-grid-300 bg-white">
                  <div className="h-10 w-10 rounded-lg bg-grid-300 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-muted-2" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-[10px] text-muted-2 font-mono">{doc.uploaded} · {doc.size}</p>
                  </div>
                  <MockBadge color="bg-success/10 text-success">✓ Verified</MockBadge>
                </div>
              ))}

              <div className="mt-6 p-4 rounded-xl bg-success/5 border border-success/20 flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-success shrink-0" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-success">Contract Activation Enabled</p>
                  <p className="text-xs text-success/70">KYC cleared — contract can be countersigned</p>
                </div>
              </div>
            </div>
          </MockCard>
        </div>
      </SectionWrapper>

      {/* ── SECTION 12: HEALTH SCORE & RISK ───────────────────────────────── */}
      <SectionWrapper id="health" dark>
        <SectionLabel label="12 · Health Score & Risk" />
        <SectionHeadline dark>Real-time client health<br />scoring and risk detection.</SectionHeadline>
        <SectionSub dark>A.D.A.M. calculates a health score for every active client based on engagement, payments, and implementation progress. Risk flags surface automatically.</SectionSub>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Score dial */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-1">Health Score</p>
                <p className="text-white font-semibold text-lg">Nexora Group Ltd</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-serif font-bold text-success">87</p>
                <p className="text-xs text-white/40 font-mono">/100 · Excellent</p>
              </div>
            </div>

            <div className="h-3 rounded-full bg-white/10 mb-6 overflow-hidden">
              <div className="h-3 rounded-full bg-gradient-to-r from-success/60 to-success" style={{ width: "87%" }} />
            </div>

            <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-3">Score Breakdown</p>
            <div className="space-y-3">
              {[
                { label: "Contract signed",    score: 25, max: 25, color: "bg-success" },
                { label: "Invoice paid",        score: 20, max: 25, color: "bg-success" },
                { label: "Proposal approved",   score: 15, max: 25, color: "bg-info" },
                { label: "Last activity today", score: 15, max: 25, color: "bg-info" },
                { label: "KYC verified",        score: 12, max: 20, color: "bg-success" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-40 shrink-0 font-mono">{r.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/10">
                    <div className={cn("h-1.5 rounded-full", r.color)} style={{ width: `${(r.score / r.max) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white/50 font-mono w-12 text-right">+{r.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk panel */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-success/20 bg-success/8 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-success" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-success">No implementation risks detected</p>
              </div>
              <div className="space-y-2">
                {[
                  "All milestones on track",
                  "Contract signed and active",
                  "KYC verified",
                  "Payment up to date",
                  "Client engagement: High",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-success/80">
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-3">Health History</p>
              <div className="space-y-2.5">
                {[
                  { month: "May 2025", score: 87, label: "Excellent" },
                  { month: "Apr 2025", score: 79, label: "Good" },
                  { month: "Mar 2025", score: 65, label: "Good" },
                  { month: "Feb 2025", score: 52, label: "At Risk" },
                ].map((h) => (
                  <div key={h.month} className="flex items-center gap-3">
                    <span className="text-xs text-white/40 font-mono w-20 shrink-0">{h.month}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/10">
                      <div
                        className={cn("h-1.5 rounded-full", h.score >= 80 ? "bg-success" : h.score >= 60 ? "bg-info" : "bg-warning")}
                        style={{ width: `${h.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/50 font-mono w-20 text-right">{h.score} · {h.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── SECTION 13: ANALYTICS ─────────────────────────────────────────── */}
      <SectionWrapper id="analytics">
        <SectionLabel label="13 · Reporting & Analytics" />
        <SectionHeadline>Revenue, pipeline, and<br />health — at a glance.</SectionHeadline>
        <SectionSub>A monthly snapshot of every critical operational metric. Revenue collected, pipeline value, and client health — all in one view.</SectionSub>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <StatCard value="£12,450" label="Collected This Month" delta="↑ 8% vs April" />
          <StatCard value="£48,200" label="Pipeline Value"        delta="4 active clients" />
          <StatCard value="87"      label="Avg Health Score"      delta="Excellent band" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly revenue chart */}
          <MockCard>
            <div className="border-b border-grid-300 px-5 py-3 bg-grid-300/20 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-2">Revenue — May 2025 by Week</span>
              <span className="text-xs font-mono text-foreground font-semibold">£12,450</span>
            </div>
            <div className="p-5" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barCategoryGap="35%">
                  <XAxis dataKey="week" tick={{ fill: "#525a70", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v) => [`£${Number(v).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ background: "#fff", border: "1px solid #e8e3dd", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#525a70" }}
                    itemStyle={{ color: "#c9707d" }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((_, i) => (
                      <Cell key={i} fill={i === monthlyData.length - 1 ? "#c9707d" : "rgba(201,112,125,0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </MockCard>

          {/* Health + pipeline breakdown */}
          <MockCard>
            <div className="border-b border-grid-300 px-5 py-3 bg-grid-300/20">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-2">Client Health Distribution</span>
            </div>
            <div className="p-5">
              <div className="space-y-3 mb-6">
                {[
                  { label: "Excellent (80–100)", count: 3, color: "bg-success", pct: 75 },
                  { label: "Good (60–79)",        count: 1, color: "bg-info",    pct: 25 },
                  { label: "At Risk (40–59)",     count: 0, color: "bg-warning", pct: 0 },
                ].map((h) => (
                  <div key={h.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-2 w-36 shrink-0">{h.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-grid-300">
                      <div className={cn("h-2 rounded-full", h.color)} style={{ width: `${h.pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-2 font-mono w-4 text-right">{h.count}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-grid-300 pt-4">
                <p className="label-mono mb-3">Pipeline by Stage</p>
                <div className="space-y-2">
                  {[
                    { stage: "Contract",  val: "£24,600", color: "bg-warning" },
                    { stage: "Strategy",  val: "£12,000", color: "bg-highlight" },
                    { stage: "Proposal",  val: "£8,400",  color: "bg-info" },
                    { stage: "Kickoff",   val: "£3,200",  color: "bg-success" },
                  ].map((p) => (
                    <div key={p.stage} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", p.color)} />
                        <span className="text-muted-2 text-xs">{p.stage}</span>
                      </div>
                      <span className="font-mono text-xs text-foreground">{p.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MockCard>
        </div>
      </SectionWrapper>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <SectionWrapper id="cta">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-highlight/10 border border-highlight/20 flex items-center justify-center mx-auto mb-8">
            <svg viewBox="0 0 100 100" fill="none" className="h-10 w-10">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#01011b" strokeWidth="4" fill="none" />
              <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#c9707d" strokeWidth="3" fill="none" />
              <text x="50" y="57" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="#01011b">A</text>
            </svg>
          </div>

          <p className="label-mono mb-4 text-highlight">14 · Get Started</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-semibold text-foreground tracking-tight mb-5 leading-[1.15]">
            Ready to implement A.D.A.M.<br />in your business?
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-4 max-w-xl mx-auto">
            Book your implementation call and we&apos;ll walk you through setup, onboarding, and your first client cycle.
          </p>
          <p className="text-sm text-muted-2 mb-10">
            Full implementation takes 5–10 business days.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/questionnaire"
              className="relative inline-flex items-center justify-center gap-2 h-13 px-8 text-base font-semibold text-foreground btn-primary-gradient"
            >
              Apply for Implementation
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="mailto:info@andykgroup.com"
              className="h-13 px-8 text-base font-medium text-foreground border border-grid-500 hover:border-foreground/30 transition-colors inline-flex items-center"
            >
              Book a Call
            </a>
          </div>

          <div className="grid grid-cols-3 gap-5 text-left border-t border-grid-300 pt-12">
            {[
              { icon: "⚡", title: "5–10 Day Setup",       desc: "Full implementation and onboarding" },
              { icon: "🔒", title: "Enterprise Security",  desc: "SOC 2-ready, GDPR compliant" },
              { icon: "🤝", title: "Dedicated Support",    desc: "Your team, always available" },
            ].map((f) => (
              <div key={f.title}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <p className="text-sm font-semibold text-foreground mb-1">{f.title}</p>
                <p className="text-xs text-muted-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-grid-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-2 font-mono">
          <span>Andy&#8217;K Group International LTD &middot; Reg: 16453500 &middot; 86-90 Paul Street, London EC2A 4NE</span>
          <span className="text-highlight">Confidential &mdash; NDA Protected</span>
        </div>
      </SectionWrapper>
    </div>
  );
}
