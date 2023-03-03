import { message } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MenuSelector = (props) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    message.success("You have successfully logged out!");
  };

  const selector = (key) => {
    switch (parseInt(key)) {
      case 1:
        navigate("/additem");
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
        break;
    }
  };

  useEffect(() => {
    if (props.selectedIndex) {
      selector(props.selectedIndex.key);
    }
  }, [props.selectedIndex]);

  return <div />;
};

export default MenuSelector;
