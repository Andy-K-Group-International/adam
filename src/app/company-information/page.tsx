import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Company Information",
  description: "Legal and company details for Andy'K Group International LTD, operator of A.D.A.M.",
  alternates: { canonical: "/company-information" },
};

export default function CompanyInformationPage() {
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
          Company Information
        </h1>
        <p className="text-sm text-muted-2 font-mono mt-4 mb-10">Legal details — Andy&apos;K Group International LTD</p>

        <div className="border-t border-grid-300" />

        <article className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Registered company details</h2>
            <div className="bg-white border border-grid-300 divide-y divide-grid-300">
              {[
                { label: "Company name",    value: "Andy'K Group International LTD" },
                { label: "Company number",  value: "16453500" },
                { label: "Registered in",   value: "England and Wales" },
                { label: "Registered office", value: "86–90 Paul Street, London, EC2A 4NE, United Kingdom" },
                { label: "VAT number",      value: "Pending registration" },
                { label: "Platform",        value: "adam.andykgroup.com" },
                { label: "Corporate site",  value: "andykgroup.com" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-4 px-5 py-3">
                  <span className="w-40 shrink-0 text-xs font-mono text-muted-2 pt-0.5">{label}</span>
                  <span className="text-sm text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Contact</h2>
            <div className="bg-white border border-grid-300 divide-y divide-grid-300">
              {[
                { label: "General",  value: "info@andykgroup.com" },
                { label: "Legal",    value: "legal@andykgroup.com" },
                { label: "Support",  value: "ceo@andykgroup.com" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-4 px-5 py-3">
                  <span className="w-40 shrink-0 text-xs font-mono text-muted-2 pt-0.5">{label}</span>
                  <a href={`mailto:${value}`} className="text-sm text-highlight hover:underline underline-offset-2">{value}</a>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">A.D.A.M. platform</h2>
            <p>
              A.D.A.M. (Automated Document &amp; Account Manager) is a client lifecycle management
              platform developed and operated by Andy&apos;K Group International LTD. It is
              available exclusively to registered businesses and organisations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Regulatory status</h2>
            <p>
              Andy&apos;K Group International LTD is a private limited company incorporated in
              England and Wales. The company is not a financial services provider, law firm, or
              regulated entity under the Financial Services and Markets Act 2000. A.D.A.M.
              does not provide legal, financial, or regulatory advice.
            </p>
          </section>

          <div className="pt-4 border-t border-grid-300">
            <p className="text-sm text-muted-2">
              For full legal terms, see our{" "}
              <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms &amp; Conditions</Link>,{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</Link>, and{" "}
              <Link href="/service-definition" className="underline underline-offset-2 hover:text-foreground transition-colors">Service Definition</Link>.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
