import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Service Definition",
  description:
    "What is included in A.D.A.M. plans — features, responsibilities, support scope, and activation process.",
  alternates: { canonical: "/service-definition" },
};

export default function ServiceDefinitionPage() {
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
          Service Definition
        </h1>
        <p className="text-sm text-muted-2 font-mono">(A.D.A.M. Platform — What You Get)</p>

        <p className="text-sm text-muted-2 font-mono mt-4 mb-10">
          Last updated: 8 June 2026
        </p>

        <div className="border-t border-grid-300" />

        <article className="mt-10 space-y-10 text-[15px] leading-relaxed text-muted">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Activation process</h2>
            <p>
              Access to A.D.A.M. is granted in two distinct stages:
            </p>
            <ol className="list-decimal pl-6 mt-3 space-y-2">
              <li>
                <strong className="text-foreground">Payment</strong> — confirms your intent and
                reserves your plan. Your account enters a pending verification state. No billing
                period begins at this stage.
              </li>
              <li>
                <strong className="text-foreground">Activation</strong> — begins after business
                verification documents are reviewed and approved by Andy&apos;K Group International LTD.
                Your subscription period, plan commitments, and any pricing locks begin from your
                activation date, not your payment date.
              </li>
            </ol>
            <p className="mt-3">
              If activation is refused after payment (e.g., due to failed business verification),
              a full refund will be issued within 14 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. What is included in all plans</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Client lifecycle management dashboard</li>
              <li>Questionnaire intake system (public link)</li>
              <li>Proposal generation and management</li>
              <li>Strategy documentation tools</li>
              <li>Contract creation, publishing, and digital signing</li>
              <li>Invoice generation and tracking</li>
              <li>Client onboarding and kick-off workflow</li>
              <li>Activity log and audit trail</li>
              <li>Email notification system (15+ automated triggers)</li>
              <li>Document storage and file management</li>
              <li>KYC verification workflow</li>
              <li>Health and readiness scoring</li>
              <li>Complimentary implementation phase (billing begins only after activation)</li>
              <li>Standard email support (48h target response on business days)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. AI assistance scope</h2>
            <p>
              AI features in A.D.A.M. assist with:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Proposal drafting and content suggestions</li>
              <li>Questionnaire evaluation and qualification scoring</li>
              <li>Market analysis summaries</li>
              <li>Strategy section pre-population</li>
            </ul>
            <p className="mt-3">
              AI features are assistance tools only — not professional advice. All AI-generated
              content must be reviewed and approved by a qualified human before use in any client
              or legal context. Andy&apos;K Group International LTD does not use your data to
              train AI models.
            </p>
            <p className="mt-2">
              A.D.A.M. is fully functional without AI features. Clients may opt out of AI
              assistance and use the manual workflow throughout.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. What is not included</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Custom software development</li>
              <li>Legal or financial advice</li>
              <li>Guaranteed business outcomes</li>
              <li>Third-party API costs (e.g. if you bring your own OpenAI key)</li>
              <li>White-label client management (requires separate white-label agreement)</li>
              <li>Custom integrations (quoted separately)</li>
              <li>Physical deliverables or in-person services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Client responsibilities</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Providing accurate company and contact information at intake</li>
              <li>Submitting required KYC documentation within 14 days of onboarding request</li>
              <li>Reviewing AI-generated proposals, contracts, and summaries before use</li>
              <li>Keeping login credentials secure</li>
              <li>Notifying us of any changes to primary contact or billing information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Support scope</h2>
            <div className="space-y-3">
              <div className="border border-grid-300 p-4">
                <p className="font-medium text-foreground text-sm mb-1">Standard Support (all plans)</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Email support via ceo@andykgroup.com</li>
                  <li>Target response time: 48 hours on UK business days</li>
                  <li>Platform bug reports and account questions</li>
                </ul>
              </div>
              <div className="border border-grid-300 p-4">
                <p className="font-medium text-foreground text-sm mb-1">Priority Support (Scale plan + Founding Clients)</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Email support via ceo@andykgroup.com</li>
                  <li>Target response time: 24 hours on UK business days</li>
                  <li>Dedicated onboarding assistance</li>
                </ul>
              </div>
            </div>
            <p className="mt-3 text-sm">
              Support covers platform usage, account management, and technical issues with A.D.A.M.
              It does not cover third-party service outages, custom development requests, or
              business strategy consulting.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Third-party costs</h2>
            <p>
              A.D.A.M. integrates several third-party services. The following costs are included
              within your plan subscription:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Database and authentication (Supabase)</li>
              <li>Email delivery (Resend) — up to plan limits</li>
              <li>AI assistance features (Anthropic/OpenAI) — up to plan limits</li>
            </ul>
            <p className="mt-3">
              If you choose to use your own API keys for AI providers, associated costs are your
              responsibility. Custom integrations requested outside the standard feature set are
              quoted separately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Custom development</h2>
            <p>
              Custom features, integrations, or modifications to A.D.A.M. beyond the standard
              platform are not included in any subscription plan. All custom development is
              subject to a separate scoping discussion, written proposal, and engagement agreement.
              Contact ceo@andykgroup.com to discuss custom requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Platform availability</h2>
            <p>
              A.D.A.M. targets 99% uptime, excluding scheduled maintenance windows. Scheduled
              maintenance will be communicated at least 24 hours in advance where operationally
              possible. Availability depends in part on third-party infrastructure providers
              (Supabase, Vercel). Andy&apos;K Group International LTD is not liable for outages
              caused by third-party providers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Questions</h2>
            <p>
              For questions about this Service Definition or what is included in your plan:
            </p>
            <div className="mt-3 text-sm font-mono text-muted-2 space-y-0.5">
              <p className="font-medium text-foreground">Andy&apos;K Group International LTD</p>
              <p>Email: ceo@andykgroup.com</p>
              <p>Address: 86&ndash;90 Paul Street, London, EC2A 4NE, United Kingdom</p>
            </div>
            <p className="mt-4 text-sm">
              Full legal terms are available in our{" "}
              <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Terms &amp; Conditions
              </Link>.
            </p>
          </section>

        </article>
      </div>
    </main>
  );
}
