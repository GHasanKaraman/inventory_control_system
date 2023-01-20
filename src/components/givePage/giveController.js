import { message } from "antd";
import baseRequest from "../../core/baseRequest";

const fetchImage = async (imageUrl) => {
  return fetch(imageUrl)
    .then((response) => response.blob())
    .then((imageBlob) => {
      const imageObjectURL = URL.createObjectURL(imageBlob);
      return imageObjectURL;
    });
};

const get_product = async (id) => {
  const response = await baseRequest.post("/qr", { id: id });

  if (response.data.result === "success") {
    return response.data;
  } else if (response.data.result === "failed") {
    if (response.data.resultData === "product_not_found") {
      return null;
    }
  }

  return null;
};

const giveItem = async (values) => {
  const res = await baseRequest.post("/qr/give", values);
  if (res.data.result === "success") {
    message.success("You can take the items!");
    return "success";
  } else if (res.data.status === "failed") {
    message.error("Something went wrong while giving the item!");
    return "failed";
  }
};

export { get_product, giveItem, fetchImage };
