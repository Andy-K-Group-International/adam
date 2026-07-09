"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { submitSellerApplication } from "@/app/actions/seller-applications";

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  message: string;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

const inputCls = "w-full h-10 px-3 text-sm text-foreground border border-grid-500 rounded-lg bg-white placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors";
const errorInputCls = "border-error focus:ring-error/30 focus:border-error";

export default function BecomeASellerPage() {
  const [form, setForm] = useState<FormData>({ full_name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setGlobalError("");
    const result = await submitSellerApplication({
      fullName: form.full_name,
      email: form.email,
      phone: form.phone,
      message: form.message.trim() || undefined,
    });
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
            Thank you for your interest in becoming an A.D.A.M. seller partner. We review all
            applications manually. If there&rsquo;s a fit, we&rsquo;ll be in touch to walk you
            through the next steps.
          </p>
          <p className="text-xs text-muted-2 font-mono">
            Andy&#8217;K Group International LTD
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
          <span className="text-xs font-mono text-muted-2 uppercase tracking-wider">Become a Seller</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-10">
          <p className="label-mono mb-2">Andy&#8217;K Group International LTD</p>
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">
            Become a Seller Partner
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-lg">
            Refer companies to A.D.A.M. and earn commission on the clients you bring in.
            Seller partner access is reviewed manually and is not automatic — tell us a bit
            about yourself to apply.
          </p>
          <div className="flex items-center gap-4 mt-5 text-xs text-muted-2 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-info inline-block" />
              Manually reviewed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-highlight inline-block" />
              Response within 48h
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              Commission-based
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="bg-white rounded-xl border border-grid-300 p-6">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-2 mb-5">Your Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Full Name</Label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className={`${inputCls} ${errors.full_name ? errorInputCls : ""}`}
                />
                {errors.full_name && <p className="text-xs text-error mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <Label required>Email</Label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={`${inputCls} ${errors.email ? errorInputCls : ""}`}
                />
                {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label required>Phone</Label>
                <input
                  type="tel"
                  placeholder="+44 7700 900000"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={`${inputCls} ${errors.phone ? errorInputCls : ""}`}
                />
                {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
              </div>
            </div>
            <div className="mt-4">
              <Label>Message (optional)</Label>
              <textarea
                rows={4}
                placeholder="Tell us about your network, experience, or why you're interested in partnering with us."
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-foreground border border-grid-500 rounded-lg bg-white placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors resize-none"
              />
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
              be processed by Andy&rsquo;K Group International LTD for review purposes, in line with
              our{" "}
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
