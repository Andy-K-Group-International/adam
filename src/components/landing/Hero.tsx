import Link from "next/link";
import { heroData } from "@/lib/data";

export default function Hero() {
  return (
    <section className="relative hero-gradient overflow-hidden">
      {/* Dot grid overlay */}
      <div className="absolute inset-0 cartesian-grid" />

      <div className="relative max-w-[1200px] mx-auto px-8 pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="font-bold tracking-tight leading-[1.2] text-foreground mb-6"
            style={{
              fontSize: "clamp(2.375rem, 1.6rem + 2.75vw, 3.75rem)",
            }}
          >
            {heroData.headline}
          </h1>

          <p className="text-lg md:text-xl leading-relaxed text-muted font-light mb-10 max-w-2xl mx-auto">
            {heroData.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={heroData.primaryCta.href}
              className="btn-primary-gradient rounded-lg px-8 py-3 text-base font-medium w-full sm:w-auto"
            >
              {heroData.primaryCta.label}
            </Link>
            <a
              href={heroData.secondaryCta.href}
              className="btn-secondary rounded-lg px-8 py-3 text-base font-medium w-full sm:w-auto text-center"
            >
              {heroData.secondaryCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
