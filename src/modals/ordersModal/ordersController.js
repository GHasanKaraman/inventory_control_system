import { message } from "antd";
import baseRequest from "../../core/baseRequest";
import { fetchImage } from "../../utils/img2blob";

const addOrder = async (values, form) => {
  let {
    file,
    count,
    fishbowl,
    from_where,
    min_quantity,
    new_location,
    parts,
    price,
    tags,
    status,
  } = values;

  values.parts = parts.toUpperCase();
  values.from_where = from_where.toUpperCase();
  values.new_location = new_location.toUpperCase();
  values.fishbowl = fishbowl.toUpperCase();
  values.tags = tags == undefined || tags.length == 0 ? "NTAG" : tags;
  values.status = status.toUpperCase();

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
  } else {
    message.error("Something went wrong while retrieving orders! Try again.");
    return null;
  }
};

const step_up = async (item) => {
  const response = await baseRequest.post("/order/step-up");
};
const delete_order = async (id) => {};

export { addOrder, get_orders, step_up, delete_order };
