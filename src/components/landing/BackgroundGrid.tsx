export function CartesianGrid({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Grid lines */}
      <div className="cartesian-grid" />
      {/* Subtle radial glow */}
      <div className="cartesian-grid-glow" />
    </div>
  );
}

export function DotGrid({ className = "" }: { className?: string }) {
  return <div className={`dot-grid ${className}`} />;
}

export function NoiseTexture({ variant = "default" }: { variant?: "default" | "eggplant" }) {
  return (
    <div className={variant === "eggplant" ? "noise-eggplant" : "noise-texture"} />
  );
}

export function HeroBackground() {
  return (
    <>
      {/* Radial gradient: light pink wash */}
      <div className="hero-gradient" />
      {/* Noise overlay fading to top */}
      <div className="hero-noise-wrapper">
        <div className="noise-texture" style={{ opacity: 0.04 }} />
      </div>
      {/* Cartesian grid behind hero */}
      <div className="absolute inset-0 pointer-events-none" style={{ height: 900, opacity: 0.7 }}>
        <div className="cartesian-grid" style={{ opacity: 0.55 }} />
        <div className="cartesian-grid-glow" />
      </div>
    </>
  );
}

export function SectionBackground({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="section-radial-bg" />
      <div className="cartesian-grid" style={{ opacity: 0.3 }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
