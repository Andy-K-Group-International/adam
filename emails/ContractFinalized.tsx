import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  recipientName: string;
  contractTitle: string;
  contractUrl: string;
}

export default function ContractFinalized({ recipientName, contractTitle, contractUrl }: Props) {
  return (
    <EmailLayout preview={`Contract "${contractTitle}" is now final`}>
      <Text style={heading}>Contract Finalized</Text>
      <Text style={text}>Hi {recipientName},</Text>
      <Text style={text}>
        The contract <strong>&quot;{contractTitle}&quot;</strong> has been finalized.
        Both parties have signed and the agreement is now in effect.
      </Text>
      <Text style={text}>
        You can access the finalized contract at any time from your dashboard.
      </Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={contractUrl}>View Final Contract</EmailButton>
      </Section>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
