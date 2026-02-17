import Hero from "@/components/landing/Hero";
import { HeroBackground } from "@/components/landing/BackgroundGrid";
import TronDivider from "@/components/landing/TronDivider";
import RoadmapSection from "@/components/landing/RoadmapSection";
import PricingSection from "@/components/landing/PricingSection";
import LovedBySection from "@/components/landing/LovedBySection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* Hero area with background layers */}
      <div className="relative overflow-clip">
        <HeroBackground />
        <Hero />
      </div>

      <TronDivider />

      {/* A.D.A.M. Roadmap Section */}
      <RoadmapSection />

      <TronDivider />

      {/* Pricing Plans */}
      <PricingSection />

      <TronDivider />

      {/* <LovedBySection /> */}
      <CtaSection />
      <Footer />
    </main>
  );
}
