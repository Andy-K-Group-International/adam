import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  clientName: string;
  contractTitle: string;
  adminUrl: string;
}

export default function ContractSigned({ clientName, contractTitle, adminUrl }: Props) {
  return (
    <EmailLayout preview={`${clientName} signed the contract`}>
      <Text style={heading}>Contract Signed</Text>
      <Text style={text}>
        <strong>{clientName}</strong> has signed the contract{" "}
        <strong>&quot;{contractTitle}&quot;</strong>.
      </Text>
      <Text style={text}>
        Please review and countersign to finalize the agreement.
      </Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={adminUrl}>Countersign Contract</EmailButton>
      </Section>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
