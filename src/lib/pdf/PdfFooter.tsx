import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { C } from "./styles";

const s = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 28,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 7,
  },
  text: {
    fontSize: 7,
  },
});

export default function PdfFooter({ dark = false }: { dark?: boolean }) {
  const color = dark ? "#3a6a68" : C.dimmed;
  const borderColor = dark ? "#0a2020" : C.border;

  return (
    <View style={[s.footer, { borderTopWidth: 1, borderTopColor: borderColor }]} fixed>
      <Text style={[s.text, { color }]}>
        Andy'K Group International LTD | Reg: 16453500
      </Text>
      <Text
        style={[s.text, { color }]}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}
