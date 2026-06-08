import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Unsuccessful — A.D.A.M." };

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-[520px] w-full">

        {/* Status bar */}
        <div className="h-1 bg-error mb-12" />

        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-2 mb-4">
          Payment Unsuccessful
        </p>

        <h1 className="font-serif font-bold text-[2rem] leading-[1.2] text-foreground mb-6">
          Something went wrong.
        </h1>

        <p className="text-sm text-muted leading-relaxed mb-8">
          Your payment could not be processed. No charge has been made to your account.
        </p>

        <div className="border border-grid-300 p-5 mb-8">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-2 mb-3">Common reasons</p>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="text-muted-2 shrink-0 mt-0.5">—</span>
              Insufficient funds or card limit reached
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-2 shrink-0 mt-0.5">—</span>
              Card declined by your bank (try contacting your bank)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-2 shrink-0 mt-0.5">—</span>
              Incorrect card details entered
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-2 shrink-0 mt-0.5">—</span>
              3D Secure authentication failed or timed out
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/#pricing"
            className="flex-1 text-center bg-foreground text-white text-sm font-medium py-3 px-6 hover:bg-foreground/90 transition-colors"
          >
            Try Again →
          </Link>
          <a
            href="mailto:info@andykgroup.com?subject=A.D.A.M. Payment Issue"
            className="flex-1 text-center border border-grid-300 text-foreground text-sm font-medium py-3 px-6 hover:bg-grid-200 transition-colors"
          >
            Contact Support
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
