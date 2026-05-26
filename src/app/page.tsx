import type { Metadata } from "next";
import LandingShell from "@/components/landing/LandingShell";

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

export default function Home() {
  return <LandingShell />;
}
