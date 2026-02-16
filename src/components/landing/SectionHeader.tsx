interface SectionHeaderProps {
  label?: string;
  children: React.ReactNode;
  subtitle?: string;
}

export default function SectionHeader({
  label,
  children,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="text-center max-w-[700px] mx-auto mb-16">
      {label && <span className="label-mono mb-3 block">{label}</span>}
      <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-4">
        {children}
      </h2>
      {subtitle && (
        <p className="text-lg leading-relaxed text-muted font-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}
