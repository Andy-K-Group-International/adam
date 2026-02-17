"use client";

import Link from "next/link";
import { pricingData, siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";

function CheckIcon({ highlighted }: { highlighted?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={cn("w-4 h-4 shrink-0", highlighted ? "text-highlight" : "text-highlight")}>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface PlanData {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

function PricingCard({ plan }: { plan: PlanData }) {
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
          Popular
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
        <span
          className={cn(
            "text-3xl font-bold tracking-tight",
            plan.highlighted ? "text-white" : "text-foreground"
          )}
        >
          {plan.price}
        </span>
        {plan.period && (
          <span
            className={cn(
              "text-sm ml-1",
              plan.highlighted ? "text-white/60" : "text-muted-2"
            )}
          >
            {plan.period}
          </span>
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
        href={plan.cta === "Request Quote" ? `mailto:${siteConfig.email}?subject=Quote Request: ${plan.name} Plan` : "/questionnaire"}
        className={cn(
          "block text-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200",
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

export default function PricingSection() {
  const plans = pricingData.tech.plans;

  return (
    <section id="pricing" className="relative py-20 px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-[700px] mx-auto mb-12">
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-2 font-mono block mb-3">
            Pricing
          </span>
          <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-4">
            Choose Your{" "}
            <span className="font-serif font-light italic text-[1.2em]">
              Plan
            </span>
          </h2>
          <p className="text-lg leading-relaxed text-muted font-light">
            {pricingData.tech.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* Custom quote CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted mb-3">
            Need a tailored solution for your organization?
          </p>
          <a
            href={`mailto:${siteConfig.email}?subject=Custom Quote Request`}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
          >
            Request a Custom Quote
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
