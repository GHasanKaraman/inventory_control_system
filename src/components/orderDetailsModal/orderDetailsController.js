import { message } from "antd";
import baseRequest from "../../core/baseRequest";

const transferOrder = async (id, values) => {
  const response = await baseRequest.post("/order/transfer", { id, values });
  if (response.data.result === "success") {
    message.success("You have successfully transfered the order!");
  } else {
    message.error("Didn't add to the main table!");
  }
};

export { transferOrder };
