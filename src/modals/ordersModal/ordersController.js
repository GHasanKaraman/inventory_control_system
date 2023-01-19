import { message } from "antd";
import baseRequest from "../../core/baseRequest";
import { fetchImage } from "../../utils/img2blob";

const addOrder = async (values, form) => {
  let { file, count, from_where, parts, price, tags, status } = values;

  values.parts = parts.toUpperCase();
  values.from_where = from_where.toUpperCase();
  values.tags = tags == undefined || tags.length == 0 ? "NTAG" : tags;
  values.status = status.toUpperCase();

  values.fishbowl = "X";
  values.new_location = "X";
  values.min_quantity = -1;

  const formData = new FormData();
  for (const name in values) {
    formData.append(name, values[name]);
  }

  const response = await baseRequest.post("/items", formData);
  if (response.data.result === "success") {
    message.success("Item has been successfully added!");
    form.resetFields();
    return "success";
  } else if (response.data.result === "failed") {
    message.wrong("Something went wrong while adding the item!");
  }
  return "failed";
};

function st2cr(status) {
  if (status === "ORDERED") return 0;
  if (status === "DELIVERY") return 1;
  if (status === "DELIVERED") return 2;
}

function cr2st(current) {
  switch (current) {
    case 0:
      return "ORDERED";
    case 1:
      return "DELIVERY";
    case 2:
      return "DELIVERED";
  }
}

const get_orders = async () => {
  const response = await baseRequest.post("/order", {});
  if (response.data.status === "success") {
    const records = response.data.records;
    const values = Object.values(records);
    for (let i = 0; i < values.length; i++) {
      values[i].image = await fetchImage(values[i].image);
      values[i].status = st2cr(values[i].status);
    }
    return values;
  } else if (response.data.status === "failed") {
    message.error("Something went wrong while retrieving orders! Try again.");
    return null;
  }
};

const step_up = async (item) => {
  let { _id, status } = item;
  status = cr2st(status + 1);

  const response = await baseRequest.post("/order/step-up", { _id, status });
  if (response.data.result === "success") {
    message.success("You have successfully updated the status!");
  } else {
    message.error("Something went wrong while updating the status!");
  }
};
const delete_order = async (id) => {
  const res = await baseRequest.post("/home/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Order has been successfully deleted!");
  } else if (res.data.status === "failed!") {
    message.error("Didn't delete the order!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

export { addOrder, get_orders, step_up, delete_order };
