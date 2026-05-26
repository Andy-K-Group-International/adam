import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and Conditions governing your access to and use of A.D.A.M. — the AI-Powered Business Development Operating System by Andy'K Group International LTD.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsAndConditionsPage() {
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
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-muted-2 font-mono">(Terms of Use — A.D.A.M. Platform)</p>

        <p className="text-sm text-muted-2 font-mono mt-4 mb-10">
          Last updated: 25 May 2026
        </p>

        <div className="border-t border-grid-300" />

        <article className="mt-10 space-y-10 text-[15px] leading-relaxed text-muted">
          <p>
            These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use
            of A.D.A.M. (the AI-Powered Business Development Operating System) operated by
            Andy&apos;K Group International LTD (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
            &ldquo;our&rdquo;) and available at adam.andykgroup.com.
          </p>
          <p>
            By creating an account or using the A.D.A.M. platform, you confirm that you have
            read, understood, and agree to be bound by these Terms. If you do not agree, do
            not use the platform.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Company details</h2>
            <div className="space-y-1">
              <p><strong className="text-foreground">Company name:</strong> Andy&apos;K Group International LTD</p>
              <p><strong className="text-foreground">Company number:</strong> 16453500</p>
              <p><strong className="text-foreground">Registered office:</strong> 86&ndash;90 Paul Street, London, EC2A 4NE, United Kingdom</p>
              <p><strong className="text-foreground">Email:</strong> legal@andykgroup.com</p>
              <p><strong className="text-foreground">Platform:</strong> adam.andykgroup.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. The A.D.A.M. service</h2>
            <p>
              A.D.A.M. is a client lifecycle management system that automates business
              development workflows including questionnaire intake, proposal generation,
              contract management, invoicing, and client onboarding. Access is granted to
              registered users (clients and administrators) under the terms of a separate
              engagement agreement.
            </p>
            <p className="mt-2">
              The platform and all content within it are provided for business purposes only.
              Nothing within A.D.A.M. constitutes legal, tax, financial, or other professional
              advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Account access and eligibility</h2>
            <p>To use A.D.A.M. you must:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Be a registered business or authorised representative of one</li>
              <li>Provide accurate information during account creation and questionnaire submission</li>
              <li>Keep your login credentials secure and not share them with unauthorised persons</li>
            </ul>
            <p className="mt-2">
              You are responsible for all activity that occurs under your account. Notify us
              immediately at legal@andykgroup.com if you suspect unauthorised access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Acceptable use</h2>
            <p>You agree that you will not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use A.D.A.M. for any unlawful purpose or in violation of applicable law</li>
              <li>Submit false, misleading, or fraudulent information through any form or questionnaire</li>
              <li>Attempt to gain unauthorised access to other accounts, the admin dashboard, or backend systems</li>
              <li>Interfere with or disrupt the platform or its infrastructure</li>
              <li>Share client portal links or access credentials with unauthorised parties</li>
            </ul>
            <p className="mt-2">
              We may suspend or terminate access if we reasonably believe these Terms are being
              breached.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Documents, proposals, and contracts</h2>
            <p>
              <strong className="text-foreground">5.1 Submissions.</strong> Information submitted
              through questionnaires or forms must be accurate to the best of your knowledge.
              You confirm you have the right to submit it.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">5.2 AI-generated content.</strong> Proposals
              and summaries generated by A.D.A.M. are produced using AI assistance and are
              for discussion purposes only. They are not legally binding unless and until
              executed as a formal contract signed by both parties.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">5.3 Signed contracts.</strong> A contract
              becomes binding only upon valid digital or physical signature by authorised
              representatives of both parties. No engagement, scope, or fee is confirmed
              by submission of a questionnaire or proposal alone.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">5.4 Right to refuse.</strong> We reserve the
              right to decline, pause, or terminate an engagement at any stage if we reasonably
              suspect misrepresentation, fraud, or breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Intellectual property</h2>
            <p>
              All elements of the A.D.A.M. platform — including its design, workflows,
              templates, AI logic, generated documents, and codebase — are owned by or
              licensed to Andy&apos;K Group International LTD and protected by intellectual
              property law.
            </p>
            <p className="mt-2">
              Documents generated specifically for your engagement (proposals, contracts,
              invoices) are licensed for your internal business use only. You must not
              reproduce, redistribute, or reverse-engineer any part of the platform or its
              output without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Third-party services</h2>
            <p>
              A.D.A.M. integrates third-party services including Supabase (database and
              authentication) and Resend (email delivery). Your use of the platform is also
              subject to the terms and privacy policies of these providers. We are not
              responsible for the availability or conduct of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Privacy and cookies</h2>
            <p>
              Our collection and use of personal data is described in our{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Privacy Policy
              </Link>.
              Our use of cookies is described in our{" "}
              <Link href="/cookies-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Cookie Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Availability</h2>
            <p>
              We aim to keep A.D.A.M. available at all times but do not guarantee uninterrupted
              or error-free operation. We may update, modify, or suspend the platform at any
              time. We will endeavour to provide notice of planned downtime where possible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Disclaimer of warranties</h2>
            <p>
              To the maximum extent permitted by law, A.D.A.M. and all content within it are
              provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
              any kind, whether express or implied, including implied warranties of
              merchantability, fitness for a particular purpose, or accuracy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Limitation of liability</h2>
            <p>To the maximum extent permitted by law:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                We will not be liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of A.D.A.M. or any documents generated
                by it
              </li>
              <li>
                Our total liability for any claim shall not exceed the fees paid by you in the
                three months preceding the claim, except where such limitation is not permitted
                by law
              </li>
            </ul>
            <p className="mt-2">
              Nothing in these Terms limits liability for death or personal injury caused by
              negligence, fraud, or fraudulent misrepresentation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Changes to these Terms</h2>
            <p>
              We may revise these Terms from time to time. The &ldquo;Last updated&rdquo; date
              reflects the most recent revision. Continued use of A.D.A.M. after changes are
              published constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Governing law and jurisdiction</h2>
            <p>
              These Terms are governed by the laws of England and Wales. The courts of England
              and Wales shall have exclusive jurisdiction over any disputes arising out of or
              relating to these Terms or your use of A.D.A.M.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">14. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
            </p>
            <div className="mt-3 text-sm font-mono text-muted-2 space-y-0.5">
              <p className="font-medium text-foreground">Andy&apos;K Group International LTD</p>
              <p>Email: legal@andykgroup.com</p>
              <p>Address: 86&ndash;90 Paul Street, London, EC2A 4NE, United Kingdom</p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
