import LogoIcon from "./LogoIcon";

export default function CompanyLogo({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const config = {
    sm: { icon: "w-5 h-5", name: "text-xs", sub: "text-[8px]", gap: "gap-2" },
    md: { icon: "w-7 h-7", name: "text-sm", sub: "text-[10px]", gap: "gap-2.5" },
    lg: { icon: "w-9 h-9", name: "text-base", sub: "text-[11px]", gap: "gap-3" },
  }[size];

  return (
    <div className={`flex items-center ${config.gap}`}>
      <LogoIcon className={`${config.icon} text-current`} />
      <div className="leading-[1.15]">
        <span className={`block ${config.name} font-bold tracking-tight`}>
          Andy&apos;K Group
        </span>
        <span
          className={`block ${config.sub} font-light tracking-[0.08em] opacity-60 uppercase`}
        >
          International
        </span>
      </div>
    </div>
  );
}
