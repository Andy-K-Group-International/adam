"use client";

import { roadmapSteps } from "@/lib/data";

const STEP_ICONS = [
  // Clipboard - Questionnaire
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Document - Proposal
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Shield/Contract - Contract
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Map - Strategy
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Currency - Invoice
  <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Rocket - Kick-off
  <svg key="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

function ArrowDown() {
  return (
    <div className="flex justify-center py-2">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-5 h-5 text-highlight"
      >
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ArrowRight() {
  return (
    <div className="hidden lg:flex items-center px-2">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-5 h-5 text-highlight"
      >
        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function RoadmapCard({
  item,
  icon,
  stepNumber,
}: {
  item: { title: string; description: string };
  icon: React.ReactNode;
  stepNumber: number;
}) {
  return (
    <div className="relative flex-1 max-w-[340px] group">
      <div className="glass-card rounded-xl p-6 h-full flex flex-col transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        {/* Step number + icon */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(245,192,192,0.2), rgba(205,160,165,0.15))",
              color: "#cda0a5",
            }}
          >
            {icon}
          </div>
          <span className="text-[11px] font-mono text-muted-2 uppercase tracking-wider">
            Step {stepNumber}
          </span>
        </div>

        <h4 className="text-base font-bold text-foreground tracking-tight mb-2">
          {item.title}
        </h4>
        <p className="text-sm text-muted leading-relaxed flex-1">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default function RoadmapSection() {
  return (
    <section id="process" className="relative py-20 px-8">
      <div className="line-grid line-grid-fade" />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Section header */}
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-4">
            How A.D.A.M.
            <br />
            <span className="font-serif font-light italic text-[1.2em]">
              Works
            </span>
          </h2>
          <p className="text-lg leading-relaxed text-muted font-light">
            From first contact to project launch in six structured steps.
          </p>
        </div>

        {/* Roadmap - Desktop: 3x2 grid with arrows, Mobile: vertical */}
        <div className="hidden lg:block">
          {/* Row 1 */}
          <div className="flex items-stretch justify-center">
            {roadmapSteps.slice(0, 3).map((item, i) => (
              <div key={item.step} className="contents">
                <RoadmapCard item={item} icon={STEP_ICONS[i]} stepNumber={i + 1} />
                {i < 2 && <ArrowRight />}
              </div>
            ))}
          </div>

          {/* Spacer between rows */}
          <div className="h-6" />

          {/* Row 2 */}
          <div className="flex items-stretch justify-center">
            {roadmapSteps.slice(3, 6).map((item, i) => (
              <div key={item.step} className="contents">
                <RoadmapCard item={item} icon={STEP_ICONS[i + 3]} stepNumber={i + 4} />
                {i < 2 && <ArrowRight />}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical list */}
        <div className="lg:hidden flex flex-col items-center">
          {roadmapSteps.map((item, i) => (
            <div key={item.step}>
              <RoadmapCard item={item} icon={STEP_ICONS[i]} stepNumber={i + 1} />
              {i < roadmapSteps.length - 1 && <ArrowDown />}
            </div>
          ))}
        </div>

        {/* Status badge */}
        <div className="text-center mt-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-grid-500 bg-white text-sm text-muted">
            <span className="w-2 h-2 rounded-full bg-highlight animate-pulse" />
            A.D.A.M. is live and processing clients
          </span>
        </div>
      </div>
    </section>
  );
}
