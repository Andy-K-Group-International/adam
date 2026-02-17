import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  clientName: string;
  contractTitle: string;
  slot: string;
  contractUrl: string;
}

export default function AppendixVerified({ clientName, contractTitle, slot, contractUrl }: Props) {
  return (
    <EmailLayout preview={`Appendix ${slot} has been verified`}>
      <Text style={heading}>Appendix Verified</Text>
      <Text style={text}>Hi {clientName},</Text>
      <Text style={text}>
        Appendix <strong>{slot}</strong> for the contract{" "}
        <strong>&quot;{contractTitle}&quot;</strong> has been reviewed and verified.
      </Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={contractUrl}>View Contract</EmailButton>
      </Section>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
