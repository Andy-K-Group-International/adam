import { Star } from "lucide-react";

const ITEMS = [
  "Annual Operational Review",
  "Compliance Readiness Review",
  "Annual Review Report PDF",
  "Dedicated Instance",
  "Custom SLA",
];

export default function EnterpriseTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-xs font-mono text-muted-2 uppercase tracking-[0.2em] mb-1">Enterprise Add-ons</p>
        <h3 className="text-base font-semibold text-foreground">Enterprise Features</h3>
        <p className="text-sm text-muted-2 mt-0.5">
          Enterprise plan features are available upon request.
        </p>
      </div>

      <div className="border border-grid-300 bg-white divide-y divide-grid-300">
        {ITEMS.map((item) => (
          <div key={item} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-muted-2 shrink-0" />
              <span className="text-sm text-foreground">{item}</span>
            </div>
            <span className="text-xs font-mono text-muted-2 border border-grid-300 px-2 py-0.5">Coming Soon</span>
          </div>
        ))}
      </div>

      <div className="border border-highlight/20 bg-highlight/5 px-5 py-4">
        <p className="text-sm text-foreground font-medium mb-1">Request Enterprise Features</p>
        <p className="text-sm text-muted-2">
          Contact us to discuss Enterprise add-ons and custom arrangements for this client.
        </p>
        <a
          href="mailto:ceo@andykgroup.com?subject=Enterprise Features Request"
          className="inline-block mt-3 text-sm text-highlight hover:underline underline-offset-2"
        >
          ceo@andykgroup.com →
        </a>
      </div>
    </div>
  );
}
