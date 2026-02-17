import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  clientName: string;
  contractTitle: string;
  slot: string;
  reason: string;
  contractUrl: string;
}

export default function AppendixRejected({ clientName, contractTitle, slot, reason, contractUrl }: Props) {
  return (
    <EmailLayout preview={`Appendix ${slot} needs attention`}>
      <Text style={heading}>Appendix Needs Attention</Text>
      <Text style={text}>Hi {clientName},</Text>
      <Text style={text}>
        Appendix <strong>{slot}</strong> for the contract{" "}
        <strong>&quot;{contractTitle}&quot;</strong> has been reviewed and requires your
        attention.
      </Text>
      <Text style={text}>Reason:</Text>
      <Text style={quote}>&quot;{reason}&quot;</Text>
      <Text style={text}>
        Please upload a corrected version at your earliest convenience.
      </Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={contractUrl}>Upload New Version</EmailButton>
      </Section>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
const quote = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px", padding: "12px 16px", backgroundColor: "#f5f5f7", borderRadius: "8px", borderLeft: "3px solid #C9707D" };
