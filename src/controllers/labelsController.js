import baseRequest from "../core/baseRequest";

import { message } from "antd";

const get_labels = async () => {
  const res = await baseRequest.post("/labels", {});
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

const addLabel = async (values, form) => {
  const res = await baseRequest.post("/labels/add", values);
  if (res.data.error && res.data.error.code) {
    if (res.data.error.code === 11000) {
      message.error("This label already exists!");
    }
  } else {
    message.success(
      res.data.resultData.name + " label is successfully created!"
    );
  }
};

const handleDelete = async (id) => {
  const res = await baseRequest.post("/labels/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Label has been successfully deleted!");
  } else if (res.data.status === "failed") {
    message.error("Didn't delete the label!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

const handleSave = async (row) => {
  const res = await baseRequest.post("/labels/update", row);
  if (res.data.status === "success") {
    message.success("Label has been successfully updated!");
  } else if (res.data.status === "failed") {
    message.error("Didn't update the label!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

export { get_labels, addLabel, handleDelete, handleSave };
