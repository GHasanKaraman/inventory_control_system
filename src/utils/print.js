import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import { Button } from "antd";
import QRCodeGenerator from "./generator";

export default function PrintComponent(props) {
  let componentRef = useRef();

  return (
    <div>
      <ReactToPrint
        trigger={() => (
          <Button
            id="button"
            type={props.buttonType}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            Print
          </Button>
        )}
        content={() => componentRef}
      />
      <div style={{ display: "none" }}>
        <QRCodeGenerator ref={(el) => (componentRef = el)} {...props} />
      </div>
    </div>
  );
}
