import { notification } from "antd";
import { getOrders } from "../../controllers/ordersController";
import { getItems } from "../../controllers/itemsController";

const openNotifications = async () => {
  const orders = await getOrders();
  if (orders.length > 0) {
    notification.info({
      message: "New Orders",
      description:
        "You should update the status of the orders if a change occurs",
      duration: 0,
    });
  }
  return {};
  const products = await getItems();

  Object.values(products).map((item) => {
    if (item.count < Number(item.min_quantity)) {
      notification.warning({
        duration: 0,
        message: "You should order " + item.parts,
        description:
          "You should have " +
          item.min_quantity +
          " " +
          item.parts +
          " but, " +
          "you have only " +
          item.count +
          ". Please order this product.",
      });
    }
  });
};

export { openNotifications };
