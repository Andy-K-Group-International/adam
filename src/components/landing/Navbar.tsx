"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

function AdamLogo() {
  return (
    <div className="flex items-center gap-2">
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{ mixBlendMode: "screen", height: "48px", width: "auto" }}
      >
        <source src="/images/adam-logo.mp4" type="video/mp4" />
        <img src="/images/adam-logo.png" alt="A.D.A.M." style={{ height: "48px" }} />
      </video>
      <span className="text-sm font-bold tracking-tight text-foreground">A.D.A.M.</span>
    </div>
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
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-grid-300">
        <div className="relative max-w-[1200px] mx-auto flex items-center justify-between px-6 sm:px-8 h-[60px]">
          {/* Logo */}
          <a href="#hero" className="shrink-0">
            <AdamLogo />
          </a>

          {/* Desktop nav — centered */}
          <div className="hidden md:flex items-center gap-7 text-sm text-muted absolute left-1/2 -translate-x-1/2">
            <a href="#process" className="hover:text-foreground transition-colors">{t.nav.features}</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">{t.nav.pricing}</a>
            <Link href="/request-demo" className="hover:text-foreground transition-colors">{t.nav.demo}</Link>
            <a href="#contact" className="hover:text-foreground transition-colors">{t.nav.contact}</a>
          </div>

          {/* Desktop right: currency + Admin + CTA */}
          <div className="hidden md:flex items-center gap-2">
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
              href="/sign-in?role=admin"
              className="text-xs text-muted-2 hover:text-foreground transition-colors px-2"
            >
              Admin
            </Link>

            <Link
              href="/questionnaire"
              className="relative inline-flex items-center justify-center h-9 px-5 text-sm font-medium text-foreground btn-primary-gradient"
            >
              <span className="relative z-10">{t.nav.applyForAccess}</span>
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
      </nav>

      {/* Mobile menu — rendered outside <nav> to avoid z-index stacking context issues */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-[200] overflow-y-auto"
          style={{ top: "60px", backgroundColor: "#f0f4f4" }}
        >
          <div className="px-6 py-6 space-y-1">
            <a
              href="#process"
              onClick={closeMobile}
              className="block py-3 text-base font-medium border-b border-grid-300"
              style={{ color: "#0E282D" }}
            >
              {t.nav.features}
            </a>
            <a
              href="#pricing"
              onClick={closeMobile}
              className="block py-3 text-base font-medium border-b border-grid-300"
              style={{ color: "#0E282D" }}
            >
              {t.nav.pricing}
            </a>
            <Link
              href="/request-demo"
              onClick={closeMobile}
              className="block py-3 text-base font-medium border-b border-grid-300"
              style={{ color: "#0E282D" }}
            >
              {t.nav.demo}
            </Link>
            <a
              href="#contact"
              onClick={closeMobile}
              className="block py-3 text-base font-medium border-b border-grid-300"
              style={{ color: "#0E282D" }}
            >
              {t.nav.contact}
            </a>
            <Link
              href="/sign-in?role=admin"
              onClick={closeMobile}
              className="block py-3 text-sm border-b border-grid-300"
              style={{ color: "#8b93a8" }}
            >
              Admin Access
            </Link>

            {/* Mobile language + currency */}
            <div className="pt-4 pb-2 flex items-center gap-3">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                aria-label="Select language"
                className="text-sm border border-grid-500 rounded px-2 py-2 cursor-pointer focus:outline-none flex-1"
                style={{ color: "#525a70", backgroundColor: "#f0f4f4" }}
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
                className="text-sm border border-grid-500 rounded px-2 py-2 cursor-pointer focus:outline-none flex-1"
                style={{ color: "#525a70", backgroundColor: "#f0f4f4" }}
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
                <span className="relative z-10">{t.nav.applyForAccess}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
