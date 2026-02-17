import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  clientName: string;
  contractTitle: string;
  contractUrl: string;
}

export default function ContractPublished({
  clientName,
  contractTitle,
  contractUrl,
}: Props) {
  return (
    <EmailLayout preview="Your contract is ready for review">
      <Text style={heading}>Your Contract is Ready</Text>
      <Text style={text}>Hi {clientName},</Text>
      <Text style={text}>
        Your contract <strong>&quot;{contractTitle}&quot;</strong> is ready for
        review. Please log in to your dashboard to view the details and take any
        necessary actions.
      </Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={contractUrl}>View Contract</EmailButton>
      </Section>
      <Text style={text}>
        If you have any questions, feel free to reach out to your account
        manager.
      </Text>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
