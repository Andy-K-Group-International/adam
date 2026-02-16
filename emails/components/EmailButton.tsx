import { Button } from "@react-email/components";

interface EmailButtonProps {
  href: string;
  children: string;
}

export default function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: "#C9707D",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        textDecoration: "none",
        textAlign: "center" as const,
        padding: "12px 24px",
        borderRadius: "8px",
        display: "inline-block",
      }}
    >
      {children}
    </Button>
  );
}
