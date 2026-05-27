import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, C } from "./styles";
import PdfFooter from "./PdfFooter";

interface StrategyDocProps {
  companyName: string;
  clientRef: string;
  strategyType: string;
  strategyNotes: string;
  date: string;
}

function parseSections(markdown: string): { title: string; body: string }[] {
  const parts = markdown.split(/\n##\s+/);
  const sections: { title: string; body: string }[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === 0) {
      // Text before first ## heading — treat as preamble if non-empty
      const trimmed = part.replace(/^#[^\n]*\n/, "").trim();
      if (trimmed) {
        sections.push({ title: "Overview", body: trimmed });
      }
      continue;
    }
    const lineBreak = part.indexOf("\n");
    if (lineBreak === -1) {
      sections.push({ title: part.trim(), body: "" });
    } else {
      sections.push({
        title: part.slice(0, lineBreak).trim(),
        body: part.slice(lineBreak + 1).trim(),
      });
    }
  }

  // If no ## headers found, treat the whole content as a single section
  if (sections.length === 0 && markdown.trim()) {
    sections.push({ title: "Strategy Notes", body: markdown.trim() });
  }

  return sections;
}

export default function StrategyDocument({
  companyName,
  clientRef,
  strategyType,
  strategyNotes,
  date,
}: StrategyDocProps) {
  const sections = parseSections(strategyNotes || "No strategy notes provided.");

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverInner}>
          <Text style={styles.coverBrand}>ANDY&apos;K GROUP INTERNATIONAL LTD</Text>
          <View style={styles.coverAccentLine} />
          <Text style={styles.coverTitle}>{strategyType || "Strategy Document"}</Text>
          <Text style={styles.coverSubtitle}>Prepared for {companyName}</Text>
          <Text style={styles.coverMeta}>Ref: {clientRef}</Text>
          <View style={styles.coverDateRow}>
            <Text style={styles.coverDateText}>{date}</Text>
          </View>
          <Text
            style={{
              marginTop: 16,
              fontSize: 8,
              color: "#4a4a6a",
              fontStyle: "italic",
            }}
          >
            Confidential — prepared exclusively for {companyName}. Not to be distributed.
          </Text>
        </View>
        <PdfFooter dark />
      </Page>

      {/* Content Page */}
      <Page size="A4" style={styles.page}>
        {sections.map((section, i) => (
          <View key={i} style={styles.sectionContainer} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.body.split("\n").map((line, j) => (
              <Text key={j} style={styles.body}>
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
