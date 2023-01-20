import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { get_products, logout } from "./modalsController";

import LabelsModal from "./labelsModal/labels";
import ItemsModal from "./itemsModal/items";
import GiveModal from "./giveModal/give";
import TechnicianModal from "./techniciansModal/technicians";
import LogModal from "./logsModal/logs";
import LocationModal from "./locationModal/location";
import OrdersModal from "./ordersModal/orders";

const ModalRouter = (props) => {
  const navigate = useNavigate();

  const [logModal, setLogModal] = useState(false);
  const [labelsModal, setLabelsModal] = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [giveModal, setGiveModal] = useState(false);
  const [technicianModal, setTechnicianModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [orderModal, setOrderModal] = useState(false);

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
    if (locationModal) {
      setLocationModal(false);
    }
    if (orderModal) {
      setOrderModal(false);
    }

    const data = await get_products();
    props.refreshTable(data);
  };

  useEffect(() => {
    if (props.selectedIndex) {
      if (props.selectedIndex.key) {
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
            setLocationModal(true);
            break;
          case 6:
            setOrderModal(true);
            break;
          case 7:
            logout();
            navigate("/login");
          default:
            console.log("Menu");
            break;
        }
      } else {
        switch (props.selectedIndex.otherKey) {
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
      }
    }
  }, [props.selectedIndex]);

  const menuModals = [
    <div />,
    <ItemsModal
      refresh={props.refresh}
      type="add"
      open={registerModal}
      onCancel={hideModal}
      title="Register New Item"
      buttonText="Add Item"
    />,
    <LabelsModal open={labelsModal} onCancel={hideModal} />,
    <TechnicianModal open={technicianModal} onCancel={hideModal} />,
    <LogModal open={logModal} onCancel={hideModal} />,
    <LocationModal open={locationModal} onCancel={hideModal} />,
    <OrdersModal open={orderModal} onCancel={hideModal} />,
  ];

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
      return menuModals[props.selectedIndex.key];
    } else if (props.selectedIndex.otherKey) {
      return otherModals[props.selectedIndex.otherKey];
    }
  }

  return <div />;
};

export default ModalRouter;
