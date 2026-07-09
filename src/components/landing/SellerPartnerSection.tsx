"use client";

import Link from "next/link";

const BENEFITS = [
  {
    label: "Commission-Based",
    body: "Earn commission on every company you refer that becomes a paying A.D.A.M. client. No cap on referrals.",
  },
  {
    label: "Your Own Link",
    body: "A unique referral link and code. Every submission through it is tracked and attributed automatically.",
  },
  {
    label: "Sales Resources",
    body: "Pitch materials, pricing reference, and answers to common questions — ready to use from day one.",
  },
  {
    label: "Manually Reviewed",
    body: "Every application is reviewed personally by Andy'K Group International LTD before access is granted.",
  },
];

export default function SellerPartnerSection() {
  return (
    <section id="seller-partner" className="relative py-20 px-8 bg-foreground">
      <div className="max-w-[1200px] mx-auto">

        {/* Label */}
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-5">
          Seller Partner Program
        </p>

        {/* Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14">
          <div>
            <h2 className="text-[clamp(1.75rem,1.4rem+1.3vw,2.75rem)] font-bold tracking-tight leading-[1.15] text-white mb-5">
              Know a company that needs this?{" "}
              <span className="font-serif font-light italic">Get paid to say so.</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-[480px]">
              A.D.A.M. is opening a seller partner program for people who can introduce us
              to the right companies. Refer a client, and earn commission when they sign on
              — no account needed to apply, just tell us about yourself.
            </p>
          </div>

          {/* CTA block */}
          <div className="flex flex-col justify-end">
            <div className="border border-white/10 p-6">
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-3">
                Starting commission rate
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-bold text-white">10%</span>
                <span className="text-white/40 text-sm">per referred client</span>
              </div>
              <div className="h-px bg-white/10 mb-5" />
              <Link
                href="/become-a-seller"
                className="block text-center bg-white text-foreground text-sm font-semibold py-3.5 px-6 hover:bg-white/90 transition-colors mb-3"
              >
                Apply to Become a Seller →
              </Link>
              <p className="text-white/30 text-xs font-mono text-center leading-relaxed">
                Seller Partner Program &mdash; Not a client account.<br />
                Applications are manually reviewed by Andy&apos;K Group International LTD.<br />
                Approved applicants receive an invitation to register and sign the Seller Partner Agreement.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {BENEFITS.map((b) => (
            <div key={b.label} className="bg-foreground p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">
                {b.label}
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                {b.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
