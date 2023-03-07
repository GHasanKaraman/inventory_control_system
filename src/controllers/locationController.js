import { message } from "antd";
import baseRequest from "../core/baseRequest";

const get_locations = async () => {
  const res = await baseRequest.post("/location", {});
  if (res.data.status === "success") {
    const records = res.data.records;
    const dataSource = [];
    for (let i = 0; i < Object.keys(records).length; i++) {
      dataSource.push(Object.values(records)[i]);
    }
    return dataSource;
  } else if (res.data.status === "failed") {
    message.error("Something went wrong while retrieving locations!");
  }
};

const addLocation = async (values, form) => {
  const res = await baseRequest.post("/location/add", values);
  if (res.data.error) {
    if (res.data.error.code === 11000) {
      message.error("This location already exists!");
    }
  } else {
    message.success(res.data.resultData.location + " is successfully created!");
    form.resetFields();
  }
};
const deleteLocation = async (id) => {
  const res = await baseRequest.post("/location/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Location has been successfully deleted!");
  } else if (res.data.status === "failed") {
    message.error("Didn't delete the location!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};
const saveLocation = async (row) => {
  const res = await baseRequest.post("/location/update", row);
  if (res.data.status === "success") {
    message.success("Location has been successfully updated!");
  } else if (res.data.status === "failed") {
    message.error("Didn't update the location!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

const get_racks = async () => {
  const res = await baseRequest.post("/rack", {});
  if (res.data.status === "success") {
    const records = res.data.records;
    const dataSource = [];
    for (let i = 0; i < Object.keys(records).length; i++) {
      dataSource.push(Object.values(records)[i]);
    }
    return dataSource;
  } else if (res.data.status === "failed") {
    message.error("Something went wrong while retrieving racks!");
  }
};
const addRack = async (values, form) => {
  console.log(values);
  const res = await baseRequest.post("/rack/add", values);
  if (res.data.error) {
    if (res.data.error.code === 11000) {
      message.error("This rack already exists!");
    }
  } else {
    message.success(res.data.resultData.rack + " is successfully created!");
    form.resetFields();
  }
};
const deleteRack = async (id) => {
  const res = await baseRequest.post("/rack/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Rack has been successfully deleted!");
  } else if (res.data.status === "failed") {
    message.error("Didn't delete the rack!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};
const saveRack = async (row) => {
  const res = await baseRequest.post("/rack/update", row);
  if (res.data.status === "success") {
    message.success("Rack has been successfully updated!");
  } else if (res.data.status === "failed") {
    message.error("Didn't update the rack!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

export {
  get_locations,
  addLocation,
  deleteLocation,
  saveLocation,
  get_racks,
  addRack,
  deleteRack,
  saveRack,
};
