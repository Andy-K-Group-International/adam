import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NDA Signed — A.D.A.M. | Andy'K Group International LTD",
  robots: { index: false },
};

const LOGO_SVG = (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#0E282D" strokeWidth="4" fill="none" />
    <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="#2F9E9A" strokeWidth="3" fill="none" />
    <text x="50" y="57" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="#0E282D">A</text>
  </svg>
);

export default async function NdaSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const demoUrl = token ? `/demo?token=${token}` : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20">
      {/* Background */}
      <div className="fixed inset-0 cartesian-grid opacity-30 pointer-events-none z-0" />
      <div className="fixed inset-0 hero-gradient pointer-events-none z-0" />

      <div className="relative z-10 max-w-[560px] w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">{LOGO_SVG}</div>

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
          Thank you — your Non-Disclosure Agreement with Andy&#8217;K Group International LTD has been recorded. A confirmation and your demo link have been sent to your email.
        </p>

        {/* Demo access card */}
        {demoUrl && (
          <div className="mt-8 mb-8 rounded-2xl border border-highlight/20 bg-highlight/4 p-7 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-highlight/12 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-highlight" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2">Private Demo Access</p>
                <p className="text-sm font-semibold text-foreground">Your personal demo link is ready</p>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-5">
              This link is unique to you and protected by your NDA. Do not share it.
            </p>
            <Link
              href={demoUrl}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-highlight text-white text-sm font-semibold tracking-wide hover:bg-highlight/90 transition-colors"
            >
              Access Your Private Demo
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-grid-300 mb-8" />

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
        <p className="mt-10 text-xs text-muted-2 font-mono">
          Andy&#8217;K Group International LTD &middot; Reg: 16453500 &middot; 86-90 Paul Street, London, EC2A 4NE
        </p>
      </div>
    </div>
  );
}
