import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles, C } from "./styles";
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

const draftOverlay = (
  <View
    fixed
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
        fontWeight: 700,
        color: "#f0ece8",
        transform: "rotate(-40deg)",
        letterSpacing: 10,
      }}
    >
      DRAFT
    </Text>
  </View>
);

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

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        {isDraft && draftOverlay}
        <View style={styles.coverInner}>
          <Text style={styles.coverBrand}>ANDY&apos;K GROUP INTERNATIONAL LTD</Text>
          <View style={styles.coverAccentLine} />
          <Text style={styles.coverTitle}>{title}</Text>
          <Text style={styles.coverSubtitle}>
            {serviceTypeLabel ?? "Service Agreement"}
          </Text>
          <Text style={[styles.coverSubtitle, { marginTop: 4 }]}>{clientName}</Text>
          <View style={styles.coverDateRow}>
            <Text style={styles.coverDateText}>{date}</Text>
          </View>
        </View>
        <PdfFooter dark />
      </Page>

      {/* Contract Sections — flow naturally across pages */}
      <Page size="A4" style={styles.page}>
        {isDraft && draftOverlay}
        {sections.map((section) => (
          <View key={section.id} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.split("\n").map((line, i) => (
              <Text key={i} style={styles.body}>
                {line || " "}
              </Text>
            ))}
          </View>
        ))}
        <PdfFooter />
      </Page>

      {/* Appendix D — Contact Person */}
      {appendixDContact && (
        <Page size="A4" style={styles.page}>
          {isDraft && draftOverlay}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              Appendix D — Primary Contact Person
            </Text>
            <Text style={[styles.body, { marginBottom: 12 }]}>
              The following individual is designated as the primary contact for all
              communications relating to this Agreement.
            </Text>
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: C.border,
                paddingTop: 12,
                marginTop: 4,
              }}
            >
              {[
                { label: "Full Name",            value: appendixDContact.name },
                { label: "Role / Title",          value: appendixDContact.role },
                { label: "Email",                 value: appendixDContact.email },
                { label: "Phone",                 value: appendixDContact.phone },
                { label: "Preferred Channel",     value: appendixDContact.preferredChannel },
              ].map(({ label, value }) => (
                <View key={label} style={{ flexDirection: "row", marginBottom: 9 }}>
                  <Text
                    style={[
                      styles.body,
                      styles.boldText,
                      { width: 130, marginTop: 0, color: C.dimmed },
                    ]}
                  >
                    {label}:
                  </Text>
                  <Text style={[styles.body, { flex: 1, marginTop: 0 }]}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
          <PdfFooter />
        </Page>
      )}

      {/* Signature Page */}
      <Page size="A4" style={styles.page}>
        {isDraft && draftOverlay}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <Text style={styles.body}>
            This Agreement is duly executed by the authorised representatives of the Parties.
          </Text>
        </View>

        <View style={styles.signatureBlock}>
          {/* Client */}
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>CLIENT</Text>
            <Text style={[styles.body, styles.boldText, { marginTop: 0 }]}>
              {clientName}
            </Text>
            {clientSignature && (
              <Image src={clientSignature} style={styles.signatureImage} />
            )}
            <Text style={styles.mutedText}>
              {clientSignedAt
                ? `Signed: ${new Date(clientSignedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`
                : "Awaiting signature"}
            </Text>
          </View>

          {/* Provider */}
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>ANDY&apos;K GROUP INTERNATIONAL LTD</Text>
            <Text style={[styles.body, styles.boldText, { marginTop: 0 }]}>
              Authorised Signatory
            </Text>
            {adminSignature && (
              <Image src={adminSignature} style={styles.signatureImage} />
            )}
            <Text style={styles.mutedText}>
              {adminSignedAt
                ? `Signed: ${new Date(adminSignedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`
                : "Awaiting countersignature"}
            </Text>
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
