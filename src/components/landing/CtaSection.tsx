import Link from "next/link";
import { siteConfig } from "@/lib/data";

export default function CtaSection() {
  return (
    <section className="bg-foreground py-20 px-8">
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-white mb-4">
          Ready to automate?
        </h2>
        <p className="text-lg text-muted-2 font-light leading-relaxed mb-8 max-w-xl mx-auto">
          Start your journey with {siteConfig.name}. Complete our questionnaire
          and let us build a tailored solution for your business.
        </p>

        <Link
          href="/questionnaire"
          className="btn-primary-gradient rounded-lg px-8 py-3 text-base font-medium inline-block"
        >
          Start Questionnaire
        </Link>

        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-sm text-muted-2">
            {siteConfig.company} &middot; Reg: {siteConfig.companyReg}
          </p>
          <p className="text-sm text-muted-2 mt-1">{siteConfig.address}</p>
        </div>
      </div>
    </section>
  );
}
