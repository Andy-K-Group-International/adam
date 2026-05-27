import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, C } from "./styles";
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
        <View style={styles.coverInner}>
          <Text style={styles.coverBrand}>ANDY&apos;K GROUP INTERNATIONAL LTD</Text>
          <View style={styles.coverAccentLine} />
          <Text style={styles.coverTitle}>{title}</Text>
          <Text style={styles.coverSubtitle}>Prepared for {companyName}</Text>
          {proposalRef && (
            <Text style={styles.coverMeta}>Ref: {proposalRef}</Text>
          )}
          <View style={styles.coverDateRow}>
            <Text style={styles.coverDateText}>{date}</Text>
          </View>
        </View>
        <PdfFooter dark />
      </Page>

      {/* Content — all sections flow naturally across pages */}
      <Page size="A4" style={styles.page}>
        {visibleSections.map((section) => (
          <View key={section.key} style={styles.sectionContainer}>
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
    </Document>
  );
}
