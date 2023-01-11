import QRGenerator from "./qrGenerator";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PDFGenerator from "./pdfGenerator";

const QRCodeGenerator = (props) => {
  const { url, part, location } = props;
  const downloadName = "qrcodes";

  return (
    <div>
      <div style={{ display: "none" }} key={`qrGenerator_${url}`}>
        <QRGenerator valueString={url} documentId={url} />
      </div>
      <PDFDownloadLink
        document={<PDFGenerator url={url} part={part} location={location} />}
        fileName={`${downloadName}.pdf`}
      >
        {({ loading }) => {
          return loading ? "Loading document..." : "Download PDF";
        }}
      </PDFDownloadLink>
    </div>
  );
};

export default QRCodeGenerator;
