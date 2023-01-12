import QRGenerator from "./qrGenerator";

const styles = {
  view: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    width: "75%",
    border: "1pt solid #000",
  },
  subView: {
    justifyContent: "center",
    textAlign: "center",
    padding: "30px 0px",
  },
  partText: {
    fontSize: "13px",
  },
  locText: {
    fontSize: "12px",
  },
};

const PDFGenerator = (props) => {
  const { url, part, location } = props;

  return (
    <div style={styles.view}>
      <div styles={styles.subView}>
        <QRGenerator width={90} url={url} />
      </div>
      <div style={styles.subView}>
        <div style={styles.partText}>{part}</div>
        <div>
          <div style={styles.locText}>{location}</div>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
