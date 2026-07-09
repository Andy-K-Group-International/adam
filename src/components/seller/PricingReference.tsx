import { pricingData } from "@/lib/data";

// Pulled directly from the same pricingData used on the public pricing
// page — deliberately not copied/re-typed here, so this can never drift out
// of sync with real pricing. GBP is preserved as-is (the source data's real
// currency), not converted — do not relabel these as EUR.

function fmtGBP(amount: number | null): string {
  if (amount == null) return "Custom — Request Quote";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount);
}

export default function PricingReference() {
  return (
    <div className="space-y-6">
      {Object.values(pricingData).map((category) => (
        <div key={category.label}>
          <h4 className="text-sm font-semibold text-foreground mb-1">{category.label}</h4>
          <p className="text-xs text-muted-2 mb-3">{category.subtitle}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono uppercase tracking-wider text-muted-2 border-b border-grid-300">
                  <th className="py-2 pr-4 font-medium">Plan</th>
                  <th className="py-2 pr-4 font-medium">Monthly</th>
                  <th className="py-2 pr-4 font-medium">Annual (per mo.)</th>
                </tr>
              </thead>
              <tbody>
                {category.plans.map((plan) => (
                  <tr key={plan.name} className="border-b border-grid-300 last:border-0">
                    <td className="py-2 pr-4 text-foreground font-medium">{plan.name}</td>
                    <td className="py-2 pr-4 text-muted-2 tabular-nums">{fmtGBP(plan.monthlyGBP)}</td>
                    <td className="py-2 pr-4 text-muted-2 tabular-nums">{fmtGBP(plan.annualGBP)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-2">
        Pulled live from the same pricing data as the public pricing page — always in sync, nothing to update here manually.
      </p>
    </div>
  );
}
