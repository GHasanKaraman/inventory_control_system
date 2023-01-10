import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const PDFGenerator = (props) => {
  const IdsArray = [];
  const { PDFImageIds } = props;
  const styles = StyleSheet.create({
    page: {
      backgroundColor: "white",
      display: "block",
    },
    view: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
    },
    QRImage: {
      width: "100%",
      height: "100%",
    },
    text: {
      color: "#0081c6",
      size: "11em",
    },
  });
  const resultArray = PDFImageIds.map((id) => {
    IdsArray.push(id);
    return document.getElementById(id).toDataURL();
  });
  return (
    <Document>
      {resultArray.map((dataURL, id) => {
        return (
          <Page key={`PageId_${id}`} size={"88"} style={styles.page}>
            <View style={styles.view}>
              <Image allowDangerousPaths src={dataURL} style={styles.QRImage} />
            </View>
            <View style={styles.view}>
              <Text style={styles.text}>{IdsArray[id]}</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export { PDFGenerator };
