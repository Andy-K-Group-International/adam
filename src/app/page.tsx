import type { Metadata } from "next";
import LandingShell from "@/components/landing/LandingShell";

export const metadata: Metadata = {
  title: "A.D.A.M. — Lifecycle Implementation System | Andy'K Group International LTD",
  description:
    "A.D.A.M. by Andy'K Group International LTD — lifecycle operations platform that manages your entire client journey from first contact to signed contract. No manual processes, no missed deadlines.",
  alternates: { canonical: "https://adam.andykgroup.com" },
  openGraph: {
    url: "https://adam.andykgroup.com",
    title: "A.D.A.M. — Lifecycle Implementation System | Andy'K Group International LTD",
    description:
      "A.D.A.M. by Andy'K Group International LTD — lifecycle operations platform that manages your entire client journey from first contact to signed contract. No manual processes, no missed deadlines.",
  },
};

export default function Home() {
  return <LandingShell />;
}
