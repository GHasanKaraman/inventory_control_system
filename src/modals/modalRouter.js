import { useEffect, useState } from "react";

import { get_products } from "./modalsController";

import ItemsModal from "./itemsModal/items";
import GiveModal from "./giveModal/give";

const ModalRouter = (props) => {
  const [registerModal, setRegisterModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [giveModal, setGiveModal] = useState(false);

  const hideModal = async () => {
    if (registerModal) {
      setRegisterModal(false);
    }
    if (updateModal) {
      setUpdateModal(false);
    }
    if (giveModal) {
      setGiveModal(false);
    }

    const data = await get_products();
    props.refreshTable(data);
  };

  const selector = (key) => {
    switch (key) {
      case 1:
        setUpdateModal(true);
        break;
      case 2:
        setGiveModal(true);
        break;
      default:
        console.log("Other");
        break;
    }
  };

  useEffect(() => {
    if (props.selectedIndex) {
      selector(props.selectedIndex.key);
    }
  }, [props.selectedIndex]);

  const otherModals = [
    <div />,
    <ItemsModal
      type="update"
      product={props.selectedIndex ? props.selectedIndex.product : null}
      open={updateModal}
      onCancel={hideModal}
      title="Update Item"
      buttonText="Update Item"
    />,
    <GiveModal
      open={giveModal}
      onCancel={hideModal}
      product={props.selectedIndex ? props.selectedIndex.product : null}
    />,
  ];

  if (props.selectedIndex) {
    if (props.selectedIndex.key) {
      return otherModals[props.selectedIndex.key];
    }
  }

  return <div />;
};

export default ModalRouter;
