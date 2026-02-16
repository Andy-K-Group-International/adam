import Image from "next/image";
import { Quote } from "lucide-react";
import { founders } from "@/lib/data";
import SectionHeader from "./SectionHeader";

export default function TestimonialPair() {
  return (
    <section id="about" className="py-20 px-8">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="ABOUT"
          subtitle="The team behind Andy'K Group International and A.D.A.M."
        >
          Meet the Founders
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {founders.map((founder) => (
            <div
              key={founder.name}
              className="glass-card rounded-xl p-8 flex flex-col items-center text-center"
            >
              {/* Image placeholder */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-grid-300 mb-6">
                <Image
                  src={founder.image}
                  alt={founder.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <h3 className="text-base font-bold text-foreground mb-1">
                {founder.name}
              </h3>
              <span className="label-mono mb-4">{founder.role}</span>

              <p className="text-sm text-muted leading-relaxed mb-6">
                {founder.bio}
              </p>

              <div className="border-t border-grid-300 pt-5 w-full">
                <Quote className="w-4 h-4 text-highlight mx-auto mb-2" />
                <p className="text-sm italic text-muted-2 leading-relaxed">
                  &ldquo;{founder.quote}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
