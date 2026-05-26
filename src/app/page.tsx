import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

export const metadata: Metadata = {
  title: "ADAM — Automated Document & Account Manager | Andy'K Group International LTD",
  description:
    "ADAM by Andy'K Group International LTD — AI-powered system that automates your document management and account workflows. Save time, eliminate manual work.",
  alternates: { canonical: "https://adam.andykgroup.com" },
  openGraph: {
    url: "https://adam.andykgroup.com",
    title: "ADAM — Automated Document & Account Manager | Andy'K Group International LTD",
    description:
      "ADAM by Andy'K Group International LTD — AI-powered system that automates your document management and account workflows. Save time, eliminate manual work.",
  },
};
import { HeroBackground } from "@/components/landing/BackgroundGrid";
import TronDivider from "@/components/landing/TronDivider";
import RoadmapSection from "@/components/landing/RoadmapSection";
import IndustrySection from "@/components/landing/IndustrySection";
import PricingSection from "@/components/landing/PricingSection";
import RoiCalculator from "@/components/landing/RoiCalculator";
import LovedBySection from "@/components/landing/LovedBySection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      {/* Hero area with background layers */}
      <div className="relative overflow-clip">
        <HeroBackground />
        <Hero />
      </div>

      <TronDivider />

      {/* A.D.A.M. Roadmap Section */}
      <RoadmapSection />

      <TronDivider />

      {/* Industry section */}
      <IndustrySection />

      <TronDivider />

      {/* ROI Calculator */}
      <RoiCalculator />

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
