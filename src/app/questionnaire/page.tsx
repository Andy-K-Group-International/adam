"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const BLOCKED_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "icloud.com", "protonmail.com", "gmx.com", "web.de",
  "yahoo.co.uk", "yahoo.fr", "hotmail.co.uk", "hotmail.fr",
  "live.com", "msn.com",
];

function isBusinessEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? !BLOCKED_DOMAINS.includes(domain) : false;
}

const SERVICE_OPTIONS = [
  { value: "b2b",         label: "B2B Lead Generation",             desc: "Systematic pipeline of qualified business clients" },
  { value: "b2g",         label: "B2G Government Tenders",          desc: "Access and win public sector contracts" },
  { value: "adam",        label: "A.D.A.M. System Licensing",       desc: "License the ADAM automation platform" },
  { value: "end_to_end",  label: "End-to-End Business Development", desc: "Full strategic architecture and implementation" },
  { value: "not_sure",    label: "Not sure yet — help me decide",   desc: "I need guidance on the right approach" },
];

const STATUS_OPTIONS = [
  { value: "operating",  label: "Operating Company" },
  { value: "pre-launch", label: "Pre-Launch / New Venture" },
  { value: "investor",   label: "Investor / Strategic Partner" },
];

const SITUATION_OPTIONS = [
  { value: "lacking-structure",   label: "Operating but lack structure" },
  { value: "growing-chaotic",     label: "Growing but chaotic" },
  { value: "international",       label: "Want international expansion" },
  { value: "strategic-redesign",  label: "Need full strategic redesign" },
  { value: "automation-ops",      label: "Need automation & operational systems" },
];

const REVENUE_OPTIONS = [
  { value: "<250k",        label: "Under €250k" },
  { value: "250k-1m",     label: "€250k – €1M" },
  { value: "1m-5m",       label: "€1M – €5M" },
  { value: "5m+",         label: "€5M+" },
  { value: "not-disclosed", label: "Prefer not to say" },
];

const TIMELINE_OPTIONS = [
  { value: "immediate",  label: "Immediately — 0-30 days" },
  { value: "1-3months",  label: "1–3 months" },
  { value: "3-6months",  label: "3–6 months" },
  { value: "exploring",  label: "Just exploring" },
];

const AUTHORITY_OPTIONS = [
  { value: "final_decision_maker", label: "I am the final decision maker" },
  { value: "part_of_leadership",   label: "Part of the leadership team" },
  { value: "exploring",            label: "Exploring on behalf of someone else" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
      {children}
    </h2>
  );
}

function OptionCard({
  label, desc, selected, onClick,
}: {
  label: string; desc?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left p-3.5 rounded-xl border transition-all",
        selected
          ? "border-highlight bg-highlight/5 ring-1 ring-highlight/20"
          : "border-grid-300 bg-white hover:border-grid-500"
      )}
    >
      <span className={cn("block text-sm font-medium", selected ? "text-foreground" : "text-muted")}>
        {label}
      </span>
      {desc && (
        <span className="block text-xs text-muted-2 mt-0.5 leading-snug">{desc}</span>
      )}
    </button>
  );
}

function Input({
  label, required, error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      <input
        className={cn(
          "w-full text-sm border rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 transition-colors",
          error ? "border-error" : "border-grid-500"
        )}
        {...props}
      />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}

export default function QuestionnairePage() {
  const [serviceInterest, setServiceInterest] = useState("");
  const [companyStatus, setCompanyStatus]     = useState("");
  const [companyName, setCompanyName]         = useState("");
  const [website, setWebsite]                 = useState("");
  const [contactName, setContactName]         = useState("");
  const [contactRole, setContactRole]         = useState("");
  const [email, setEmail]                     = useState("");
  const [phone, setPhone]                     = useState("");
  const [situation, setSituation]             = useState("");
  const [objective, setObjective]             = useState("");
  const [revenue, setRevenue]                 = useState("");
  const [timeline, setTimeline]               = useState("");
  const [authority, setAuthority]             = useState("");

  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!serviceInterest) e.serviceInterest = "Please select what you're looking for";
    if (!companyStatus)   e.companyStatus   = "Please select company type";
    if (!companyName.trim()) e.companyName  = "Required";
    if (!contactName.trim()) e.contactName  = "Required";
    if (!email.trim())    e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address";
    else if (!isBusinessEmail(email.trim().toLowerCase())) e.email = "Please use your business email address";
    if (!situation)  e.situation = "Please describe your current situation";
    if (!objective.trim()) e.objective = "Required";
    if (!revenue)    e.revenue   = "Required";
    if (!timeline)   e.timeline  = "Required";
    if (!authority)  e.authority = "Required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const first = document.querySelector("[data-error]");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    contactName.trim(),
          email:   email.trim(),
          phone:   phone.trim() || undefined,
          company: companyName.trim(),
          source:  "website",
          answers: {
            service_interest: serviceInterest,
            company_status:   companyStatus,
            website:          website.trim() || undefined,
            contact_role:     contactRole.trim() || undefined,
            situation,
            objective:        objective.trim(),
            revenue,
            timeline,
            decision_authority: authority,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-bg-light relative flex items-center justify-center px-6 py-16">
        <div className="absolute inset-0 cartesian-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-lg w-full">
          <div className="bg-white rounded-2xl border border-grid-300 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-3">Application Received</h1>
            <p className="text-sm text-muted leading-relaxed">
              Thank you. Due to limited project capacity, all applications are reviewed manually.
              If there is alignment, we will contact you within 48 hours.
            </p>
            <div className="mt-8 pt-6 border-t border-grid-300">
              <a
                href="https://andykgroup.com"
                className="text-sm text-highlight hover:underline"
              >
                Return to andykgroup.com
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-light relative">
      <div className="absolute inset-0 cartesian-grid opacity-40 pointer-events-none" />

      {/* Header */}
      <div className="relative bg-foreground border-b border-grid-500/30">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <span className="text-highlight font-bold text-base tracking-tight">Andy'K Group</span>
          <p className="text-white/50 text-sm mt-0.5">Partnership Application</p>
        </div>
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Tell us about your business</h1>
          <p className="text-muted text-sm mt-1.5">
            All applications are reviewed manually. We respond within 48 hours if there's alignment.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Service interest */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <SectionTitle>What are you looking for?</SectionTitle>
            {errors.serviceInterest && (
              <p data-error className="text-xs text-error mb-3">{errors.serviceInterest}</p>
            )}
            <div className="grid grid-cols-1 gap-2">
              {SERVICE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  desc={opt.desc}
                  selected={serviceInterest === opt.value}
                  onClick={() => setServiceInterest(opt.value)}
                />
              ))}
            </div>
          </div>

          {/* Company type */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <SectionTitle>About Your Company</SectionTitle>
            {errors.companyStatus && (
              <p data-error className="text-xs text-error mb-3">{errors.companyStatus}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
              {STATUS_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  selected={companyStatus === opt.value}
                  onClick={() => setCompanyStatus(opt.value)}
                />
              ))}
            </div>
            <div className="space-y-4">
              <Input
                label="Legal Company Name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme International Ltd."
                error={errors.companyName}
              />
              <Input
                label="Website URL"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <SectionTitle>Contact Information</SectionTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Alexandra Martin"
                  error={errors.contactName}
                />
                <Input
                  label="Role / Title"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  placeholder="CEO, Founder, COO..."
                />
              </div>
              <Input
                label="Business Email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                error={errors.email}
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          {/* Situation */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <SectionTitle>Your Current Situation</SectionTitle>
            {errors.situation && (
              <p data-error className="text-xs text-error mb-3">{errors.situation}</p>
            )}
            <div className="grid grid-cols-1 gap-2">
              {SITUATION_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  selected={situation === opt.value}
                  onClick={() => setSituation(opt.value)}
                />
              ))}
            </div>
          </div>

          {/* Objective */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <SectionTitle>Primary Objective for the Next 12 Months</SectionTitle>
            <div>
              {errors.objective && (
                <p data-error className="text-xs text-error mb-1.5">{errors.objective}</p>
              )}
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Describe what you're trying to achieve..."
                rows={4}
                className={cn(
                  "w-full text-sm border rounded-lg px-3 py-2.5 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30 transition-colors",
                  errors.objective ? "border-error" : "border-grid-500"
                )}
              />
            </div>
          </div>

          {/* Revenue + Timeline + Authority */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <SectionTitle>About Your Business</SectionTitle>

            <div className="space-y-6">
              {/* Revenue */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Approximate Annual Revenue <span className="text-error">*</span>
                </p>
                {errors.revenue && <p data-error className="text-xs text-error mb-2">{errors.revenue}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REVENUE_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      selected={revenue === opt.value}
                      onClick={() => setRevenue(opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  How soon are you looking to start? <span className="text-error">*</span>
                </p>
                {errors.timeline && <p data-error className="text-xs text-error mb-2">{errors.timeline}</p>}
                <div className="grid grid-cols-2 gap-2">
                  {TIMELINE_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      selected={timeline === opt.value}
                      onClick={() => setTimeline(opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Authority */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Decision Authority <span className="text-error">*</span>
                </p>
                {errors.authority && <p data-error className="text-xs text-error mb-2">{errors.authority}</p>}
                <div className="grid grid-cols-1 gap-2">
                  {AUTHORITY_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      selected={authority === opt.value}
                      onClick={() => setAuthority(opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {serverError && (
            <div className="bg-error/5 border border-error/20 rounded-xl px-4 py-3">
              <p className="text-sm text-error">{serverError}</p>
            </div>
          )}

          <div className="pb-8">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-highlight text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-highlight/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
            <p className="text-xs text-muted-2 text-center mt-3">
              All applications are reviewed manually. We do not share your information.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
