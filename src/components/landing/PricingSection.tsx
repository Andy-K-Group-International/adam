"use client";

import { useState } from "react";
import { pricingData, siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2 } from "lucide-react";
import { paymentsEnabled } from "@/lib/payments";

// ─── Plan key mapping for internal plans ────────────────────────────────────

const PLAN_KEYS: Record<string, string> = {
  Starter:    "starter",
  Growth:     "growth",
  Scale:      "scale",
  Enterprise: "enterprise",
};

// ─── Check icon ──────────────────────────────────────────────────────────────

function CheckIcon({ highlighted }: { highlighted?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn("w-4 h-4 shrink-0", highlighted ? "text-rose" : "text-highlight")}
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─── Plan card ───────────────────────────────────────────────────────────────

interface Plan {
  name: string;
  monthlyGBP: number | null;
  annualGBP: number | null;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

function PricingCard({
  plan,
  billing,
  billedAnnuallyLabel,
  popularLabel,
  foundingDiscount,
  isInternalTab,
  onCheckout,
  loadingPlan,
}: {
  plan: Plan;
  billing: "monthly" | "annual";
  billedAnnuallyLabel: string;
  popularLabel: string;
  foundingDiscount: number;
  isInternalTab: boolean;
  onCheckout: (planKey: string) => void;
  loadingPlan: string | null;
}) {
  const { convert } = useCurrency();
  const isCustom  = plan.monthlyGBP === null;
  const isEnterprise = plan.cta === "Request Quote";
  const gbpPrice  = billing === "annual" ? plan.annualGBP : plan.monthlyGBP;

  // Apply founding discount (monthly only, internal only)
  const effectiveGbp =
    !isCustom && isInternalTab && billing === "monthly" && foundingDiscount > 0
      ? Math.round(gbpPrice! * (1 - foundingDiscount / 100))
      : gbpPrice;

  const priceDisplay = isCustom ? "Custom" : convert(effectiveGbp!, "GBP");
  const originalDisplay =
    !isCustom && isInternalTab && billing === "monthly" && foundingDiscount > 0
      ? convert(gbpPrice!, "GBP")
      : null;

  const planKey = isInternalTab ? (PLAN_KEYS[plan.name] ?? null) : null;
  const loading = loadingPlan === planKey;

  function handleCta() {
    if (isEnterprise || !planKey || !isInternalTab) return;
    onCheckout(planKey);
  }

  return (
    <div
      className={cn(
        "relative rounded-xl p-6 flex flex-col h-full transition-all duration-300",
        plan.highlighted
          ? "bg-foreground text-white shadow-[0_8px_40px_rgba(1,1,27,0.2)]"
          : "bg-white border border-grid-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] uppercase tracking-widest font-mono bg-highlight text-white rounded-full">
          {popularLabel}
        </span>
      )}

      <div className="mb-5">
        <h4
          className={cn(
            "text-base font-bold tracking-tight mb-3",
            plan.highlighted ? "text-white" : "text-foreground"
          )}
        >
          {plan.name}
        </h4>

        <div className="flex items-end gap-1">
          {originalDisplay && (
            <span className={cn("text-base line-through mb-0.5", plan.highlighted ? "text-white/30" : "text-muted-2/60")}>
              {originalDisplay}
            </span>
          )}
          <span
            className={cn(
              "text-3xl font-bold tracking-tight",
              plan.highlighted ? "text-white" : "text-foreground"
            )}
          >
            {priceDisplay}
          </span>
          {!isCustom && (
            <span
              className={cn(
                "text-sm mb-0.5",
                plan.highlighted ? "text-white/60" : "text-muted-2"
              )}
            >
              /mo
            </span>
          )}
        </div>

        {!isCustom && billing === "annual" && (
          <p className={cn("text-xs mt-1", plan.highlighted ? "text-white/50" : "text-muted-2")}>
            {billedAnnuallyLabel} · save 40%
          </p>
        )}

        {!isCustom && isInternalTab && billing === "monthly" && foundingDiscount > 0 && (
          <p className={cn("text-xs mt-1 font-mono", plan.highlighted ? "text-white/60" : "text-highlight")}>
            Founding discount −{foundingDiscount}% applied
          </p>
        )}
      </div>

      <div
        className={cn(
          "w-full h-px mb-5",
          plan.highlighted ? "bg-white/15" : "bg-grid-300"
        )}
      />

      <p
        className={cn(
          "text-sm mb-5 leading-relaxed",
          plan.highlighted ? "text-white/70" : "text-muted"
        )}
      >
        {plan.description}
      </p>

      <ul className="space-y-3 flex-1 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <CheckIcon highlighted={plan.highlighted} />
            <span
              className={cn(
                "text-sm leading-snug",
                plan.highlighted ? "text-white/80" : "text-muted"
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {isEnterprise ? (
        <a
          href={`mailto:${siteConfig.email}?subject=Quote Request: ${plan.name} Plan`}
          className={cn(
            "block text-center py-3 px-4 text-sm font-medium transition-all duration-200 hover:underline underline-offset-4",
            plan.highlighted
              ? "bg-white text-foreground hover:bg-white/90"
              : "bg-foreground text-white hover:bg-foreground/90"
          )}
        >
          {plan.cta}
        </a>
      ) : isInternalTab && paymentsEnabled ? (
        <button
          onClick={handleCta}
          disabled={loading}
          className={cn(
            "flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 disabled:opacity-70",
            plan.highlighted
              ? "bg-white text-foreground hover:bg-white/90"
              : "bg-foreground text-white hover:bg-foreground/90"
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Redirecting…" : "Get Access"}
        </button>
      ) : isInternalTab && !paymentsEnabled ? (
        <a
          href="/questionnaire"
          className={cn(
            "block text-center py-3 px-4 text-sm font-medium transition-all duration-200 hover:underline underline-offset-4",
            plan.highlighted
              ? "bg-white text-foreground hover:bg-white/90"
              : "bg-foreground text-white hover:bg-foreground/90"
          )}
        >
          Apply for Access →
        </a>
      ) : (
        <a
          href="/questionnaire"
          className={cn(
            "block text-center py-3 px-4 text-sm font-medium transition-all duration-200 hover:underline underline-offset-4",
            plan.highlighted
              ? "bg-white text-foreground hover:bg-white/90"
              : "bg-foreground text-white hover:bg-foreground/90"
          )}
        >
          {plan.cta}
        </a>
      )}
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

type Tab = "internal" | "whitelabel";

export default function PricingSection() {
  const { t } = useLanguage();
  const [tab, setTab]         = useState<Tab>("internal");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  // Founding code state
  const [codeInput, setCodeInput]         = useState("");
  const [codeApplied, setCodeApplied]     = useState("");
  const [codeDiscount, setCodeDiscount]   = useState(0);
  const [codeError, setCodeError]         = useState<string | null>(null);
  const [codeLoading, setCodeLoading]     = useState(false);
  const [loadingPlan, setLoadingPlan]     = useState<string | null>(null);

  // Consent checkboxes
  const [consentTc, setConsentTc]           = useState(false);
  const [consentBiz, setConsentBiz]         = useState(false);
  const [consentAi, setConsentAi]           = useState(false);
  const [consentBilling, setConsentBilling] = useState(false);
  const [consentActivation, setConsentActivation] = useState(false);
  const [consentError, setConsentError]     = useState<string | null>(null);

  const activeData = tab === "internal" ? pricingData.internal : pricingData.whitelabel;

  async function applyCode() {
    const trimmed = codeInput.trim().toUpperCase();
    if (!trimmed) return;
    setCodeLoading(true);
    setCodeError(null);
    try {
      const res = await fetch("/api/founding-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, billing }),
      });
      const data = await res.json();
      if (data.valid) {
        setCodeApplied(trimmed);
        setCodeDiscount(data.discount_percent);
        setCodeError(null);
      } else {
        setCodeError(data.error ?? "Invalid code");
        setCodeApplied("");
        setCodeDiscount(0);
      }
    } catch {
      setCodeError("Failed to validate code");
    }
    setCodeLoading(false);
  }

  async function handleCheckout(planKey: string) {
    setConsentError(null);
    if (!consentTc || !consentBiz || !consentAi || !consentBilling || !consentActivation) {
      setConsentError("Please accept all terms before continuing.");
      return;
    }
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/revolut/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planKey,
          billing,
          founding_code: codeApplied || undefined,
          terms_version: "v2.0",
          terms_accepted_at: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch {
      console.error("Checkout failed");
    }
    setLoadingPlan(null);
  }

  // Reset code when switching to annual
  function handleBillingChange(b: "monthly" | "annual") {
    setBilling(b);
    if (b === "annual") {
      setCodeApplied("");
      setCodeDiscount(0);
      setCodeError(null);
    }
  }

  return (
    <section id="pricing" className="relative py-20 px-8">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="text-center max-w-[700px] mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-2 font-mono block mb-3">
            {t.pricing.label}
          </span>
          <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-4">
            Simple, transparent{" "}
            <span className="font-serif font-light italic text-[1.2em]">pricing</span>
          </h2>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[960px] mx-auto mb-10">

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-grid-300 bg-white p-1 gap-1">
            {(["internal", "whitelabel"] as Tab[]).map((tabId) => (
              <button
                key={tabId}
                onClick={() => setTab(tabId)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  tab === tabId
                    ? "bg-foreground text-white"
                    : "text-muted hover:text-foreground"
                )}
              >
                {tabId === "internal" ? "Internal Use" : "White-label"}
              </button>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="flex rounded-lg border border-grid-300 bg-white p-1 gap-1">
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                onClick={() => handleBillingChange(b)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5",
                  billing === b
                    ? "bg-foreground text-white"
                    : "text-muted hover:text-foreground"
                )}
              >
                {b === "monthly" ? t.pricing.monthly : t.pricing.annual}
                {b === "annual" && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                      billing === "annual"
                        ? "bg-highlight/20 text-highlight"
                        : "bg-grid-300 text-muted-2"
                    )}
                  >
                    −40%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-center text-base text-muted font-light max-w-[560px] mx-auto mb-8">
          {activeData.subtitle}
        </p>

        {/* Founding code input — internal + monthly + payments active only */}
        {tab === "internal" && paymentsEnabled && (
          <div className="max-w-[960px] mx-auto mb-10">
            {billing === "monthly" ? (
              <div className="border border-grid-300 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs font-mono text-muted-2 uppercase tracking-wider mb-2">
                    Have a Founding Client code?
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      placeholder="FOUNDING-XXXXXX"
                      className="flex-1 border border-grid-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-highlight/30"
                      onKeyDown={(e) => e.key === "Enter" && applyCode()}
                    />
                    <button
                      onClick={applyCode}
                      disabled={codeLoading || !codeInput.trim()}
                      className="px-4 py-2 bg-foreground text-white text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                    >
                      {codeLoading ? "Checking…" : "Apply"}
                    </button>
                  </div>
                </div>
                <div className="min-w-[200px]">
                  {codeApplied && codeDiscount > 0 && (
                    <p className="text-sm text-success font-medium">
                      ✓ Founding discount applied — {codeDiscount}% off monthly billing
                    </p>
                  )}
                  {codeError && (
                    <p className="text-sm text-error">{codeError}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-grid-300 bg-grid-100 px-4 py-3 text-sm text-muted-2 font-mono text-center">
                Annual billing already includes 40% discount — Founding codes apply to monthly billing only.
              </div>
            )}
          </div>
        )}

        {/* Consent checkboxes — internal tab + payments enabled only */}
        {tab === "internal" && paymentsEnabled && (
          <div className="max-w-[960px] mx-auto mb-8 border border-grid-300 bg-white p-5 space-y-3">
            <p className="text-xs font-mono text-muted-2 uppercase tracking-wider mb-3">
              Required — please confirm before proceeding
            </p>
            {[
              {
                id: "tc",
                checked: consentTc,
                set: setConsentTc,
                label: (
                  <>
                    I have read and agree to the{" "}
                    <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                      Terms &amp; Conditions
                    </a>,{" "}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                      Privacy Policy
                    </a>, and{" "}
                    <a href="/service-definition" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                      Service Definition
                    </a>.
                  </>
                ),
              },
              {
                id: "biz",
                checked: consentBiz,
                set: setConsentBiz,
                label: "I confirm that A.D.A.M. is a B2B platform for registered businesses only, and I am authorised to represent my company.",
              },
              {
                id: "ai",
                checked: consentAi,
                set: setConsentAi,
                label: "I understand that AI-generated content is for assistance only and must be reviewed by a qualified human before use.",
              },
              {
                id: "billing",
                checked: consentBilling,
                set: setConsentBilling,
                label: "I agree to the billing terms: my service period begins from my activation date, not my payment date. I am entitled to a full refund within 14 days of payment if activation has not yet started. Once activation begins, no refund is available except where a verified technical failure prevents access for more than 40% of the service period.",
              },
              {
                id: "activation",
                checked: consentActivation,
                set: setConsentActivation,
                label: "I understand that payment confirms my intent and reserves my plan. My subscription period begins only after business verification and admin activation are completed. Cancellation requires 30 days written notice to ceo@andykgroup.com. If activation is refused, I will receive a full refund within 14 business days.",
              },
            ].map(({ id, checked, set, label }) => (
              <label key={id} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => set(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 border border-grid-500 accent-foreground cursor-pointer"
                />
                <span className="text-xs font-mono text-muted leading-relaxed group-hover:text-foreground transition-colors">
                  {label}
                </span>
              </label>
            ))}
            {consentError && (
              <p className="text-xs font-mono text-error mt-2">{consentError}</p>
            )}
          </div>
        )}

        {/* Cards */}
        <div
          className={cn(
            "grid gap-6 mx-auto",
            tab === "internal"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-[1200px]"
              : "grid-cols-1 md:grid-cols-3 max-w-[960px]"
          )}
        >
          {activeData.plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              billing={billing}
              billedAnnuallyLabel={t.pricing.billedAnnually}
              popularLabel={t.pricing.popular}
              foundingDiscount={codeApplied ? codeDiscount : 0}
              isInternalTab={tab === "internal"}
              onCheckout={handleCheckout}
              loadingPlan={loadingPlan}
            />
          ))}
        </div>

        {/* Pre-launch notice */}
        {!paymentsEnabled && (
          <div className="mt-8 border border-grid-300 bg-grid-100 px-5 py-5 max-w-[680px] mx-auto text-center space-y-3">
            <p className="text-sm text-muted leading-relaxed">
              A.D.A.M. is currently accepting applications for{" "}
              <span className="text-foreground font-medium">Founding Client Access.</span>{" "}
              Public payments are not yet open. Selected applicants will be notified before launch and invited to complete payment once access opens.
            </p>
            <p className="text-xs font-mono text-muted-2 tracking-wide uppercase">
              Official payment launch: 15 July 2026
            </p>
          </div>
        )}

        {/* Implementation note */}
        <p className="text-center text-sm text-muted mt-8 max-w-[580px] mx-auto leading-relaxed">
          All plans include a complimentary implementation phase.{" "}
          <span className="text-foreground font-medium">Billing begins only after your system is operationally activated.</span>
        </p>

        {/* Custom quote CTA */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted mb-3">
            Need a tailored solution for your organisation?
          </p>
          <a
            href={`mailto:${siteConfig.email}?subject=Custom Quote Request`}
            className="text-sm font-medium text-foreground hover:underline underline-offset-4"
          >
            Request a Custom Quote ›
          </a>
        </div>

      </div>
    </section>
  );
}
