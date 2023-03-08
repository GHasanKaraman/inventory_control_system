import baseRequest from "../core/baseRequest";
import { message } from "antd";

const addItem = async (values, form) => {
  let {
    file,
    count,
    from_where,
    min_quantity,
    new_location,
    parts,
    price,
    tags,
  } = values;

  values.parts = parts.toUpperCase();
  values.from_where = from_where.toUpperCase();
  values.new_location = new_location.toUpperCase();
  values.tags = tags == undefined || tags.length == 0 ? "NTAG" : tags;

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

const updateItem = async (values, id) => {
  if (values.tags.length > 1 && values.tags[0] === "NTAG") {
    values.tags.splice(0, 1);
  } else if (values.tags.length == 0) {
    values.tags = ["NTAG"];
  }

  const formData = new FormData();
  for (const name in values) {
    formData.append(name, values[name]);
  }
  formData.append("id", id);
  const res = await baseRequest.post("/home/update", formData);

  if (res.data.status === "success") {
    message.success("Item has been successfully updated!");
  } else if (res.data.status === "failed") {
    message.error("Didn't update the item!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

const getItems = async (response) => {
  const res = response ? response : await baseRequest.post("/home", {});
  const records = res.data.records;
  const dataSource = [];
  for (let i = 0; i < Object.keys(records).length; i++) {
    records[i].price = "$" + records[i].price.replace(".", ",");
    records[i].total_price = "$" + records[i].total_price.replace(".", ",");
    dataSource.push(Object.values(records)[i]);
  }
  return dataSource;
};

const deleteItem = async (id) => {
  const res = await baseRequest.post("/home/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Item has been successfully deleted!");
    return await getItems();
  } else if (res.data.status === "failed!") {
    message.error("Didn't delete the item!");
  } else {
    message.error("Server didn't get the request properly!");
  }
  return null;
};

export { addItem, updateItem, getItems, deleteItem };
