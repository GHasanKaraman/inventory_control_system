import { message } from "antd";
import baseRequest from "../../core/baseRequest";

const get_technicianLogs = async () => {
  const res = await baseRequest.post("/logs/technicians", {});
  if (res.data.status == "success") {
    const { logs, users } = res.data.records;
    const dataSource = [];

    for (let i = 0; i < Object.keys(logs).length; i++) {
      const value = Object.values(logs)[i];
      const tech = value.technician;
      const parts = value.parts;
      const wanted_count = value.wanted_count;
      const count = value.count;
      const source = value.source;
      const target = value.target;
      const user_name = Object.values(users).filter(
        (item) => item._id == value.userID
      )[0].name;
      dataSource.push({
        createdAt: value.createdAt,
        desc: `${user_name} gave ${wanted_count}/${count} ${parts} to ${tech} from ${source} to ${target}.`,
      });
    }

    return dataSource;
  } else {
    message.error("Didn't retrieve logs!");
    return null;
  }
};

const get_qrLogs = async () => {
  const res = await baseRequest.post("/logs/qr", {});
  if (res.data.status == "success") {
    const { logs } = res.data.records;
    const dataSource = [];

    for (let i = 0; i < Object.keys(logs).length; i++) {
      const value = Object.values(logs)[i];
      const tech = value.technician;
      const parts = value.parts;
      const wanted_count = value.wanted_count;
      const count = value.count;
      const source = value.source;
      const target = value.target;
      dataSource.push({
        createdAt: value.createdAt,
        desc: `${tech} took ${wanted_count}/${count} ${parts} from ${source} to ${target}.`,
      });
    }

    return dataSource;
  } else {
    message.error("Didn't retrieve QR logs!");
    return null;
  }
};

export { get_technicianLogs, get_qrLogs };
