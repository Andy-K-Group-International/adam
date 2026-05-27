import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import PdfFooter from "./PdfFooter";

Font.register({
  family: "IBM Plex Sans",
  fonts: [
    { src: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdHeFaxOedc.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIFsdP3pBms.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr8AIFsdP3pBms.ttf", fontWeight: 700 },
  ],
});

const C = {
  navy: "#0E282D",
  rose: "#2F9E9A",
  muted: "#525a70",
  dimmed: "#8b93a8",
  cream: "#f0f4f4",
  border: "#dce8e8",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "IBM Plex Sans",
    fontSize: 10,
    color: C.muted,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: C.white,
  },
  // Header bar
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  brand: { fontSize: 8, fontWeight: 700, color: C.dimmed, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  companyName: { fontSize: 11, fontWeight: 700, color: C.navy },
  companyAddr: { fontSize: 8, color: C.dimmed, lineHeight: 1.5, marginTop: 2 },
  invoiceMeta: { alignItems: "flex-end" },
  invoiceLabel: { fontSize: 8, color: C.dimmed, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 3 },
  invoiceNumber: { fontSize: 18, fontWeight: 700, color: C.navy },
  statusPill: { marginTop: 6, backgroundColor: C.rose, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-end" },
  statusText: { fontSize: 7, fontWeight: 600, color: C.white, textTransform: "uppercase", letterSpacing: 0.8 },
  // Divider
  divider: { height: 1, backgroundColor: C.border, marginBottom: 24 },
  roseAccent: { height: 2, backgroundColor: C.rose, width: 40, marginBottom: 24 },
  // Billing block
  billingRow: { flexDirection: "row", gap: 32, marginBottom: 28 },
  billingBlock: { flex: 1 },
  billingLabel: { fontSize: 7, fontWeight: 600, color: C.dimmed, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
  billingName: { fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 2 },
  billingDetail: { fontSize: 9, color: C.muted, lineHeight: 1.5 },
  // Dates row
  datesRow: { flexDirection: "row", gap: 32, marginBottom: 28 },
  dateBlock: { minWidth: 100 },
  dateLabel: { fontSize: 7, fontWeight: 600, color: C.dimmed, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 },
  dateValue: { fontSize: 10, fontWeight: 600, color: C.navy },
  // Line items table
  tableHeader: { flexDirection: "row", backgroundColor: C.cream, borderTopWidth: 1, borderTopColor: C.border, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 6, paddingHorizontal: 8 },
  tableHeaderText: { fontSize: 7, fontWeight: 600, color: C.dimmed, textTransform: "uppercase", letterSpacing: 0.6 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 9, paddingHorizontal: 8 },
  tableRowAlt: { backgroundColor: "#fdfcfb" },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: "right" },
  colUnit: { width: 75, textAlign: "right" },
  colAmt: { width: 75, textAlign: "right" },
  cellText: { fontSize: 9, color: C.muted },
  cellBold: { fontSize: 9, fontWeight: 600, color: C.navy },
  // Totals
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 6 },
  totalLabel: { fontSize: 9, color: C.dimmed, width: 100, textAlign: "right", paddingRight: 16 },
  totalValue: { fontSize: 9, color: C.muted, width: 80, textAlign: "right" },
  grandTotalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  grandLabel: { fontSize: 11, fontWeight: 700, color: C.navy, width: 100, textAlign: "right", paddingRight: 16 },
  grandValue: { fontSize: 11, fontWeight: 700, color: C.navy, width: 80, textAlign: "right" },
  // Notes
  notesSection: { marginTop: 28, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 16 },
  notesLabel: { fontSize: 7, fontWeight: 600, color: C.dimmed, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  notesText: { fontSize: 9, color: C.muted, lineHeight: 1.6 },
  // Payment terms box
  termsBox: { marginTop: 24, backgroundColor: C.cream, borderRadius: 4, padding: 12 },
  termsLabel: { fontSize: 7, fontWeight: 600, color: C.dimmed, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  termsText: { fontSize: 9, color: C.muted, lineHeight: 1.5 },
});

function fmt(amount: number, currency: string) {
  const symbols: Record<string, string> = { EUR: "€", GBP: "£", USD: "$" };
  const sym = symbols[currency] ?? currency + " ";
  return `${sym}${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceDocProps {
  invoiceNumber: string;
  status: string;
  issuedDate: string;
  dueDate: string | null;
  currency: string;
  lineItems: InvoiceLineItem[];
  amount: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  clientCompanyName: string;
  clientContactName: string;
  clientEmail: string;
  clientAddress?: { line1: string; line2?: string; city: string; postcode: string; country: string } | null;
}

export default function InvoiceDocument({
  invoiceNumber,
  status,
  issuedDate,
  dueDate,
  currency,
  lineItems,
  amount,
  taxAmount,
  totalAmount,
  notes,
  clientCompanyName,
  clientContactName,
  clientEmail,
  clientAddress,
}: InvoiceDocProps) {
  const statusLabel = status === "paid" ? "Paid" : status === "overdue" ? "Overdue" : "Invoice";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.brand}>Andy'K Group International LTD</Text>
            <Text style={s.companyName}>A.D.A.M.</Text>
            <Text style={s.companyAddr}>
              86-90 Paul Street{"\n"}London, EC2A 4NE{"\n"}United Kingdom
            </Text>
          </View>
          <View style={s.invoiceMeta}>
            <Text style={s.invoiceLabel}>Invoice</Text>
            <Text style={s.invoiceNumber}>{invoiceNumber}</Text>
            <View style={[s.statusPill, status === "paid" ? { backgroundColor: "#2e7d5e" } : status === "overdue" ? { backgroundColor: "#b45309" } : {}]}>
              <Text style={s.statusText}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        <View style={s.roseAccent} />

        {/* Bill To / Dates */}
        <View style={s.billingRow}>
          <View style={s.billingBlock}>
            <Text style={s.billingLabel}>Bill To</Text>
            <Text style={s.billingName}>{clientCompanyName}</Text>
            <Text style={s.billingDetail}>{clientContactName}</Text>
            <Text style={s.billingDetail}>{clientEmail}</Text>
            {clientAddress && (
              <Text style={s.billingDetail}>
                {clientAddress.line1}
                {clientAddress.line2 ? `, ${clientAddress.line2}` : ""}
                {"\n"}
                {clientAddress.city}, {clientAddress.postcode}
                {"\n"}
                {clientAddress.country}
              </Text>
            )}
          </View>
          <View>
            <View style={[s.dateBlock, { marginBottom: 12 }]}>
              <Text style={s.dateLabel}>Issue Date</Text>
              <Text style={s.dateValue}>{issuedDate}</Text>
            </View>
            {dueDate && (
              <View style={s.dateBlock}>
                <Text style={s.dateLabel}>Due Date</Text>
                <Text style={[s.dateValue, status === "overdue" ? { color: C.rose } : {}]}>{dueDate}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.divider} />

        {/* Line items table */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colDesc]}>Description</Text>
          <Text style={[s.tableHeaderText, s.colQty]}>Qty</Text>
          <Text style={[s.tableHeaderText, s.colUnit]}>Unit Price</Text>
          <Text style={[s.tableHeaderText, s.colAmt]}>Amount</Text>
        </View>

        {lineItems.map((item, i) => (
          <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.cellText, s.colDesc]}>{item.description}</Text>
            <Text style={[s.cellText, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.cellText, s.colUnit]}>{fmt(item.unit_price, currency)}</Text>
            <Text style={[s.cellBold, s.colAmt]}>{fmt(item.quantity * item.unit_price, currency)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsBlock}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmt(amount, currency)}</Text>
          </View>
          {taxAmount > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tax</Text>
              <Text style={s.totalValue}>{fmt(taxAmount, currency)}</Text>
            </View>
          )}
          <View style={s.grandTotalRow}>
            <Text style={s.grandLabel}>Total Due</Text>
            <Text style={s.grandValue}>{fmt(totalAmount, currency)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={s.notesSection}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Payment terms */}
        <View style={s.termsBox}>
          <Text style={s.termsLabel}>Payment Details</Text>
          <Text style={s.termsText}>
            Please make payment by the due date. For payment queries contact info@andykgroup.com.
            {"\n"}Andy'K Group International LTD · Company No. 16453500 · andykgroup.com
          </Text>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
