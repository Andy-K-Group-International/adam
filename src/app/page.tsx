import type { Metadata } from "next";
import LandingShell from "@/components/landing/LandingShell";

export const metadata: Metadata = {
  title: "ADAM — Automated Document & Account Manager | Andy'K Group International LTD",
  description:
    "ADAM by Andy'K Group International LTD — lifecycle operations platform that manages your entire client journey from first contact to signed contract. No manual processes, no missed deadlines.",
  alternates: { canonical: "https://adam.andykgroup.com" },
  openGraph: {
    url: "https://adam.andykgroup.com",
    title: "ADAM — Automated Document & Account Manager | Andy'K Group International LTD",
    description:
      "ADAM by Andy'K Group International LTD — lifecycle operations platform that manages your entire client journey from first contact to signed contract. No manual processes, no missed deadlines.",
  },
};

export default function Home() {
  return <LandingShell />;
}
