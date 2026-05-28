"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { HOURLY_RATE_CONFIG, ADAM_COST_GBP, formatPrice } from "@/lib/currency";

function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-foreground font-medium">{label}</label>
        <span className="text-sm font-semibold text-highlight">{format(value)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-grid-300">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-highlight transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-2 border-highlight shadow-sm pointer-events-none transition-all"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-2">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export default function RoiCalculator() {
  const { currency, convertRaw, convert } = useCurrency();
  const { t } = useLanguage();

  const rateConfig = HOURLY_RATE_CONFIG[currency];

  const [clients, setClients] = useState(10);
  const [hoursPerClient, setHoursPerClient] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(rateConfig.default);
  const [closeRate, setCloseRate] = useState(30);

  // Reset hourly rate when currency changes
  useEffect(() => {
    setHourlyRate(HOURLY_RATE_CONFIG[currency].default);
  }, [currency]);

  const results = useMemo(() => {
    const hoursSaved    = Math.round(clients * hoursPerClient * 0.7);
    const moneySaved    = hoursSaved * hourlyRate;
    const annualSavings = moneySaved * 12;
    // Convert ADAM cost from GBP to selected currency for ROI calculation
    const adamCostLocal = convertRaw(ADAM_COST_GBP, "GBP");
    const adamAnnualCost = adamCostLocal * 12;
    const roi = adamAnnualCost > 0
      ? Math.round(((annualSavings - adamAnnualCost) / adamAnnualCost) * 100)
      : 0;
    return { hoursSaved, moneySaved, annualSavings, adamCostLocal, roi };
  }, [clients, hoursPerClient, hourlyRate, closeRate, convertRaw]);

  const fmt = (n: number) => formatPrice(Math.round(n), currency);

  return (
    <section id="roi-calculator" className="py-20 lg:py-28 px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-14">
          <p className="label-mono mb-3">{t.roi.label}</p>
          <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-4">
            Operational Capacity{" "}
            <span className="font-serif font-light italic text-[1.2em]">Calculator</span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            {t.roi.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Sliders */}
          <div className="bg-white rounded-2xl border border-grid-300 p-8 space-y-8">
            <h3 className="text-sm font-semibold text-foreground">{t.roi.situation}</h3>

            <Slider
              label={t.roi.clients}
              min={1} max={50}
              value={clients}
              onChange={setClients}
              format={(v) => `${v}`}
            />
            <Slider
              label={t.roi.hoursPerClient}
              min={1} max={20}
              value={hoursPerClient}
              onChange={setHoursPerClient}
              format={(v) => `${v}h`}
            />
            <Slider
              label={t.roi.hourlyRate}
              min={rateConfig.min}
              max={rateConfig.max}
              step={rateConfig.step}
              value={hourlyRate}
              onChange={setHourlyRate}
              format={(v) => fmt(v)}
            />
            <Slider
              label={t.roi.closeRate}
              min={10} max={80}
              value={closeRate}
              onChange={setCloseRate}
              format={(v) => `${v}%`}
            />
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="bg-highlight rounded-2xl p-8 text-white">
              <p className="text-sm font-medium opacity-80 mb-2">{t.roi.monthlySavings}</p>
              <p className="text-5xl font-serif font-bold mb-1">{fmt(results.moneySaved)}</p>
              <p className="text-sm opacity-70">{t.roi.savedPerMonth}</p>

              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm font-medium opacity-80 mb-2">{t.roi.annualRoi}</p>
                <p className="text-3xl font-serif font-bold">
                  {results.roi > 0 ? `${results.roi}%` : "—"} ROI
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-grid-300 p-6 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">{t.roi.breakdown}</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-2">{t.roi.hoursSaved}</span>
                  <span className="font-semibold text-foreground">{results.hoursSaved}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-2">{t.roi.valueSaved}</span>
                  <span className="font-semibold text-foreground">{fmt(results.moneySaved)}/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-2">{t.roi.annualSavings}</span>
                  <span className="font-semibold text-foreground">{fmt(results.annualSavings)}</span>
                </div>
                <div className="h-px bg-grid-300" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-2">{t.roi.planCost}</span>
                  <span className="font-medium text-foreground">
                    {t.roi.planCost === "A.D.A.M. plan cost"
                      ? `From ${fmt(results.adamCostLocal)}/mo`
                      : `${fmt(results.adamCostLocal)}/mo`}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-2 pt-1">{t.roi.note}</p>
            </div>

            <Link
              href="/questionnaire"
              className="relative flex items-center justify-center h-12 w-full rounded-xl text-sm font-semibold text-foreground btn-primary-gradient"
            >
              {t.roi.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
