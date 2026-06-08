import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Confirmed — A.D.A.M." };

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth:  "Growth",
  scale:   "Scale",
};

interface Props {
  searchParams: Promise<{ plan?: string; billing?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { plan, billing } = await searchParams;
  const planLabel = plan ? (PLAN_LABELS[plan] ?? plan) : null;
  const billingLabel = billing === "annual" ? "Annual" : "Monthly";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-[520px] w-full">

        {/* Status bar */}
        <div className="h-1 bg-success mb-12" />

        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-2 mb-4">
          Payment Confirmed
        </p>

        <h1 className="font-serif font-bold text-[2rem] leading-[1.2] text-foreground mb-6">
          Welcome to A.D.A.M.
        </h1>

        {planLabel && (
          <div className="border border-grid-300 p-5 mb-8">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-grid-200">
                  <td className="py-2 font-mono text-[10px] uppercase tracking-wider text-muted-2 w-32">Plan</td>
                  <td className="py-2 text-foreground font-medium">{planLabel}</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-[10px] uppercase tracking-wider text-muted-2">Billing</td>
                  <td className="py-2 text-foreground font-medium">{billingLabel}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <p className="text-sm text-muted leading-relaxed mb-8">
          Your payment has been processed. Our team will be in touch within 24 hours to begin your onboarding. In the meantime, you can explore the client portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 text-center bg-foreground text-white text-sm font-medium py-3 px-6 hover:bg-foreground/90 transition-colors"
          >
            Go to Dashboard →
          </Link>
          <a
            href="mailto:info@andykgroup.com?subject=A.D.A.M. Onboarding"
            className="flex-1 text-center border border-grid-300 text-foreground text-sm font-medium py-3 px-6 hover:bg-grid-200 transition-colors"
          >
            Contact Onboarding Team
          </a>
        </div>

        <div className="mt-12 h-px bg-grid-300" />
        <p className="mt-4 font-mono text-[10px] text-muted-2 uppercase tracking-wider">
          A.D.A.M. — Lifecycle Implementation System · Andy&#8217;K Group International LTD
        </p>
      </div>
    </div>
  );
}
