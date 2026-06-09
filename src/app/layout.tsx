import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
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

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const TITLE = "A.D.A.M. — Lifecycle Implementation System by Andy'K Group International LTD";
const DESCRIPTION =
  "A.D.A.M. by Andy'K Group International LTD — structured operational platform that manages your entire client lifecycle from strategic application to active implementation.";
const CANONICAL = "https://adam.andykgroup.com";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL),
  title: {
    default: TITLE,
    template: "%s | A.D.A.M. by Andy'K Group International LTD",
  },
  description: DESCRIPTION,
  keywords: [
    "client lifecycle management",
    "automated document management",
    "business operations platform",
    "client onboarding system",
    "account management automation",
    "Andy'K Group International LTD ADAM",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: CANONICAL,
    siteName: "A.D.A.M. by Andy'K Group International LTD",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/ADAM.png",
        width: 1080,
        height: 1080,
        alt: "A.D.A.M. — Lifecycle Implementation System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/ADAM.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
    "ADAM by Andy'K Group International LTD — lifecycle operations platform that manages document handling, account workflows, and client engagement end-to-end.",
  keywords:
    "automated document management, AI account manager, business document automation, AI document system, account management automation, Andy'K Group International LTD ADAM",
  url: CANONICAL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  provider: {
    "@type": "Organization",
    name: "Andy'K Group International LTD",
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
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${playfairDisplay.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
