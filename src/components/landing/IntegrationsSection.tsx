import { Bot, Sparkles, Check } from "lucide-react";
import { integrationFeatures } from "@/lib/data";
import SectionHeader from "./SectionHeader";

export default function IntegrationsSection() {
  return (
    <section className="py-20 px-8">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="TECHNOLOGY"
          subtitle="Two intelligent systems working together to automate your entire operation."
        >
          Powered by Intelligence
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {integrationFeatures.map((feature) => (
            <div
              key={feature.name}
              className="glass-card rounded-xl p-8 relative"
            >
              {feature.comingSoon && (
                <span className="absolute top-4 right-4 bg-highlight/10 text-highlight text-xs font-medium px-3 py-1 rounded-full border border-highlight/20">
                  Coming Soon
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-highlight/10 flex items-center justify-center text-highlight">
                  {feature.name === "A.D.A.M." ? (
                    <Bot className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {feature.name}
                  </h3>
                  <p className="text-xs text-muted-2">{feature.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-muted leading-relaxed mb-6">
                {feature.description}
              </p>

              <ul className="space-y-2">
                {feature.features.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <Check className="w-4 h-4 text-highlight shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
