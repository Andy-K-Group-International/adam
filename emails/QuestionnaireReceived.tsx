import { Text, Section } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface Props {
  companyName: string;
  contactName: string;
  contactEmail: string;
  appUrl: string;
}

export default function QuestionnaireReceived({
  companyName,
  contactName,
  contactEmail,
  appUrl,
}: Props) {
  return (
    <EmailLayout preview={`New questionnaire from ${companyName}`}>
      <Text style={heading}>New Questionnaire Received</Text>
      <Text style={text}>
        A new questionnaire has been submitted by <strong>{contactName}</strong>{" "}
        from <strong>{companyName}</strong>.
      </Text>
      <Text style={text}>Contact email: {contactEmail}</Text>
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={`${appUrl}/admin/questionnaires`}>
          View Questionnaire
        </EmailButton>
      </Section>
    </EmailLayout>
  );
}

const heading = { fontSize: "20px", fontWeight: "700" as const, color: "#01011b", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#525a70", lineHeight: "1.6", margin: "0 0 12px" };
