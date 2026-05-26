"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

export default function RoiCalculator() {
  const [clients, setClients]       = useState(10);
  const [hoursPerClient, setHoursPerClient] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(150);
  const [closeRate, setCloseRate]   = useState(30);

  const ADAM_COST = 699; // Growth plan monthly GBP

  const results = useMemo(() => {
    const hoursSaved     = Math.round(clients * hoursPerClient * 0.7);
    const moneySaved     = hoursSaved * hourlyRate;
    const annualSavings  = moneySaved * 12;
    const adamAnnualCost = ADAM_COST * 12;
    const roi            = Math.round(((annualSavings - adamAnnualCost) / adamAnnualCost) * 100);
    const additionalClients = Math.round((clients * closeRate) / 100 * 0.25);
    return { hoursSaved, moneySaved, annualSavings, roi };
  }, [clients, hoursPerClient, hourlyRate, closeRate]);

  return (
    <section id="roi-calculator" className="py-20 lg:py-28 px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="label-mono mb-3">ROI Calculator</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-semibold text-foreground tracking-tight mb-4">
            Calculate Your Savings
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            See exactly how much time and money A.D.A.M. saves your business every month.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Sliders */}
          <div className="bg-white rounded-2xl border border-grid-300 p-8 space-y-8">
            <h3 className="text-sm font-semibold text-foreground">Your Current Situation</h3>

            <Slider
              label="New clients per month"
              min={1} max={50}
              value={clients}
              onChange={setClients}
              format={(v) => `${v} clients`}
            />
            <Slider
              label="Admin hours per client"
              min={1} max={20}
              value={hoursPerClient}
              onChange={setHoursPerClient}
              format={(v) => `${v}h`}
            />
            <Slider
              label="Your hourly rate"
              min={50} max={500} step={10}
              value={hourlyRate}
              onChange={setHourlyRate}
              format={(v) => `£${v}`}
            />
            <Slider
              label="Current close rate"
              min={10} max={80}
              value={closeRate}
              onChange={setCloseRate}
              format={(v) => `${v}%`}
            />
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Main result card */}
            <div className="bg-highlight rounded-2xl p-8 text-white">
              <p className="text-sm font-medium opacity-80 mb-2">Monthly savings with A.D.A.M.</p>
              <p className="text-5xl font-serif font-bold mb-1">{fmt(results.moneySaved)}</p>
              <p className="text-sm opacity-70">saved per month</p>

              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm font-medium opacity-80 mb-2">Annual return on investment</p>
                <p className="text-3xl font-serif font-bold">{results.roi > 0 ? `${results.roi}%` : "—"} ROI</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-2xl border border-grid-300 p-6 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-2">Hours saved per month</span>
                  <span className="font-semibold text-foreground">{results.hoursSaved}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-2">Value of time saved</span>
                  <span className="font-semibold text-foreground">{fmt(results.moneySaved)}/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-2">Annual savings</span>
                  <span className="font-semibold text-foreground">{fmt(results.annualSavings)}</span>
                </div>
                <div className="h-px bg-grid-300" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-2">A.D.A.M. plan cost</span>
                  <span className="font-medium text-foreground">From £{ADAM_COST}/mo</span>
                </div>
              </div>
              <p className="text-xs text-muted-2 pt-1">
                Based on A.D.A.M. automating ~70% of admin work. Results vary by business.
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/questionnaire"
              className="relative flex items-center justify-center h-12 w-full rounded-xl text-sm font-semibold text-foreground btn-primary-gradient"
            >
              Start Your Free Assessment →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
