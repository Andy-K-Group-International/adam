"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { navLinks } from "@/lib/data";
import CompanyLogo from "./CompanyLogo";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-grid-300">
      <div className="relative max-w-[1200px] mx-auto flex items-center justify-between px-6 sm:px-8 h-[60px]">
        {/* Logo */}
        <a href="#hero" className="shrink-0 text-foreground">
          <CompanyLogo size="md" />
        </a>

        {/* Desktop nav - centered */}
        <div className="hidden md:flex items-center gap-7 text-sm text-muted absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <Link
            href="/questionnaire"
            className="relative inline-flex items-center justify-center h-9 px-5 text-sm font-medium text-foreground btn-primary-gradient"
          >
            <span className="relative z-10">Get Started</span>
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
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMobile}
                className="block py-3 text-base font-medium text-foreground border-b border-grid-300 last:border-b-0"
              >
                {link.label}
              </a>
            ))}

            {/* Mobile CTA */}
            <div className="pt-4">
              <Link
                href="/questionnaire"
                onClick={closeMobile}
                className="relative inline-flex items-center justify-center w-full h-12 text-sm font-medium text-foreground btn-primary-gradient"
              >
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
