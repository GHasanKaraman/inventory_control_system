import { useEffect, useState } from "react";

import { get_products } from "./modalsController";

import LabelsModal from "./labelsModal/labels";
import ItemsModal from "./itemsModal/items";
import GiveModal from "./giveModal/give";
import TechnicianModal from "./techniciansModal/technicians";
import LogModal from "./logsModal/logs";

const ModalRouter = (props) => {
  const [logModal, setLogModal] = useState(false);
  const [labelsModal, setLabelsModal] = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [giveModal, setGiveModal] = useState(false);
  const [technicianModal, setTechnicianModal] = useState(false);

  const hideModal = async () => {
    if (labelsModal) {
      setLabelsModal(false);
    }
    if (registerModal) {
      setRegisterModal(false);
    }
    if (updateModal) {
      setUpdateModal(false);
    }
    if (giveModal) {
      setGiveModal(false);
    }
    if (technicianModal) {
      setTechnicianModal(false);
    }
    if (logModal) {
      setLogModal(false);
    }

    const data = await get_products();
    props.refreshTable(data);
  };

  useEffect(() => {
    if (props.selectedIndex && props.selectedIndex.key)
      switch (props.selectedIndex.key) {
        case 1:
          setRegisterModal(true);
          break;
        case 2:
          setLabelsModal(true);
          break;
        case 3:
          setTechnicianModal(true);
          break;
        case 4:
          setLogModal(true);
          break;
        case 5:
          setGiveModal(true);
          break;
        case 6:
          setUpdateModal(true);
          break;
        default:
          console.log("Default");
          break;
      }
  }, [props.selectedIndex]);

  const modals = [
    null,
    <ItemsModal
      type="add"
      open={registerModal}
      onCancel={hideModal}
      title="Register New Item"
      buttonText="Add Item"
    />,
    <LabelsModal open={labelsModal} onCancel={hideModal} />,
    <TechnicianModal open={technicianModal} onCancel={hideModal} />,
    <LogModal open={logModal} onCancel={hideModal} />,
    <GiveModal
      open={giveModal}
      onCancel={hideModal}
      product={props.selectedIndex ? props.selectedIndex.product : null}
    />,
    <ItemsModal
      type="update"
      product={props.selectedIndex ? props.selectedIndex.product : null}
      open={updateModal}
      onCancel={hideModal}
      title="Update Item"
      buttonText="Update Item"
    />,
  ];

  return props.selectedIndex && props.selectedIndex.key
    ? modals[props.selectedIndex.key]
    : modals[0];
};

export default ModalRouter;
