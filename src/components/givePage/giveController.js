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
    message.error("You have to sign in!");
  }

  return null;
};

const giveItem = (values) => {
  console.log(values);
};

export { get_product, giveItem, fetchImage };
