import QRCode from "qrcode.react";

const QRGenerator = (props) => {
  const { url, width } = props;
  return (
    <QRCode
      id={url}
      value={url}
      size={width}
      bgColor={"#ffffff"}
      fgColor={"#000000"}
      level={"H"}
      includeMargin={true}
    />
  );
};

export default QRGenerator;
