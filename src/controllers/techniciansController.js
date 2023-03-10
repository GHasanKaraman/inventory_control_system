import { message } from "antd";
import baseRequest from "../core/baseRequest";

const getTechnicians = async (response) => {
  const res = response ? response : await baseRequest.post("/technician", {});
  if (res.data.status === "success") {
    const records = res.data.records;
    const dataSource = [];
    for (let i = 0; i < Object.keys(records).length; i++) {
      dataSource.push(Object.values(records)[i]);
    }
    return dataSource;
  } else if (res.data.status === "failed") {
    message.error("Something went wrong while retrieving technicians!");
  }
};

const addTechnician = async (values, form) => {
  const res = await baseRequest.post("/technician/add", values);
  if (res.data.error) {
    if (res.data.error.code === 11000) {
      message.error("This technician already exists!");
    }
  } else {
    message.success(res.data.resultData.name + " is successfully created!");
    form.resetFields();
  }
};
const deleteTechnician = async (id) => {
  const res = await baseRequest.post("/technician/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Technician has been successfully deleted!");
  } else if (res.data.status === "failed") {
    message.error("Didn't delete the technician!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};
const updateTechnician = async (row) => {
  const res = await baseRequest.post("/technician/update", row);
  if (res.data.status === "success") {
    message.success("Technician has been successfully updated!");
  } else if (res.data.status === "failed") {
    message.error("Didn't update the technician!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

export { getTechnicians, addTechnician, deleteTechnician, updateTechnician };
