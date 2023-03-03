import { message } from "antd";
import baseRequest from "../core/baseRequest";

const fetchImage = async (imageUrl) => {
  return fetch(imageUrl)
    .then((response) => response.blob())
    .then((imageBlob) => {
      const imageObjectURL = URL.createObjectURL(imageBlob);
      return imageObjectURL;
    });
};

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

export { get_products };
