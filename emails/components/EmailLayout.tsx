import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import { ReactNode } from "react";

interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export default function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>A.D.A.M.</Text>
          </Section>
          <Hr style={divider} />
          <Section style={content}>{children}</Section>
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>Andy&apos;K Group International LTD</Text>
            <Text style={footerText}>86-90 Paul Street, London EC2A 4NE</Text>
            <Text style={footerText}>info@andykgroupinternational.com</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#faf9fb",
  fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px 20px",
};

const header = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const logo = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#01011b",
  margin: "0",
};

const divider = {
  borderColor: "#e2e4ea",
  margin: "0",
};

const content = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e4ea",
  borderRadius: "8px",
  padding: "32px",
  margin: "24px 0",
};

const footer = {
  textAlign: "center" as const,
  padding: "16px 0",
};

const footerText = {
  fontSize: "12px",
  color: "#8b93a8",
  margin: "2px 0",
};
