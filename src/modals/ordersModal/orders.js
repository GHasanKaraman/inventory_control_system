import { Modal } from "antd";

const OrdersModal = (props) => {
  return (
    <Modal open={props.open} onCancel={props.onCancel} footer={null}></Modal>
  );
};
export default OrdersModal;
