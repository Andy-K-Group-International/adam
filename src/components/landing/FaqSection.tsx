import {
  Users,
  Landmark,
  UserCheck,
  FileSignature,
  BarChart3,
  Cpu,
} from "lucide-react";
import { faqItems } from "@/lib/data";
import SectionHeader from "./SectionHeader";

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="w-6 h-6" />,
  landmark: <Landmark className="w-6 h-6" />,
  "user-check": <UserCheck className="w-6 h-6" />,
  "file-signature": <FileSignature className="w-6 h-6" />,
  "bar-chart": <BarChart3 className="w-6 h-6" />,
  cpu: <Cpu className="w-6 h-6" />,
};

export default function FaqSection() {
  return (
    <section id="services" className="py-20 px-8">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="SERVICES"
          subtitle="End-to-end solutions for B2B growth, government contracts, and business automation."
        >
          What We Do
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faqItems.map((item) => (
            <div
              key={item.title}
              className="glass-card rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-highlight mb-4">
                {iconMap[item.icon]}
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
