const industries = [
  {
    label: "Hospitality",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M3 10h14M3 10V6a1 1 0 011-1h12a1 1 0 011 1v4M3 10v6h14v-6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 16v-3h4v3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Technology",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M6 8l-3 2 3 2M14 8l3 2-3 2M11 6l-2 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Legal",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M10 2v16M4 6l6-4 6 4M5 10l-2 5h4L5 10zM15 10l-2 5h4l-2-5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Finance",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M3 17V9M7 17V5M11 17v-6M15 17V7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Consulting",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <rect x="3" y="7" width="14" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 7V5a3 3 0 016 0v2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Real Estate",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M3 18V8l7-5 7 5v10M8 18v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Travel",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M3 12l2-2 4 1 5-6 1 1-4 6 1 4-2 2-2-3-3-1-2 1V12z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Healthcare",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M10 4v12M4 10h12" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="3" width="14" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "E-commerce",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M3 3h2l.5 2.5M5.5 5.5L7 13h9l1.5-7.5H5.5z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="16" r="1" />
        <circle cx="15" cy="16" r="1" />
      </svg>
    ),
  },
  {
    label: "Other",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 7v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function IndustrySection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-2 font-mono block mb-3">
            {t.industry.label}
          </span>
          <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-4">
            {t.industry.headingPrefix}{" "}
            <span className="font-serif font-light italic text-[1.2em]">
              {t.industry.headingItalic}
            </span>
          </h2>
          <p className="text-lg leading-relaxed text-muted font-light">
            {t.industry.description}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {industries.map(({ label, icon }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-grid-300 bg-white text-sm text-muted hover:border-grid-500 hover:text-foreground transition-colors duration-200"
            >
              <span className="text-muted-2">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
