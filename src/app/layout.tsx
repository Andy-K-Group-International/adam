import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import ConvexClientProvider from "@/components/shared/ConvexClientProvider";
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

export const metadata: Metadata = {
  title: "A.D.A.M. — Automated Document & Account Manager",
  description:
    "Business operating system by Andy'K Group International. Manage client lifecycle from intake to contract signing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <Auth0Provider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
