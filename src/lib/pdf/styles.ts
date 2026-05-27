import { StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "IBM Plex Sans",
  fonts: [
    { src: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdHeFaxOedc.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIFsdP3pBms.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr8AIFsdP3pBms.ttf", fontWeight: 700 },
  ],
});

export const C = {
  navy:   "#01011b",
  rose:   "#c9707d",
  cream:  "#faf6f3",
  muted:  "#525a70",
  dimmed: "#8b93a8",
  border: "#ede8e2",
  white:  "#ffffff",
};

// Legacy alias used by PdfFooter
export const colors = {
  highlight:  C.rose,
  foreground: C.navy,
  muted:      C.muted,
  white:      C.white,
  gridLight:  C.cream,
  gridBorder: C.border,
};

export const styles = StyleSheet.create({
  // ── Cover page (dark navy background) ─────────────────────────────────────
  coverPage: {
    fontFamily: "IBM Plex Sans",
    backgroundColor: C.navy,
    paddingHorizontal: 60,
    paddingTop: 70,
    paddingBottom: 40,
    flexDirection: "column",
  },
  coverInner: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 48,
  },
  coverBrand: {
    fontSize: 7,
    fontWeight: 700,
    color: C.rose,
    letterSpacing: 2,
    marginBottom: 14,
  },
  coverAccentLine: {
    height: 2,
    width: 44,
    backgroundColor: C.rose,
    marginBottom: 28,
  },
  coverTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: C.cream,
    lineHeight: 1.3,
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 12,
    color: "#7070a0",
    marginBottom: 4,
  },
  coverMeta: {
    fontSize: 9,
    color: "#4a4a6a",
    marginTop: 2,
  },
  coverDateRow: {
    marginTop: 36,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#111130",
  },
  coverDateText: {
    fontSize: 9,
    color: "#4a4a6a",
  },

  // ── Content pages (white) ─────────────────────────────────────────────────
  page: {
    fontFamily: "IBM Plex Sans",
    fontSize: 10,
    color: C.muted,
    paddingTop: 50,
    paddingBottom: 70,
    paddingHorizontal: 50,
    backgroundColor: C.white,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: C.navy,
    marginBottom: 3,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.rose,
  },
  body: {
    fontSize: 9.5,
    lineHeight: 1.75,
    color: C.muted,
    marginTop: 6,
  },

  // ── Signature ─────────────────────────────────────────────────────────────
  signatureBlock: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  signatureBox: {
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: C.navy,
    paddingTop: 10,
  },
  signatureLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: C.dimmed,
    letterSpacing: 1,
    marginBottom: 6,
  },
  signatureImage: {
    height: 40,
    marginBottom: 4,
  },

  // ── Typography helpers ────────────────────────────────────────────────────
  boldText: {
    fontWeight: 600,
    color: C.navy,
  },
  mutedText: {
    fontSize: 8.5,
    color: C.dimmed,
  },

  // ── Table (kept for backward compat) ─────────────────────────────────────
  table:           { marginVertical: 10 },
  tableRow:        { flexDirection: "row" },
  tableHeader:     { flexDirection: "row" },
  tableCell:       { padding: 6, fontSize: 9, flex: 1 },
  tableCellHeader: { padding: 6, fontSize: 9, fontWeight: 600, flex: 1 },
});
