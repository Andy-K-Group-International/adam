import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  clientName: string;
  contractTitle: string;
  contractUrl: string;
}

export default function ContractCountersigned({ clientName, contractTitle, contractUrl }: Props) {
  return (
    <EmailLayout preview="Your contract has been countersigned">
      <Text style={heading}>Contract Countersigned</Text>
      <Text style={text}>Hi {clientName},</Text>
      <Text style={text}>
        Great news! The contract <strong>&quot;{contractTitle}&quot;</strong> has been
        countersigned by Andy&apos;K Group International.
      </Text>
      <Text style={text}>
        The contract is now being finalized. You will receive a confirmation
        once it is complete.
      </Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={contractUrl}>View Contract</EmailButton>
      </Section>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
