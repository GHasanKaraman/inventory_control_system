import { useState } from "react";

import { Modal } from "antd";

const ItemsModal = (props) => {
  return (
    <Modal
      open={props.open}
      footer={null}
      onCancel={() => {
        props.onCancel();
      }}
    >

    </Modal>
  );
};

export default ItemsModal;
