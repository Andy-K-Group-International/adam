import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Andy'K Group International LTD collects, uses, and safeguards your personal data through the A.D.A.M. platform.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>

        <div className="mt-3 mb-10">
          <p className="text-sm text-muted-2 font-mono">Andy&apos;K Group International LTD</p>
          <p className="text-sm text-muted-2 font-mono">Registered Company Number: 16453500</p>
          <p className="text-sm text-muted-2 font-mono">86&ndash;90 Paul Street, London, EC2A 4NE, United Kingdom</p>
          <p className="text-sm text-muted-2 font-mono">Email: info@andykgroup.com</p>
          <p className="text-sm text-muted-2 font-mono mt-2">Last updated: 7 July 2026</p>
        </div>

        <div className="border-t border-grid-300" />

        <article className="mt-10 space-y-10 text-[15px] leading-relaxed text-muted">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Introduction</h2>
            <p>
              Andy&apos;K Group International LTD (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
              &ldquo;our&rdquo;) operates A.D.A.M. — the AI-Powered Business Development
              Operating System available at adam.andykgroup.com. This Privacy Policy explains
              how we collect, use, store, and safeguard personal data submitted through or
              processed by the A.D.A.M. platform.
            </p>
            <p className="mt-2">
              We comply fully with the UK General Data Protection Regulation (UK GDPR) and the
              UK Data Protection Act 2018.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Data We Collect</h2>
            <p>
              Through the A.D.A.M. platform, we collect personal and business data necessary
              to deliver our client lifecycle management service, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Business contact details (name, job title, company name, business email, phone number)</li>
              <li>Questionnaire responses (business objectives, target market, company background, service requirements)</li>
              <li>Company information (industry, size, jurisdiction, registration details where provided)</li>
              <li>Contract and proposal data (signed agreements, proposal content, versioned documents)</li>
              <li>Invoice and payment information (amounts, payment terms, billing contact)</li>
              <li>Account credentials (email address, hashed password — managed via Supabase Auth)</li>
              <li>Activity data (login events, document views, submission timestamps)</li>
              <li>KYC verification documents (company registry extract, director identity document, power of attorney where applicable, company registration number, VAT number, country of incorporation)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Data</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide access to and operate the A.D.A.M. platform</li>
              <li>Process questionnaire submissions and generate proposals</li>
              <li>Manage contracts, invoices, and client onboarding workflows</li>
              <li>Send transactional notifications (e.g. contract updates, invoice delivery) via email</li>
              <li>Maintain your client portal and activity history</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Legal Basis for Processing</h2>
            <p>Our processing of your data is based on one or more of the following:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-foreground">Contract performance:</strong> processing necessary to deliver the A.D.A.M. service you have engaged</li>
              <li><strong className="text-foreground">Legitimate interests:</strong> operating the platform, maintaining security, and communicating about your account</li>
              <li><strong className="text-foreground">Legal obligation:</strong> retaining records as required by applicable law</li>
              <li><strong className="text-foreground">Consent:</strong> where you have explicitly opted in (e.g. marketing communications)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Processors & Sub-processors</h2>
            <p>We use the following trusted sub-processors to operate A.D.A.M.:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong className="text-foreground">Supabase (EU-West-1, Ireland):</strong> database storage, authentication, and file storage. All data is stored within the European Economic Area.
              </li>
              <li>
                <strong className="text-foreground">Resend:</strong> transactional email delivery (notifications, contract links, invoice emails). Email processing may occur within the EEA via Resend&apos;s EU infrastructure.
              </li>
              <li>
                <strong className="text-foreground">Revolut Business:</strong> payment processing and subscription billing. Revolut acts as a data controller for payment card data; we do not store card details. Subject to Revolut&apos;s own privacy policy.
              </li>
              <li>
                <strong className="text-foreground">Anthropic (Claude AI):</strong> AI-powered evaluation and document generation features. Questionnaire content and client data may be sent to Anthropic&apos;s API for processing. Data is not retained for AI model training under our agreement with Anthropic.
              </li>
              <li>
                <strong className="text-foreground">Vercel:</strong> application hosting and infrastructure. HTTP request metadata (IP address, request headers) is processed by Vercel to serve the platform. Vercel does not access application data stored in Supabase.
              </li>
            </ul>
            <p className="mt-2">
              All sub-processors are contractually required to process data securely and in
              compliance with UK GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Sharing</h2>
            <p>We do not sell or rent your personal data. We may share data only:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>With the sub-processors listed above, strictly to operate the platform</li>
              <li>With regulatory authorities if required by law</li>
              <li>With authorised members of Andy&apos;K Group International LTD who need access to deliver your service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. International Transfers</h2>
            <p>
              Your data is stored and processed within the European Economic Area (EEA).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as required
              to fulfil contractual and legal obligations. Account data is deleted or anonymised
              upon written request, subject to any legal retention requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Your Rights</h2>
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time (where processing is consent-based)</li>
              <li>Lodge a complaint with the UK Information Commissioner&apos;s Office (ICO)</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at info@andykgroup.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Security</h2>
            <p>
              A.D.A.M. uses industry-standard security measures including encrypted connections
              (HTTPS/TLS), row-level security in Supabase, and hashed password storage via
              Supabase Auth. Access to client data is restricted to authorised personnel only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Cookies</h2>
            <p>
              A.D.A.M. uses only essential cookies required for authentication. See our{" "}
              <Link href="/cookies-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Cookie Policy
              </Link>{" "}
              for full details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo;
              date at the top reflects the most recent revision. Continued use of A.D.A.M. after
              changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Contact</h2>
            <p>
              For questions or concerns about this Privacy Policy or our data practices:
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
