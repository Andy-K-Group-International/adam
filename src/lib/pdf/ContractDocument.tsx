import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles, colors } from "./styles";
import PdfFooter from "./PdfFooter";

interface ContractSection {
  id: string;
  title: string;
  content: string;
}

interface ContractDocProps {
  title: string;
  sections: ContractSection[];
  clientName: string;
  clientSignature?: string;
  clientSignedAt?: number;
  adminSignature?: string;
  adminSignedAt?: number;
  date: string;
}

export default function ContractDocument({
  title,
  sections,
  clientName,
  clientSignature,
  clientSignedAt,
  adminSignature,
  adminSignedAt,
  date,
}: ContractDocProps) {
  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.coverBrand}>ANDY'K GROUP INTERNATIONAL</Text>
          <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 60, textAlign: "center" }}>
            Service Agreement
          </Text>
          <Text style={styles.coverTitle}>{title}</Text>
          <Text style={styles.coverSubtitle}>{clientName}</Text>
          <Text style={{ fontSize: 10, color: colors.muted }}>{date}</Text>
        </View>
        <PdfFooter />
      </Page>

      {/* Content sections */}
      {sections.map((section) => (
        <Page key={section.id} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.content.split("\n").map((line, i) => (
            <Text key={i} style={styles.body}>
              {line}
            </Text>
          ))}
          <PdfFooter />
        </Page>
      ))}

      {/* Signature Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Signatures</Text>
        <Text style={styles.body}>
          This agreement is entered into by the parties identified below.
        </Text>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Client</Text>
            <Text style={[styles.body, styles.boldText]}>{clientName}</Text>
            {clientSignature && (
              <Image src={clientSignature} style={styles.signatureImage} />
            )}
            {clientSignedAt && (
              <Text style={styles.mutedText}>
                Signed: {new Date(clientSignedAt).toLocaleDateString("en-GB")}
              </Text>
            )}
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Andy'K Group International LTD</Text>
            <Text style={[styles.body, styles.boldText]}>Authorized Signatory</Text>
            {adminSignature && (
              <Image src={adminSignature} style={styles.signatureImage} />
            )}
            {adminSignedAt && (
              <Text style={styles.mutedText}>
                Signed: {new Date(adminSignedAt).toLocaleDateString("en-GB")}
              </Text>
            )}
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
