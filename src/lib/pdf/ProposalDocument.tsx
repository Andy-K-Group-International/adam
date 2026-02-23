import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, colors } from "./styles";
import PdfFooter from "./PdfFooter";

interface ProposalSection {
  key: string;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
}

interface ProposalDocProps {
  title: string;
  proposalRef?: string;
  companyName: string;
  sections: ProposalSection[];
  date: string;
}

export default function ProposalDocument({
  title,
  proposalRef,
  companyName,
  sections,
  date,
}: ProposalDocProps) {
  const visibleSections = sections
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.coverBrand}>ANDY'K GROUP INTERNATIONAL</Text>
          <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 60, textAlign: "center" }}>
            Business Growth &amp; Digital Transformation
          </Text>
          <Text style={styles.coverTitle}>{title}</Text>
          <Text style={styles.coverSubtitle}>Prepared for {companyName}</Text>
          <Text style={{ fontSize: 10, color: colors.muted }}>{date}</Text>
          {proposalRef && (
            <Text style={{ fontSize: 9, color: colors.muted, marginTop: 4 }}>
              Ref: {proposalRef}
            </Text>
          )}
        </View>
        <PdfFooter />
      </Page>

      {/* Content Pages */}
      {visibleSections.map((section) => (
        <Page key={section.key} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.content.split("\n").map((line, i) => (
            <Text key={i} style={styles.body}>
              {line}
            </Text>
          ))}
          <PdfFooter />
        </Page>
      ))}
    </Document>
  );
}
