import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  clientName: string;
  contractTitle: string;
  adminUrl: string;
}

export default function ContractViewed({ clientName, contractTitle, adminUrl }: Props) {
  return (
    <EmailLayout preview={`${clientName} viewed their contract`}>
      <Text style={heading}>Contract Viewed</Text>
      <Text style={text}>
        <strong>{clientName}</strong> has viewed the contract{" "}
        <strong>&quot;{contractTitle}&quot;</strong>.
      </Text>
      <Text style={text}>
        You will be notified when they take further action (sign or request
        changes).
      </Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={adminUrl}>View in Admin</EmailButton>
      </Section>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
