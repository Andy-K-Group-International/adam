"use client";

import { useState } from "react";
import Link from "next/link";
import { pricingData, siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

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
}: {
  plan: Plan;
  billing: "monthly" | "annual";
  billedAnnuallyLabel: string;
  popularLabel: string;
}) {
  const { convert } = useCurrency();
  const isCustom = plan.monthlyGBP === null;
  const gbpPrice = billing === "annual" ? plan.annualGBP : plan.monthlyGBP;
  const priceDisplay = isCustom ? "Custom" : convert(gbpPrice!, "GBP");

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

      <Link
        href={
          plan.cta === "Request Quote"
            ? `mailto:${siteConfig.email}?subject=Quote Request: ${plan.name} Plan`
            : "/questionnaire"
        }
        className={cn(
          "block text-center py-3 px-4 text-sm font-medium transition-all duration-200 hover:underline underline-offset-4",
          plan.highlighted
            ? "bg-white text-foreground hover:bg-white/90"
            : "bg-foreground text-white hover:bg-foreground/90"
        )}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

type Tab = "internal" | "whitelabel";

export default function PricingSection() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("internal");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const activeData = tab === "internal" ? pricingData.internal : pricingData.whitelabel;

  return (
    <section id="pricing" className="relative py-20 px-8">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="text-center max-w-[700px] mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-2 font-mono block mb-3">
            {t.pricing.label}
          </span>
          <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-4">
            {t.pricing.title}
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
                onClick={() => setBilling(b)}
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
        <p className="text-center text-base text-muted font-light max-w-[560px] mx-auto mb-10">
          {activeData.subtitle}
        </p>

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
            />
          ))}
        </div>

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
