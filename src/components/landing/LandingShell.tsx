"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import Navbar from "./Navbar";
import Hero from "./Hero";
import { HeroBackground } from "./BackgroundGrid";
import TronDivider from "./TronDivider";
import RoadmapSection from "./RoadmapSection";
import IndustrySection from "./IndustrySection";
import RoiCalculator from "./RoiCalculator";
import PricingSection from "./PricingSection";
import CtaSection from "./CtaSection";
import AccessPortal from "./AccessPortal";
import FaqSection from "./FaqSection";
import FoundingClientSection from "./FoundingClientSection";
import Footer from "./Footer";
import AmbientMusic from "./AmbientMusic";

export default function LandingShell() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <main className="[overflow-x:clip]">
          <Navbar />
          <div className="relative overflow-clip">
            <HeroBackground />
            <Hero />
          </div>
          <TronDivider />
          <RoadmapSection />
          <TronDivider />
          <IndustrySection />
          <TronDivider />
          <RoiCalculator />
          <TronDivider />
          <PricingSection />
          <TronDivider />
          <CtaSection />
          <TronDivider />
          <AccessPortal />
          <TronDivider />
          <FaqSection />
          <TronDivider />
          <FoundingClientSection />
          <Footer />
          <AmbientMusic src="/audio/adam-theme.wav" credit="DJ Andy'K" creditUrl="https://www.djandykofficial.com" />
        </main>
      </CurrencyProvider>
    </LanguageProvider>
  );
}
