import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NDA Signed — A.D.A.M. | Andy'K Group International LTD",
  robots: { index: false },
};

const LOGO_SVG = (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#01011b" strokeWidth="4" fill="none" />
    <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#c9707d" strokeWidth="3" fill="none" />
    <text x="50" y="57" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="#01011b">A</text>
  </svg>
);

export default function NdaSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20">
      {/* Background */}
      <div className="fixed inset-0 cartesian-grid opacity-30 pointer-events-none z-0" />
      <div className="fixed inset-0 hero-gradient pointer-events-none z-0" />

      <div className="relative z-10 max-w-[520px] w-full text-center">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          {LOGO_SVG}
        </div>

        {/* Check circle */}
        <div className="w-16 h-16 rounded-full bg-highlight/10 border border-highlight/20 flex items-center justify-center mx-auto mb-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-highlight" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-bold tracking-tight leading-[1.2] text-foreground mb-4" style={{ fontSize: "clamp(1.75rem, 1.3rem + 1.5vw, 2.5rem)" }}>
          Your NDA has been{" "}
          <span className="font-serif font-light italic text-[1.1em]">signed</span>
        </h1>

        <p className="text-base text-muted leading-relaxed mb-3">
          Thank you — your Non-Disclosure Agreement with Andy&#8217;K Group International LTD has been recorded and a confirmation has been sent to your email.
        </p>

        <p className="text-base text-muted leading-relaxed mb-10">
          Our team will be in touch within <strong className="text-foreground font-medium">24 hours</strong> to schedule your A.D.A.M. demo.
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-grid-300 mb-10" />

        {/* Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://andykgroup.com"
            className="px-6 py-3 bg-foreground text-white text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Visit Andy&#8217;K Group
          </a>
          <Link
            href="/"
            className="px-6 py-3 border border-grid-300 text-foreground text-sm font-medium hover:border-foreground/40 transition-colors"
          >
            Back to A.D.A.M.
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-xs text-muted-2 font-mono">
          Andy&#8217;K Group International LTD &middot; Reg: 16453500 &middot; 86-90 Paul Street, London, EC2A 4NE
        </p>
      </div>
    </div>
  );
}
