import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles, colors } from "./styles";
import PdfFooter from "./PdfFooter";

interface ContractSection {
  id: string;
  title: string;
  content: string;
}

interface AppendixDContact {
  name: string;
  role: string;
  email: string;
  phone: string;
  preferredChannel: string;
}

interface ContractDocProps {
  title: string;
  serviceTypeLabel?: string;
  sections: ContractSection[];
  clientName: string;
  appendixDContact?: AppendixDContact;
  clientSignature?: string;
  clientSignedAt?: number;
  adminSignature?: string;
  adminSignedAt?: number;
  date: string;
}

export default function ContractDocument({
  title,
  serviceTypeLabel,
  sections,
  clientName,
  appendixDContact,
  clientSignature,
  clientSignedAt,
  adminSignature,
  adminSignedAt,
  date,
}: ContractDocProps) {
  const isDraft = !adminSignedAt || !clientSignedAt;

  const draftWatermark = isDraft ? (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 96,
          color: "#ede8e2",
          fontFamily: "Helvetica-Bold",
          transform: "rotate(-40deg)",
          letterSpacing: 12,
        }}
      >
        DRAFT
      </Text>
    </View>
  ) : null;

  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        {draftWatermark}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.coverBrand}>ANDY'K GROUP INTERNATIONAL LTD</Text>
          <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 60, textAlign: "center" }}>
            {serviceTypeLabel ?? "Service Agreement"}
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
          {draftWatermark}
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.content.split("\n").map((line, i) => (
            <Text key={i} style={styles.body}>
              {line}
            </Text>
          ))}
          <PdfFooter />
        </Page>
      ))}

      {/* Appendix D — Contact Person (if provided) */}
      {appendixDContact && (
        <Page size="A4" style={styles.page}>
          {draftWatermark}
          <Text style={styles.sectionTitle}>Appendix D — Primary Contact Person</Text>
          <Text style={styles.body}>
            The following individual is designated as the primary contact for all communications relating to this Agreement.
          </Text>
          <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: colors.gridBorder, paddingTop: 12 }}>
            {[
              { label: "Full Name", value: appendixDContact.name },
              { label: "Role / Title", value: appendixDContact.role },
              { label: "Email", value: appendixDContact.email },
              { label: "Phone", value: appendixDContact.phone },
              { label: "Preferred Channel", value: appendixDContact.preferredChannel },
            ].map(({ label, value }) => (
              <View key={label} style={{ flexDirection: "row", marginBottom: 8 }}>
                <Text style={{ ...styles.body, ...styles.boldText, width: 140, color: colors.muted }}>
                  {label}:
                </Text>
                <Text style={{ ...styles.body, flex: 1 }}>{value}</Text>
              </View>
            ))}
          </View>
          <PdfFooter />
        </Page>
      )}

      {/* Signature Page */}
<Page size="A4" style={styles.page}>
        {draftWatermark}
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
