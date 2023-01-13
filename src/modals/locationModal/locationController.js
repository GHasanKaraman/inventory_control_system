import { message } from "antd";
import baseRequest from "../../core/baseRequest";

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
    message.error("Something went wrong while retrieving labels!");
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
const handleDelete = async (id) => {
  const res = await baseRequest.post("/location/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Location has been successfully deleted!");
  } else if (res.data.status === "failed") {
    message.error("Didn't delete the location!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};
const handleSave = async (row) => {
  const res = await baseRequest.post("/location/update", row);
  if (res.data.status === "success") {
    message.success("Location has been successfully updated!");
  } else if (res.data.status === "failed") {
    message.error("Didn't update the location!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

export { get_locations, addLocation, handleDelete, handleSave };
