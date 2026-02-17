import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  clientName: string;
  contractTitle: string;
  contractUrl: string;
}

export default function ContractRepublished({ clientName, contractTitle, contractUrl }: Props) {
  return (
    <EmailLayout preview="Updated contract ready for review">
      <Text style={heading}>Updated Contract Ready</Text>
      <Text style={text}>Hi {clientName},</Text>
      <Text style={text}>
        The contract <strong>&quot;{contractTitle}&quot;</strong> has been updated based on
        your feedback. Please review the changes.
      </Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={contractUrl}>View Updated Contract</EmailButton>
      </Section>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
