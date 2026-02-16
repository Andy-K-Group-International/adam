import { statsData } from "@/lib/data";

export default function LogoBar() {
  return (
    <section className="py-12 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="glass-card rounded-2xl px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="text-2xl mb-1 block">{stat.flag}</span>
                <span className="text-2xl md:text-3xl font-bold text-foreground block">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-2">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
