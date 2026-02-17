import { Quote } from "lucide-react";
import { lovedByQuote } from "@/lib/data";

export default function LovedBySection() {
  return (
    <section className="py-20 px-8 section-radial-bg">
      <div className="max-w-[800px] mx-auto text-center">
        <Quote className="w-8 h-8 text-highlight mx-auto mb-6" />

        <blockquote className="text-xl md:text-2xl font-light leading-relaxed text-foreground mb-8">
          &ldquo;{lovedByQuote.text}&rdquo;
        </blockquote>

        <div>
          <p className="text-base font-bold text-foreground">
            {lovedByQuote.author}
          </p>
          <p className="text-sm text-muted-2">{lovedByQuote.role}</p>
        </div>
      </div>
    </section>
  );
}
