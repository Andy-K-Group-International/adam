"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CheckCircle2, Upload, X } from "lucide-react";

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
  { value: "b2g",        label: "B2G Government Tenders",          desc: "Access and win public sector contracts" },
  { value: "adam",       label: "A.D.A.M. System Licensing",       desc: "License the ADAM automation platform" },
  { value: "eve",        label: "E.V.E. Intelligence System",      desc: "Automated business intelligence and market monitoring" },
  { value: "end_to_end", label: "End-to-End Business Development", desc: "Full strategic architecture and implementation" },
  { value: "not_sure",   label: "Not sure yet — help me decide",   desc: "I need guidance on the right approach" },
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
  { value: "<250k",         label: "Under €250k" },
  { value: "250k-1m",      label: "€250k – €1M" },
  { value: "1m-5m",        label: "€1M – €5M" },
  { value: "5m+",          label: "€5M+" },
  { value: "not-disclosed", label: "Prefer not to say" },
];

const TIMELINE_OPTIONS = [
  { value: "immediate", label: "Immediately — 0-30 days" },
  { value: "1-3months", label: "1–3 months" },
  { value: "3-6months", label: "3–6 months" },
  { value: "exploring",  label: "Just exploring" },
];

const AUTHORITY_OPTIONS = [
  { value: "final_decision_maker", label: "I am the final decision maker" },
  { value: "part_of_leadership",   label: "Part of the leadership team" },
  { value: "exploring",            label: "Exploring on behalf of someone else" },
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

  // Document upload (E2E only)
  const [documentFile, setDocumentFile]       = useState<File | null>(null);
  const fileInputRef                          = useRef<HTMLInputElement>(null);

  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [submittedIsE2E, setSubmittedIsE2E] = useState(false);
  const [serverError, setServerError] = useState("");

  const isE2E = serviceInterest === "end_to_end";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!serviceInterest) e.serviceInterest = "Please select what you're looking for";
    if (!companyStatus)   e.companyStatus   = "Please select company type";
    if (!companyName.trim()) e.companyName  = "Required";
    if (!contactName.trim()) e.contactName  = "Required";
    if (!email.trim())    e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address";
    else if (!isE2E && !isBusinessEmail(email.trim().toLowerCase())) e.email = "Please use your business email address";
    if (!situation)  e.situation = "Please describe your current situation";
    if (!objective.trim()) e.objective = "Required";
    if (!revenue)    e.revenue   = "Required";
    if (!timeline)   e.timeline  = "Required";
    if (!authority)  e.authority = "Required";
    if (isE2E && !documentFile) e.document = "Please upload at least one supporting document";
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

    // Upload document first for E2E leads
    let documentUrl: string | undefined;
    if (isE2E && documentFile) {
      try {
        const fd = new FormData();
        fd.append("file", documentFile);
        const uploadRes = await fetch("/api/leads/upload-document", {
          method: "POST",
          body: fd,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setServerError(uploadData.error || "Document upload failed. Please try again.");
          setSubmitting(false);
          return;
        }
        documentUrl = uploadData.url;
      } catch {
        setServerError("Document upload failed. Please check your connection and try again.");
        setSubmitting(false);
        return;
      }
    }

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
            service_interest:   serviceInterest,
            company_status:     companyStatus,
            website:            website.trim() || undefined,
            contact_role:       contactRole.trim() || undefined,
            situation,
            objective:          objective.trim(),
            revenue,
            timeline,
            decision_authority: authority,
            ...(documentUrl ? { document_url: documentUrl } : {}),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmittedIsE2E(isE2E);
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
        <div className="absolute inset-0 cartesian-grid opacity-30 pointer-events-none" />
        <div className="relative max-w-lg w-full">
          <div className="glass-card rounded-2xl border border-grid-300 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h1 className="text-xl font-serif font-semibold text-foreground mb-3">Application Received</h1>
            <p className="text-sm text-muted leading-relaxed">
              {submittedIsE2E
                ? "Your End-to-End application has been received. All applications are reviewed internally based on strategic fit and project potential. Selected projects will be contacted within 5 business days."
                : "Thank you. Due to limited project capacity, all applications are reviewed manually. If there is alignment, we will contact you within 48 hours."
              }
            </p>
            <div className="mt-8 pt-6 border-t border-grid-300">
              <a href="https://andykgroup.com" className="text-sm text-highlight hover:underline">
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
      <div className="absolute inset-0 cartesian-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-grid-300 relative">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
          <Image src="/adam-logo-simple-no-bg.png" alt="A.D.A.M." width={32} height={32} />
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm tracking-tight">A.D.A.M.</span>
            <span className="text-grid-700 text-xs">/</span>
            <span className="label-mono">Partnership Application</span>
          </div>
        </div>
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-semibold text-foreground">Tell us about your business</h1>
          <p className="text-muted text-sm mt-1.5">
            All applications are reviewed manually. We respond within 48 hours if there&rsquo;s alignment.
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
                  onClick={() => {
                    setServiceInterest(opt.value);
                    if (opt.value !== "end_to_end") setDocumentFile(null);
                  }}
                />
              ))}
            </div>
          </div>

          {/* E2E Document Upload — only shown when End-to-End is selected */}
          {isE2E && (
            <div className="bg-white rounded-xl border border-grid-300 p-5">
              <div className="mb-4">
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">
                  Supporting Documentation{" "}
                  <span className="text-highlight normal-case tracking-normal font-medium">(Required for End-to-End)</span>
                </h2>
              </div>

              <div className="text-sm text-muted leading-relaxed space-y-3 mb-5 p-4 bg-bg-light rounded-lg border border-grid-300">
                <p>
                  To qualify for End-to-End Business Development review, please upload at least one of the following:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-2 text-xs">
                  <li>Business Plan</li>
                  <li>Strategic Outline or Roadmap</li>
                  <li>Market Expansion Plan</li>
                  <li>Investment or Growth Concept</li>
                  <li>Internal Project Documentation</li>
                  <li>Operational Overview</li>
                </ul>
                <p className="text-xs text-muted-2">
                  The document does not need to be investor-ready. We are evaluating your strategic thinking, operational clarity, and implementation readiness.
                </p>
                <p>
                  You may also include <span className="text-muted">(optional)</span>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-2 text-xs">
                  <li>Existing NDA agreements</li>
                  <li>Partnership documentation</li>
                  <li>Confidential business materials for internal review by Andy&rsquo;K Group International LTD</li>
                </ul>
                <p className="text-xs text-muted-2">
                  Accepted formats: PDF, DOCX, XLSX, PPTX — max 10MB per file.
                </p>
                <p className="text-xs text-muted-2 border-t border-grid-300 pt-3 mt-3">
                  <strong>Note:</strong> Submission does not guarantee acceptance. All End-to-End applications are reviewed internally based on strategic fit, operational potential, and available project capacity.
                </p>
              </div>

              {errors.document && (
                <p data-error className="text-xs text-error mb-3">{errors.document}</p>
              )}

              {documentFile ? (
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-success/30 bg-success/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                      <Upload className="h-4 w-4 text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{documentFile.name}</p>
                      <p className="text-xs text-muted-2">{formatBytes(documentFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setDocumentFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="shrink-0 p-1.5 rounded-lg text-muted-2 hover:text-error hover:bg-error/5 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 border-dashed transition-colors",
                    errors.document
                      ? "border-error/50 bg-error/3 hover:border-error"
                      : "border-grid-500 hover:border-highlight/50 hover:bg-highlight/3"
                  )}
                >
                  <Upload className="h-6 w-6 text-muted-2" />
                  <span className="text-sm font-medium text-muted">Click to upload document</span>
                  <span className="text-xs text-muted-2">PDF, DOCX, XLSX, PPTX — max 10 MB</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setDocumentFile(f);
                    setErrors((prev) => { const n = { ...prev }; delete n.document; return n; });
                  }
                }}
              />
            </div>
          )}

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
              {!isE2E && (
                <Input
                  label="Website URL"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              )}
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
                label={isE2E ? "Email Address" : "Business Email"}
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isE2E ? "your@email.com" : "you@yourcompany.com"}
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
              className="relative inline-flex w-full items-center justify-center h-12 text-sm font-medium text-foreground btn-primary-gradient rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {submitting
                  ? isE2E && documentFile ? "Uploading document…" : "Submitting…"
                  : "Submit Application"
                }
              </span>
            </button>
            <p className="text-xs text-muted-2 text-center mt-3">
              By submitting this questionnaire, you confirm that the information provided is accurate and may
              be processed by Andy&rsquo;K Group International LTD for business verification, onboarding, service
              preparation and A.D.A.M. implementation purposes, in line with our{" "}
              <a href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
