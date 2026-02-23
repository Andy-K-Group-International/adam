import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { colors } from "./styles";

const footerStyles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.gridBorder,
    paddingTop: 8,
  },
  text: {
    fontSize: 7,
    color: colors.muted,
  },
});

export default function PdfFooter() {
  return (
    <View style={footerStyles.footer} fixed>
      <Text style={footerStyles.text}>
        Andy'K Group International LTD | Reg: 16453500
      </Text>
      <Text
        style={footerStyles.text}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}
