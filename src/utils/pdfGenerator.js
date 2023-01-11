import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

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
    border: "1pt solid #000",
  },
  subView: {
    justifyContent: "center",
    textAlign: "center",
  },
  QRImage: {
    width: "55px",
  },
  partText: {
    fontSize: "10px",
  },
  locText: {
    fontSize: "10px",
  },
});

const PDFGenerator = (props) => {
  const { url, part, location } = props;

  return (
    <Document>
      <Page key={`PageId_${url}`} size={"B8"} style={styles.page}>
        <View style={styles.view}>
          <Image
            allowDangerousPaths
            src={document.getElementById(url).toDataURL()}
            style={styles.QRImage}
          />
          <View style={styles.subView}>
            <Text style={styles.partText}>{part}</Text>
            <View style={styles.subView}>
              <Text style={styles.locText}>{location}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFGenerator;
