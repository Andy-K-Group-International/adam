"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { pricingData, commitmentOptions } from "@/lib/data";
import { cn } from "@/lib/utils";
import SectionHeader from "./SectionHeader";

type TabKey = "b2b" | "b2g" | "tech";

const tabs: { key: TabKey; label: string }[] = [
  { key: "b2b", label: "B2B" },
  { key: "b2g", label: "B2G" },
  { key: "tech", label: "A.D.A.M." },
];

function applyDiscount(priceStr: string, discount: number): string {
  // If price is "Custom" or doesn't start with a currency symbol, return as-is
  if (priceStr === "Custom") return priceStr;

  const currencyMatch = priceStr.match(/^([^\d]+)/);
  const currency = currencyMatch ? currencyMatch[1] : "";
  const numericStr = priceStr.replace(/[^\d]/g, "");
  const numericValue = parseInt(numericStr, 10);

  if (isNaN(numericValue) || discount === 0) return priceStr;

  const discounted = Math.round(numericValue * (1 - discount / 100));
  // Format with comma for thousands
  const formatted = discounted.toLocaleString("en-GB");
  return `${currency}${formatted}`;
}

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("b2b");
  const [commitment, setCommitment] = useState(0);

  const currentData = pricingData[activeTab];
  const currentDiscount = commitmentOptions[commitment].discount;

  return (
    <section id="pricing" className="py-20 px-8">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="PRICING"
          subtitle={currentData.subtitle}
        >
          Choose Your Plan
        </SectionHeader>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-grid-300 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-6 py-2 text-sm font-medium rounded-md transition-all",
                  activeTab === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-2 hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Commitment selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 bg-grid-300 rounded-lg p-1">
            {commitmentOptions.map((option, idx) => (
              <button
                key={option.label}
                onClick={() => setCommitment(idx)}
                className={cn(
                  "px-4 py-1.5 text-sm rounded-md transition-all",
                  commitment === idx
                    ? "bg-background text-foreground shadow-sm font-medium"
                    : "text-muted-2 hover:text-foreground"
                )}
              >
                {option.label}
                {option.discount > 0 && (
                  <span className="ml-1 text-xs text-highlight font-medium">
                    -{option.discount}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentData.plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-xl p-8 flex flex-col",
                plan.highlighted
                  ? "glass-card border-2 border-highlight shadow-lg relative"
                  : "glass-card"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-highlight text-white text-xs font-medium px-3 py-1 rounded-full">
                  Popular
                </span>
              )}

              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-2">
                {plan.name}
              </h3>

              <div className="mb-2">
                <span className="text-3xl font-bold text-foreground">
                  {applyDiscount(plan.price, currentDiscount)}
                </span>
                {plan.period && (
                  <span className="text-muted-2 text-sm">{plan.period}</span>
                )}
              </div>

              <p className="text-sm text-muted mb-6">{plan.description}</p>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-highlight shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta === "Contact Us" ? "#contact" : "/questionnaire"}
                className={cn(
                  "rounded-lg px-6 py-2.5 text-sm font-medium text-center transition-all",
                  plan.highlighted
                    ? "btn-primary-gradient"
                    : "btn-secondary"
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
