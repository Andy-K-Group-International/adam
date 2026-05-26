"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CompanyLogo from "./CompanyLogo";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { CURRENCIES } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/currency";
import type { Locale } from "@/lib/translations";

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  const { currency, setCurrency } = useCurrency();
  const { locale, setLocale, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function closeMobile() { setMobileOpen(false); }

  const selectCls = "text-xs text-muted bg-transparent border border-grid-500 rounded px-1.5 py-1 cursor-pointer hover:border-foreground/40 transition-colors focus:outline-none";

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-grid-300">
      <div className="relative max-w-[1200px] mx-auto flex items-center justify-between px-6 sm:px-8 h-[60px]">
        {/* Logo */}
        <a href="#hero" className="shrink-0 text-foreground">
          <CompanyLogo size="md" />
        </a>

        {/* Desktop nav — centered */}
        <div className="hidden md:flex items-center gap-7 text-sm text-muted absolute left-1/2 -translate-x-1/2">
          <a href="#process" className="hover:text-foreground transition-colors">{t.nav.process}</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">{t.nav.pricing}</a>
        </div>

        {/* Desktop right: language + currency + CTA */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language select */}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            aria-label="Select language"
            className={`${selectCls} w-[52px]`}
          >
            <option value="en">EN</option>
            <option value="sk">SK</option>
            <option value="de">DE</option>
            <option value="es">ES</option>
            <option value="nl">NL</option>
            <option value="pt">PT</option>
          </select>

          {/* Currency select */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            aria-label="Select currency"
            className={`${selectCls} w-[64px]`}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>

          <Link
            href="/questionnaire"
            className="relative inline-flex items-center justify-center h-9 px-5 ml-1 text-sm font-medium text-foreground btn-primary-gradient"
          >
            <span className="relative z-10">{t.nav.getStarted}</span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 -mr-2 text-foreground"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] z-40 bg-white overflow-y-auto">
          <div className="px-6 py-6 space-y-1">
            <a href="#process" onClick={closeMobile} className="block py-3 text-base font-medium text-foreground border-b border-grid-300">
              {t.nav.process}
            </a>
            <a href="#pricing" onClick={closeMobile} className="block py-3 text-base font-medium text-foreground border-b border-grid-300">
              {t.nav.pricing}
            </a>

            {/* Mobile language + currency */}
            <div className="pt-4 pb-2 flex items-center gap-3">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                aria-label="Select language"
                className="text-sm text-muted bg-transparent border border-grid-500 rounded px-2 py-2 cursor-pointer focus:outline-none flex-1"
              >
                <option value="en">EN — English</option>
                <option value="sk">SK — Slovenčina</option>
                <option value="de">DE — Deutsch</option>
                <option value="es">ES — Español</option>
                <option value="nl">NL — Nederlands</option>
                <option value="pt">PT — Português</option>
              </select>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                aria-label="Select currency"
                className="text-sm text-muted bg-transparent border border-grid-500 rounded px-2 py-2 cursor-pointer focus:outline-none flex-1"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Mobile CTA */}
            <div className="pt-2">
              <Link
                href="/questionnaire"
                onClick={closeMobile}
                className="relative inline-flex items-center justify-center w-full h-12 text-sm font-medium text-foreground btn-primary-gradient"
              >
                <span className="relative z-10">{t.nav.getStarted}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
