import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LogoBar from "@/components/landing/LogoBar";
import TronDivider from "@/components/landing/TronDivider";
import RoadmapSection from "@/components/landing/RoadmapSection";
import TestimonialPair from "@/components/landing/TestimonialPair";
import PricingSection from "@/components/landing/PricingSection";
import LovedBySection from "@/components/landing/LovedBySection";
import FaqSection from "@/components/landing/FaqSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import ContactForm from "@/components/landing/ContactForm";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <LogoBar />
      <TronDivider />
      <RoadmapSection />
      <TronDivider />
      <TestimonialPair />
      <TronDivider />
      <PricingSection />
      <TronDivider />
      <LovedBySection />
      <FaqSection />
      <IntegrationsSection />
      <ContactForm />
      <CtaSection />
      <Footer />
    </>
  );
}
