import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how A.D.A.M. uses cookies — essential authentication cookies only, no tracking or advertising.",
  alternates: { canonical: "/cookies-policy" },
};

export default function CookiesPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-[760px] mx-auto px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-2 hover:text-muted transition-colors mb-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to home
        </Link>

        <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-2">
          Cookie Policy
        </h1>

        <div className="mt-3 mb-10">
          <p className="text-sm text-muted-2 font-mono">Andy&apos;K Group International LTD</p>
          <p className="text-sm text-muted-2 font-mono">Company Number: 16453500</p>
          <p className="text-sm text-muted-2 font-mono">86&ndash;90 Paul Street, London, EC2A 4NE, United Kingdom</p>
          <p className="text-sm text-muted-2 font-mono">Email: info@andykgroup.com</p>
          <p className="text-sm text-muted-2 font-mono mt-2">Last Updated: 25 May 2026</p>
        </div>

        <div className="border-t border-grid-300" />

        <article className="mt-10 space-y-10 text-[15px] leading-relaxed text-muted">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              This Cookie Policy explains how A.D.A.M. (adam.andykgroup.com), operated by
              Andy&apos;K Group International LTD, uses cookies when you use the platform.
            </p>
            <p className="mt-2">
              This policy should be read together with our{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Privacy Policy
              </Link>.
              We comply with the UK GDPR, the Data Protection Act 2018, and the Privacy and
              Electronic Communications Regulations (PECR).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website or
              web application. They help the application remember your session and preferences
              between page loads.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Cookies We Use</h2>
            <p>
              A.D.A.M. uses <strong className="text-foreground">strictly necessary cookies only</strong>.
              These are essential for the platform to function — specifically to maintain your
              authenticated session. We do not use analytics, advertising, tracking, or
              functional preference cookies.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6 mb-3">
              Strictly Necessary Cookies
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border border-grid-300">
                <thead>
                  <tr className="bg-grid-300/40 text-left text-foreground">
                    <th className="px-3 py-2 font-medium border-b border-grid-300">Cookie name</th>
                    <th className="px-3 py-2 font-medium border-b border-grid-300">Provider</th>
                    <th className="px-3 py-2 font-medium border-b border-grid-300">Purpose</th>
                    <th className="px-3 py-2 font-medium border-b border-grid-300">Type</th>
                    <th className="px-3 py-2 font-medium border-b border-grid-300">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-grid-300/50">
                    <td className="px-3 py-2 font-mono text-foreground text-[12px]">sb-access-token</td>
                    <td className="px-3 py-2">Supabase</td>
                    <td className="px-3 py-2">Maintains your authenticated session in A.D.A.M.</td>
                    <td className="px-3 py-2">First-party</td>
                    <td className="px-3 py-2">1 hour</td>
                  </tr>
                  <tr className="border-b border-grid-300/50">
                    <td className="px-3 py-2 font-mono text-foreground text-[12px]">sb-refresh-token</td>
                    <td className="px-3 py-2">Supabase</td>
                    <td className="px-3 py-2">Refreshes your session automatically so you stay logged in.</td>
                    <td className="px-3 py-2">First-party</td>
                    <td className="px-3 py-2">60 days</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono text-foreground text-[12px]">sb-auth-token</td>
                    <td className="px-3 py-2">Supabase</td>
                    <td className="px-3 py-2">Stores the auth state used by the Next.js server for secure page rendering.</td>
                    <td className="px-3 py-2">First-party</td>
                    <td className="px-3 py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-muted-2">
              These cookies are set by Supabase, our authentication and database provider
              (hosted in EU-West-1, Ireland). They do not collect personal data beyond what
              is necessary to maintain a secure login session.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. What We Do Not Use</h2>
            <p>A.D.A.M. does <strong className="text-foreground">not</strong> use:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Analytics or tracking cookies (e.g. Google Analytics)</li>
              <li>Advertising or remarketing cookies (e.g. Meta Pixel, Google Ads)</li>
              <li>Third-party functional cookies (e.g. language preferences, chat widgets)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Legal Basis</h2>
            <p>
              Strictly necessary cookies do not require your consent under UK GDPR and PECR.
              They are used on the basis of legitimate interest — specifically, enabling secure
              access to your account in a platform you have actively registered to use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. Note that blocking or
              deleting the authentication cookies above will log you out of A.D.A.M. and
              prevent access to your dashboard and documents.
            </p>
            <p className="mt-2">
              Because we use only essential cookies, there is no consent banner — no opt-in
              or opt-out is required or presented.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy if we introduce new features that require
              additional cookies. Any changes will be reflected in the &ldquo;Last
              Updated&rdquo; date above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Contact</h2>
            <p>
              For questions about this Cookie Policy:
            </p>
            <div className="mt-3 text-sm font-mono text-muted-2 space-y-0.5">
              <p className="font-medium text-foreground">Andy&apos;K Group International LTD</p>
              <p>Email: info@andykgroup.com</p>
              <p>Address: 86&ndash;90 Paul Street, London, EC2A 4NE, United Kingdom</p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
