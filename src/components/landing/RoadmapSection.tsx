import {
  ClipboardList,
  FileText,
  Target,
  PenTool,
  Receipt,
  Rocket,
} from "lucide-react";
import { roadmapSteps } from "@/lib/data";
import SectionHeader from "./SectionHeader";

const iconMap: Record<string, React.ReactNode> = {
  clipboard: <ClipboardList className="w-6 h-6" />,
  "file-text": <FileText className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  "pen-tool": <PenTool className="w-6 h-6" />,
  receipt: <Receipt className="w-6 h-6" />,
  rocket: <Rocket className="w-6 h-6" />,
};

export default function RoadmapSection() {
  return (
    <section id="process" className="py-20 px-8">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="PROCESS"
          subtitle="From first contact to project launch in six structured steps."
        >
          How A.D.A.M. Works
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapSteps.map((step) => (
            <div
              key={step.step}
              className="glass-card rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="label-mono text-highlight font-bold text-sm">
                  {step.step}
                </span>
                <div className="text-highlight">{iconMap[step.icon]}</div>
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
