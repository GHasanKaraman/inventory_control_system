import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { get_products, logout } from "./modalsController";

import ItemsModal from "./itemsModal/items";
import GiveModal from "./giveModal/give";

const ModalRouter = (props) => {
  const navigate = useNavigate();

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

  useEffect(() => {
    if (props.selectedIndex) {
      if (props.selectedIndex.key) {
        switch (props.selectedIndex.key) {
          case 1:
            setRegisterModal(true);
            break;
          case 2:
            navigate("/labels");
            break;
          case 3:
            navigate("/technicians");
            break;
          case 4:
            navigate("/logs");
            break;
          case 5:
            navigate("/locations");
            break;
          case 6:
            navigate("/orders");
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
