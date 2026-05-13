import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const TITLE = "ADAM — Automated Document & Account Manager | Andy'K Group";
const DESCRIPTION =
  "ADAM by Andy'K Group — AI-powered system that automates your document management and account workflows. Save time, eliminate manual work.";
const CANONICAL = "https://adam.andykgroup.com";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL),
  title: {
    default: TITLE,
    template: "%s | ADAM by Andy'K Group",
  },
  description: DESCRIPTION,
  keywords: [
    "automated document management",
    "AI account manager",
    "business document automation",
    "AI document system",
    "account management automation",
    "Andy'K Group ADAM",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: CANONICAL,
    siteName: "ADAM by Andy'K Group",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: CANONICAL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ADAM — Automated Document & Account Manager",
  description:
    "ADAM by Andy'K Group — AI-powered system that automates document management, account handling, and client workflows for businesses.",
  keywords:
    "automated document management, AI account manager, business document automation, AI document system, account management automation, Andy'K Group ADAM",
  url: CANONICAL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  provider: {
    "@type": "Organization",
    name: "Andy'K Group",
    url: "https://andykgroup.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "86-90 Paul Street",
      addressLocality: "London",
      postalCode: "EC2A 4NE",
      addressCountry: "GB",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@andykgroup.com",
      contactType: "customer support",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
