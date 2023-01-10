import QRCode from "qrcode.react";

const QRGenerator = (props) => {
  const { valueString, documentId } = props;
  return (
    <QRCode
      id={documentId}
      value={valueString}
      size={128}
      bgColor={"#ffffff"}
      fgColor={"#000000"}
      level={"H"}
      includeMargin={true}
    />
  );
};

export { QRGenerator };
