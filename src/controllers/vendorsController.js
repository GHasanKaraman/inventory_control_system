import { message } from "antd";
import baseRequest from "../core/baseRequest";

const getVendors = async (response) => {
  const res = response ? response : await baseRequest.post("/vendor", {});
  if (res.data.status === "success") {
    const records = res.data.records;
    const dataSource = [];
    for (let i = 0; i < Object.keys(records).length; i++) {
      dataSource.push(Object.values(records)[i]);
    }
    return dataSource;
  } else if (res.data.status === "failed") {
    message.error("Something went wrong while retrieving vendors!");
  }
};

const addVendor = async (values, form) => {
  const res = await baseRequest.post("/vendor/add", values);
  if (res.data.error) {
    if (res.data.error.code === 11000) {
      message.error("This vendor already exists!");
    }
  } else {
    message.success(res.data.resultData.name + " is successfully created!");
    form.resetFields();
  }
};
const deleteVendor = async (id) => {
  const res = await baseRequest.post("/vendor/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Vendor has been successfully deleted!");
  } else if (res.data.status === "failed") {
    message.error("Didn't delete the vendor!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};
const updateVendor = async (row) => {
  const res = await baseRequest.post("/vendor/update", row);
  if (res.data.status === "success") {
    message.success("Vendor has been successfully updated!");
  } else if (res.data.status === "failed") {
    message.error("Didn't update the vendor!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

export { getVendors, addVendor, deleteVendor, updateVendor };
