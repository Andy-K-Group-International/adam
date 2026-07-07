"use client";

import { useState, useRef } from "react";
import { submitDemoRequest, type DemoRequestFormData } from "@/app/actions/demo-request";
import Link from "next/link";
import { CheckCircle, Upload, X } from "lucide-react";

const BLOCKED_DOMAINS = [
  "gmail.com","googlemail.com","yahoo.com","yahoo.co.uk","yahoo.fr","yahoo.de",
  "hotmail.com","hotmail.co.uk","hotmail.fr","outlook.com","outlook.co.uk",
  "icloud.com","me.com","mac.com","protonmail.com","proton.me",
  "gmx.com","gmx.de","gmx.net","live.com","msn.com","aol.com",
];
function isBusinessEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return !BLOCKED_DOMAINS.includes(domain);
}

const COMPANY_SIZES = [
  { value: "1-10",   label: "1–10 employees" },
  { value: "11-50",  label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "200+",   label: "200+ employees" },
];

const USE_CASES = [
  { value: "Internal operations",         label: "Internal operations" },
  { value: "Client management",           label: "Client management" },
  { value: "White-label for my clients",  label: "White-label for my clients" },
  { value: "Other",                       label: "Other" },
];

const HOW_HEARD = [
  { value: "Andy'K Group website",  label: "Andy'K Group website" },
  { value: "LinkedIn",              label: "LinkedIn" },
  { value: "Referral",              label: "Referral" },
  { value: "Other",                 label: "Other" },
];

const COUNTRIES = [
  "United Kingdom","United States","Germany","France","Netherlands","Belgium",
  "Switzerland","Austria","Spain","Italy","Poland","Sweden","Denmark","Norway",
  "Finland","Ireland","Canada","Australia","Singapore","UAE","Other",
];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

const inputCls = "w-full h-10 px-3 text-sm text-foreground border border-grid-500 rounded-lg bg-white placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors";
const selectCls = "w-full h-10 px-3 text-sm text-foreground border border-grid-500 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors";
const errorInputCls = "border-error focus:ring-error/30 focus:border-error";

export default function RequestDemoPage() {
  const [form, setForm] = useState<DemoRequestFormData>({
    full_name: "", email: "", company: "", website: "",
    role: "", country: "", company_size: "", use_case: "",
    challenge: "", how_heard: "", document_url: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DemoRequestFormData, string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [freeEmailWarning, setFreeEmailWarning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [docName, setDocName] = useState("");

  const isEarlyStage = form.company_size === "1-10";

  function set(field: keyof DemoRequestFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    if (field === "email") setFreeEmailWarning(false);
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.full_name.trim())    e.full_name    = "Required";
    if (!form.email.trim())        e.email        = "Required";
    else if (!form.email.includes("@")) e.email   = "Enter a valid email";
    // Soft-flag only — free email does not block submission
    if (form.email.includes("@") && !isBusinessEmail(form.email)) {
      setFreeEmailWarning(true);
    }
    if (!form.company.trim())      e.company      = "Required";
    if (!form.website.trim())      e.website      = "Required";
    if (!form.role.trim())         e.role         = "Required";
    if (!form.country)             e.country      = "Required";
    if (!form.company_size)        e.company_size = "Required";
    if (!form.use_case)            e.use_case     = "Required";
    if (!form.challenge.trim())    e.challenge    = "Required";
    if (!form.how_heard)           e.how_heard    = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setGlobalError("");
    const result = await submitDemoRequest(form);
    setSubmitting(false);
    if ("error" in result) {
      setGlobalError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 mb-6">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
          <h1 className="text-2xl font-serif font-semibold text-foreground mb-3">Application Received</h1>
          <p className="text-muted text-sm leading-relaxed mb-8">
            Your application has been received. We review all A.D.A.M. implementation requests manually.
            If there is a strategic fit, you will be contacted within 48 hours to proceed.
          </p>
          <p className="text-xs text-muted-2 font-mono">
            Andy&#8217;K Group International LTD &middot; NDA-protected access
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-xs text-highlight hover:underline"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-grid-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-foreground tracking-tight">A.D.A.M.</Link>
          <span className="text-xs font-mono text-muted-2 uppercase tracking-wider">Request Access</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-10">
          <p className="label-mono mb-2">Andy&#8217;K Group International LTD</p>
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">
            Request Demo Access
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-lg">
            A.D.A.M. is a closed implementation environment. All access is reviewed manually
            and gated by NDA. Complete the pre-qualification below to begin.
          </p>
          <div className="flex items-center gap-4 mt-5 text-xs text-muted-2 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              NDA protected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-info inline-block" />
              Manually reviewed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-highlight inline-block" />
              Response within 48h
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Personal */}
          <div className="bg-white rounded-xl border border-grid-300 p-6">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-2 mb-5">01 · Contact Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Full Name</Label>
                <input
                  type="text"
                  placeholder="James Mitchell"
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className={`${inputCls} ${errors.full_name ? errorInputCls : ""}`}
                />
                {errors.full_name && <p className="text-xs text-error mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <Label required>Business Email</Label>
                <input
                  type="email"
                  placeholder="j.mitchell@company.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={`${inputCls} ${errors.email ? errorInputCls : ""}`}
                />
                {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
                {!errors.email && freeEmailWarning && (
                  <p className="text-xs text-warning mt-1">We recommend using your business email for faster processing.</p>
                )}
              </div>
              <div>
                <Label required>Role / Position</Label>
                <input
                  type="text"
                  placeholder="CEO, Operations Director, etc."
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  className={`${inputCls} ${errors.role ? errorInputCls : ""}`}
                />
                {errors.role && <p className="text-xs text-error mt-1">{errors.role}</p>}
              </div>
              <div>
                <Label required>Country</Label>
                <select
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  className={`${selectCls} ${errors.country ? errorInputCls : ""}`}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="text-xs text-error mt-1">{errors.country}</p>}
              </div>
            </div>
          </div>

          {/* Company */}
          <div className="bg-white rounded-xl border border-grid-300 p-6">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-2 mb-5">02 · Company Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Company Name</Label>
                <input
                  type="text"
                  placeholder="Nexora Group Ltd"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  className={`${inputCls} ${errors.company ? errorInputCls : ""}`}
                />
                {errors.company && <p className="text-xs text-error mt-1">{errors.company}</p>}
              </div>
              <div>
                <Label required>Company Website</Label>
                <input
                  type="text"
                  placeholder="nexora.com"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  className={`${inputCls} ${errors.website ? errorInputCls : ""}`}
                />
                {errors.website && <p className="text-xs text-error mt-1">{errors.website}</p>}
              </div>
              <div>
                <Label required>Company Size</Label>
                <select
                  value={form.company_size}
                  onChange={(e) => set("company_size", e.target.value)}
                  className={`${selectCls} ${errors.company_size ? errorInputCls : ""}`}
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                {errors.company_size && <p className="text-xs text-error mt-1">{errors.company_size}</p>}
              </div>
            </div>

            {/* Early-stage document upload */}
            {isEarlyStage && (
              <div className="mt-4 p-4 bg-info/5 border border-info/20 rounded-lg">
                <p className="text-xs text-info font-medium mb-1">Early-stage companies</p>
                <p className="text-xs text-muted-2 mb-3">
                  You may upload a business plan or operational outline instead of a website.
                </p>
                {docName ? (
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <span className="font-mono bg-grid-300 px-2 py-1 rounded">{docName}</span>
                    <button
                      type="button"
                      onClick={() => { setDocName(""); set("document_url", ""); }}
                      className="text-muted-2 hover:text-error"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 text-xs text-info border border-info/30 px-3 py-1.5 rounded-lg hover:bg-info/10 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload document (optional)
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setDocName(file.name);
                  }}
                />
              </div>
            )}
          </div>

          {/* Intent */}
          <div className="bg-white rounded-xl border border-grid-300 p-6">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-2 mb-5">03 · Use Case & Intent</p>
            <div className="space-y-4">
              <div>
                <Label required>What do you want to use A.D.A.M. for?</Label>
                <select
                  value={form.use_case}
                  onChange={(e) => set("use_case", e.target.value)}
                  className={`${selectCls} ${errors.use_case ? errorInputCls : ""}`}
                >
                  <option value="">Select use case</option>
                  {USE_CASES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
                {errors.use_case && <p className="text-xs text-error mt-1">{errors.use_case}</p>}
              </div>
              <div>
                <Label required>Describe your main operational challenge</Label>
                <textarea
                  rows={4}
                  placeholder="What problem are you trying to solve? What does your current process look like?"
                  value={form.challenge}
                  onChange={(e) => set("challenge", e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm text-foreground border border-grid-500 rounded-lg bg-white placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors resize-none ${errors.challenge ? errorInputCls : ""}`}
                />
                {errors.challenge && <p className="text-xs text-error mt-1">{errors.challenge}</p>}
              </div>
              <div>
                <Label required>How did you hear about A.D.A.M.?</Label>
                <select
                  value={form.how_heard}
                  onChange={(e) => set("how_heard", e.target.value)}
                  className={`${selectCls} ${errors.how_heard ? errorInputCls : ""}`}
                >
                  <option value="">Select</option>
                  {HOW_HEARD.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
                {errors.how_heard && <p className="text-xs text-error mt-1">{errors.how_heard}</p>}
              </div>
            </div>
          </div>

          {globalError && (
            <div className="bg-error/5 border border-error/20 rounded-lg px-4 py-3 text-sm text-error">
              {globalError}
            </div>
          )}

          <div className="flex items-start gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="relative inline-flex items-center justify-center gap-2 h-11 px-8 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
            <p className="text-xs text-muted-2 leading-relaxed pt-1">
              By submitting this form, you confirm that the information provided is accurate and may
              be processed by Andy&rsquo;K Group International LTD for review, demo access provisioning,
              and business verification purposes, in line with our{" "}
              <a href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-grid-300 text-xs text-muted-2 font-mono">
          <span>Andy&#8217;K Group International LTD &middot; Reg: 16453500 &middot; 86-90 Paul Street, London EC2A 4NE</span>
        </div>
      </div>
    </div>
  );
}
