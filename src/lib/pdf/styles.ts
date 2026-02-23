import { StyleSheet, Font } from "@react-pdf/renderer";

// Register IBM Plex Sans from Google Fonts CDN
Font.register({
  family: "IBM Plex Sans",
  fonts: [
    { src: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdHeFaxOedc.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIFsdP3pBms.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr8AIFsdP3pBms.ttf", fontWeight: 700 },
  ],
});

// Brand colors matching the design system
export const colors = {
  highlight: "#F97316",  // orange brand color
  foreground: "#1A1A2E",
  muted: "#6B7280",
  white: "#FFFFFF",
  gridLight: "#F3F4F6",
  gridBorder: "#E5E7EB",
};

export const styles = StyleSheet.create({
  page: {
    fontFamily: "IBM Plex Sans",
    fontSize: 10,
    color: colors.foreground,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  coverPage: {
    fontFamily: "IBM Plex Sans",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 50,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.foreground,
    marginBottom: 10,
    textAlign: "center",
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 40,
  },
  coverBrand: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.highlight,
    textAlign: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.foreground,
    marginBottom: 12,
    marginTop: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.highlight,
    paddingBottom: 6,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.foreground,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 600,
  },
  mutedText: {
    fontSize: 9,
    color: colors.muted,
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.gridBorder,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.gridBorder,
  },
  tableHeader: {
    backgroundColor: colors.gridLight,
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: colors.highlight,
  },
  tableCell: {
    padding: 6,
    fontSize: 9,
    flex: 1,
  },
  tableCellHeader: {
    padding: 6,
    fontSize: 9,
    fontWeight: 600,
    flex: 1,
  },
  signatureBlock: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: colors.foreground,
    paddingTop: 8,
  },
  signatureLabel: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 4,
  },
  signatureImage: {
    height: 40,
    marginBottom: 4,
  },
});
