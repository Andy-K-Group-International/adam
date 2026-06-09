"use client";

import Link from "next/link";

const BENEFITS = [
  {
    label: "Locked Pricing",
    body: "Your monthly rate is locked for life. No future price increases, regardless of plan changes.",
  },
  {
    label: "Free Onboarding",
    body: "Full implementation support included at no extra cost. Our team handles the setup end-to-end.",
  },
  {
    label: "Priority Support",
    body: "Direct access to the A.D.A.M. team. Your issues and questions are handled first.",
  },
  {
    label: "Roadmap Influence",
    body: "Your feedback directly shapes the product roadmap. Founding Clients vote on what gets built next.",
  },
];

export default function FoundingClientSection() {
  return (
    <section id="founding" className="relative py-20 px-8 bg-foreground">
      <div className="max-w-[1200px] mx-auto">

        {/* Label */}
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-5">
          Founding Client Access
        </p>

        {/* Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14">
          <div>
            <h2 className="text-[clamp(1.75rem,1.4rem+1.3vw,2.75rem)] font-bold tracking-tight leading-[1.15] text-white mb-5">
              Built with the first 20{" "}
              <span className="font-serif font-light italic">companies</span>{" "}
              — not for them.
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-[480px]">
              A.D.A.M. is opening Founding Client Access to a limited group of 20 companies.
              Founding Clients shape the platform, lock in their pricing, and receive
              implementation support unavailable to future clients.
            </p>
          </div>

          {/* CTA block */}
          <div className="flex flex-col justify-end">
            <div className="border border-white/10 p-6">
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-3">
                Limited availability
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-bold text-white">20</span>
                <span className="text-white/40 text-sm">spots total</span>
              </div>
              <div className="h-px bg-white/10 mb-5" />
              <Link
                href="/questionnaire"
                className="block text-center bg-white text-foreground text-sm font-semibold py-3.5 px-6 hover:bg-white/90 transition-colors mb-3"
              >
                Apply for Founding Client Access →
              </Link>
              <p className="text-white/30 text-xs font-mono text-center leading-relaxed">
                Founding Client Program &mdash; Limited to 20 companies.<br />
                Applications are manually reviewed by Andy&apos;K Group International LTD.<br />
                Selected companies will be contacted with a license activation invitation.
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
