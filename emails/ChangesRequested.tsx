import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  clientName: string;
  contractTitle: string;
  comment: string;
  adminUrl: string;
}

export default function ChangesRequested({ clientName, contractTitle, comment, adminUrl }: Props) {
  return (
    <EmailLayout preview={`${clientName} requested changes`}>
      <Text style={heading}>Changes Requested</Text>
      <Text style={text}>
        <strong>{clientName}</strong> has requested changes to the contract{" "}
        <strong>&quot;{contractTitle}&quot;</strong>.
      </Text>
      <Text style={text}>Their comment:</Text>
      <Text style={quote}>&quot;{comment}&quot;</Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={adminUrl}>Review Changes</EmailButton>
      </Section>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
const quote = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px", padding: "12px 16px", backgroundColor: "#f5f5f7", borderRadius: "8px", borderLeft: "3px solid #C9707D" };
