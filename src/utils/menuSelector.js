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
        navigate("/home");
        break;
      case 2:
        navigate("/additem");
        break;
      case 3:
        navigate("/labels");
        break;
      case 4:
        navigate("/technicians");
        break;
      case 5:
        navigate("/logs");
        break;
      case 6:
        navigate("/locations");
        break;
      case 7:
        navigate("/vendors");
        break;
      case 8:
        navigate("/orders");
        break;
      case 9:
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
