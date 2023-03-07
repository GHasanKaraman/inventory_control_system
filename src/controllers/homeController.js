import { message } from "antd";
import baseRequest from "../core/baseRequest";
import { fetchImage } from "../utils/img2blob";

const get_products = async (response) => {
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

const convert_images = async (records, start, end) => {
  const dataSource = [];
  for (let i = start; i <= end; i++) {
    records[i].image = await fetchImage(records[i].image);
    dataSource.push(Object.values(records)[i]);
  }
  return dataSource;
};

const handleDelete = async (id) => {
  const res = await baseRequest.post("/home/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Item has been successfully deleted!");
    return await get_products();
  } else if (res.data.status === "failed!") {
    message.error("Didn't delete the item!");
  } else {
    message.error("Server didn't get the request properly!");
  }
  return null;
};

const get_colors = async () => {
  const res = await baseRequest.post("/labels", {});

  if (res.data.status === "success") {
    return Object.values(res.data.records);
  } else if (res.data.status === "failed") {
    message.error("Colors have not been retrieved!");
    return null;
  }
};

export { get_products, handleDelete, get_colors, convert_images };
