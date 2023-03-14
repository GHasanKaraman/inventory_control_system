import { getOrders } from "./ordersController";
import { getItems } from "./itemsController";
import cargo from "../images/cargo.png";

const getNotifications = async (response) => {
  const notifications = [];
  const orders = await getOrders();
  if (orders.length > 0) {
    notifications.push({
      message: "New Orders",
      description:
        "You should update the status of the orders if a change occurs!",
      image: cargo,
    });
  }
  const products = await getItems(response);

  Object.values(products).map((item) => {
    if (item.count < Number(item.min_quantity)) {
      notifications.push({
        message: "You should order " + item.parts,
        description: (
          <div>
            {"You should have " +
              item.min_quantity +
              " " +
              item.parts +
              " but, " +
              "you have only "}
            <div style={{ color: "red", display: "inline-block" }}>
              {item.count}
            </div>
            <div style={{ display: "inline-block" }}>
              {". Please order this product."}
            </div>
          </div>
        ),
        image: item.image,
      });
    }
  });

  return notifications;
};

const getNotificationsLength = async (response) => {
  var count = 0;
  const orders = await getOrders();
  if (orders.length > 0) {
    count += 1;
  }
  const products = await getItems(response);

  Object.values(products).map((item) => {
    if (item.count < Number(item.min_quantity)) {
      count += 1;
    }
  });

  return count;
};

export { getNotifications, getNotificationsLength };
