import { message } from "antd";
import baseRequest from "../../core/baseRequest";

const get_technicians = async () => {
  const res = await baseRequest.post("/technician", {});
  if (res.data.status === "success") {
    const records = res.data.records;
    const dataSource = [];
    for (let i = 0; i < Object.keys(records).length; i++) {
      dataSource.push(Object.values(records)[i]);
    }
    return dataSource;
  } else if (res.data.status === "failed") {
    message.error("Something went wrong while retrieving labels!");
    return null;
  }
};

const get_locations = async () => {
  const res = await baseRequest.post("/location", {});
  if (res.data.status === "success") {
    const records = res.data.records;
    console.log(records);
    const dataSource = [];
    for (let i = 0; i < Object.keys(records).length; i++) {
      dataSource.push(Object.values(records)[i]);
    }
    return dataSource;
  } else if (res.data.status === "failed") {
    message.error("Something went wrong while retrieving locations!");
    return null;
  }
};

const giveItem = async (values) => {
  values.price = values.price.substring(1);
  const res = await baseRequest.post("/home/give", values);
  if (res.data.result === "success") {
    message.success("You can give the items!");
  } else if (res.data.status === "failed") {
    message.error("Something went wrong while giving the item!");
  }
};

export { get_technicians, giveItem, get_locations };
