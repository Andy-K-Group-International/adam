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
          Last updated: 9 June 2026
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
              advice. For a full description of what is included in each plan, see our{" "}
              <Link href="/service-definition" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Service Definition
              </Link>.
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
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Business verification</h2>
            <p>
              A.D.A.M. is available exclusively to registered businesses and organisations.
              By applying for access, you confirm that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your company is legally incorporated or registered in its country of operation</li>
              <li>You are authorised to enter into agreements on behalf of your company</li>
              <li>All business information provided (company name, registration number, country, contact) is accurate and up to date</li>
            </ul>
            <p className="mt-2">
              We may request supporting documentation to verify business identity before
              activating access. Andy&apos;K Group International LTD reserves the right to
              refuse or revoke access if business information cannot be verified or if false
              or misleading information has been submitted. Providing false information is
              grounds for immediate termination without refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Acceptable use</h2>
            <p>You agree that you will not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use A.D.A.M. for any unlawful purpose or in violation of applicable law</li>
              <li>Submit false, misleading, or fraudulent information through any form or questionnaire</li>
              <li>Attempt to gain unauthorised access to other accounts, the admin dashboard, or backend systems</li>
              <li>Interfere with or disrupt the platform or its infrastructure</li>
              <li>Share client portal links or access credentials with unauthorised parties</li>
              <li>Resell or sublicense access to A.D.A.M. without prior written consent from Andy&apos;K Group International LTD (white-label arrangements are governed by a separate agreement)</li>
            </ul>
            <p className="mt-2">
              We may suspend or terminate access if we reasonably believe these Terms are being
              breached.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Payment and billing</h2>
            <p>
              <strong className="text-foreground">6.1 Payment and activation are separate steps.</strong>{" "}
              Submitting payment places your account in a pending verification state. The service
              subscription period begins only after business verification is completed and your
              account is activated by Andy&apos;K Group International LTD.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">6.2 Service periods.</strong>{" "}
              Annual plans are paid upfront. The 12-month service period begins from the
              activation date, not the payment date. If activation is delayed due to business
              verification, the service period is not affected — the full 12 months begin from
              confirmed activation. Monthly plans: the first billing cycle begins from the
              activation date. Subsequent billing cycles run monthly from that date.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">6.3 Founding Client pricing.</strong>{" "}
              Founding Clients receive a locked pricing guarantee. The monthly rate agreed at
              founding client activation will not increase for the duration of their continuous
              active subscription. This guarantee applies to the plan selected at activation.
              Switching to a different plan resets the pricing lock — the new plan is billed at
              the prevailing standard rate. The pricing lock is also forfeited if you cancel and
              resubscribe. The founding client pricing lock is a binding commercial commitment
              by Andy&apos;K Group International LTD.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">6.4 Currency.</strong>{" "}
              All prices are in GBP (British Pounds). Currency conversion for international
              payments is handled by Revolut (our payment processor) at their prevailing rates.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">6.5 Price changes.</strong>{" "}
              We will provide at least 30 days&rsquo; notice of any price changes. Founding Client
              pricing is exempt from standard price increases for active subscribers.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">6.6 Payment failure.</strong>{" "}
              If a monthly payment fails, a 7-day grace period applies. During this period access
              remains active. After 7 days without successful payment, the account will be
              suspended. Data is retained for 30 days after suspension before the account may
              be terminated.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">6.7 Activation refusal.</strong>{" "}
              Andy&apos;K Group International LTD reserves the right to delay or refuse
              activation pending business verification or implementation review. If activation
              is refused after payment, a full refund will be issued within 14 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Cancellation and refunds</h2>
            <p>
              <strong className="text-foreground">7.1 Cancellation notice.</strong>{" "}
              Clients must provide 30 days written notice to cancel their subscription. Notice must
              be sent to ceo@andykgroup.com. Access continues until the end of the current billing
              period after the notice period expires. No partial refund is issued for unused days
              within the final billing period.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">7.2 Refund entitlement.</strong>{" "}
              Clients are entitled to a full refund if requested within 14 days of payment,
              provided that onboarding and activation have not yet started. Once activation has
              begun, no refund is available except where a verified technical failure prevents
              access for more than 40% of the active service period.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">7.3 Pre-activation refunds.</strong>{" "}
              If activation is refused after payment (e.g., due to failed business verification
              or any other reason decided by Andy&apos;K Group International LTD), a full refund
              will be issued within 14 business days.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">7.4 Data on cancellation.</strong>{" "}
              Upon cancellation, your data is retained for 90 days. You may request an export
              of your data within this window by emailing ceo@andykgroup.com. After 90 days,
              data will be permanently deleted unless a legal or regulatory obligation requires
              otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Suspension</h2>
            <p>
              Andy&apos;K Group International LTD reserves the right to suspend access to
              A.D.A.M. in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Payment failure (see Section 6.6)</li>
              <li>Breach of these Terms, including the Acceptable Use provisions in Section 5</li>
              <li>Suspected misuse, fraud, or misrepresentation</li>
              <li>Failed business verification</li>
              <li>Legal or regulatory requirement</li>
            </ul>
            <p className="mt-2">
              Suspension does not automatically terminate the contract or waive outstanding
              payment obligations. We will endeavour to notify you by email before or promptly
              after suspension.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Documents, proposals, and contracts</h2>
            <p>
              <strong className="text-foreground">9.1 Submissions.</strong> Information submitted
              through questionnaires or forms must be accurate to the best of your knowledge.
              You confirm you have the right to submit it.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">9.2 AI-generated content.</strong> See Section 10
              for full AI terms. AI-generated proposals and documents are for discussion and
              reference purposes only. They are not legally binding unless and until executed
              as a formal contract signed by both parties.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">9.3 Signed contracts.</strong> A contract
              becomes binding only upon valid digital or physical signature by authorised
              representatives of both parties. No engagement, scope, or fee is confirmed
              by submission of a questionnaire or proposal alone.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">9.4 Right to refuse.</strong> We reserve the
              right to decline, pause, or terminate an engagement at any stage if we reasonably
              suspect misrepresentation, fraud, or breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. AI features and terms</h2>
            <p>
              <strong className="text-foreground">10.1 AI as assistance only.</strong>{" "}
              AI features within A.D.A.M. are tools to assist your workflow. They do not
              constitute professional, legal, financial, or strategic advice. All AI-generated
              content must be reviewed and approved by a qualified human before use.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">10.2 Client responsibility.</strong>{" "}
              You are solely responsible for any decisions made based on AI-generated output.
              Andy&apos;K Group International LTD accepts no liability for losses arising from
              reliance on AI-generated proposals, summaries, or analyses without independent
              verification.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">10.3 Data and training.</strong>{" "}
              Andy&apos;K Group International LTD does not use your data or AI interactions to
              train AI models. Data submitted to AI features is processed in real time and is
              not retained by AI providers for training purposes under our agreements with those
              providers.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">10.4 Opting out of AI.</strong>{" "}
              A.D.A.M. is functional without AI features. Clients who prefer not to use
              AI-generated content may request a manual workflow. Contact ceo@andykgroup.com.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">10.5 AI availability.</strong>{" "}
              AI features depend on third-party providers (Anthropic, OpenAI). We cannot
              guarantee uninterrupted AI availability and are not liable for third-party
              provider outages affecting AI features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Support and service levels</h2>
            <p>
              <strong className="text-foreground">11.1 Standard support.</strong>{" "}
              Standard support response time: 48 hours on business days (Monday–Friday,
              excluding UK public holidays). Applies to all plans.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">11.2 Priority support.</strong>{" "}
              Scale plan subscribers and Founding Clients receive priority support with a
              24-hour response time on business days.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">11.3 Response vs resolution.</strong>{" "}
              Response time refers to acknowledgment of support requests. Resolution time
              depends on issue complexity and cannot be guaranteed. Support contact:
              ceo@andykgroup.com.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">11.4 Platform availability.</strong>{" "}
              A.D.A.M. targets 99% uptime, excluding scheduled maintenance windows. Scheduled
              maintenance will be communicated at least 24 hours in advance where operationally
              possible. We are not liable for availability issues caused by third-party
              infrastructure providers (see Section 14).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Intellectual property</h2>
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
            <h2 className="text-lg font-semibold text-foreground mb-3">13. White-label</h2>
            <p>
              White-label use of A.D.A.M. requires a separate White-Label Agreement with
              Andy&apos;K Group International LTD. No white-label relationship exists without
              a signed White-Label Agreement.
            </p>
            <p className="mt-2">
              White-label partners are fully responsible for their sub-clients, data handling,
              and compliance. Andy&apos;K Group International LTD bears no liability for
              sub-client data breaches or misuse by white-label partners or their clients.
              Sub-client data liability, branding rights, and resale restrictions are governed
              exclusively by the White-Label Agreement.
            </p>
            <p className="mt-2">
              Contact ceo@andykgroup.com to discuss white-label terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">14. Third-party services</h2>
            <p>A.D.A.M. integrates the following third-party services. Your use of the platform
              is subject to their respective terms and privacy policies. We are not responsible
              for the availability or conduct of these providers.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-foreground">Supabase</strong> — database and authentication — supabase.com/privacy</li>
              <li><strong className="text-foreground">Resend</strong> — email delivery — resend.com/privacy</li>
              <li><strong className="text-foreground">Revolut Business</strong> — payment processing — revolut.com/legal/privacy</li>
              <li><strong className="text-foreground">Anthropic</strong> — AI features (Claude) — anthropic.com/privacy</li>
              <li><strong className="text-foreground">OpenAI</strong> — optional AI features — openai.com/privacy</li>
              <li><strong className="text-foreground">Vercel</strong> — infrastructure and hosting — vercel.com/legal/privacy-policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">15. Privacy and cookies</h2>
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
            <h2 className="text-lg font-semibold text-foreground mb-3">16. Availability</h2>
            <p>
              We aim to keep A.D.A.M. available at all times but do not guarantee uninterrupted
              or error-free operation. We may update, modify, or suspend the platform at any
              time. We will endeavour to provide notice of planned downtime where possible.
              See Section 11.3 for uptime targets.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">17. Disclaimer of warranties</h2>
            <p>
              To the maximum extent permitted by law, A.D.A.M. and all content within it are
              provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
              any kind, whether express or implied, including implied warranties of
              merchantability, fitness for a particular purpose, or accuracy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">18. Limitation of liability</h2>
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
            <h2 className="text-lg font-semibold text-foreground mb-3">19. Changes to these Terms</h2>
            <p>
              We may revise these Terms from time to time. The &ldquo;Last updated&rdquo; date
              reflects the most recent revision. We will notify active clients by email of material
              changes at least 30 days before they take effect. Continued use of A.D.A.M. after
              changes are published constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">20. Governing law and jurisdiction</h2>
            <p>
              These Terms are governed by the laws of England and Wales. The courts of England
              and Wales shall have exclusive jurisdiction over any disputes arising out of or
              relating to these Terms or your use of A.D.A.M.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">21. Contact</h2>
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
