import { Modal, Table, message } from "antd";
import { useEffect, useState } from "react";

import baseRequest from "../../core/baseRequest";

const LogModal = (props) => {
  const get_logs = async () => {
    const res = await baseRequest.post("/logs", {});
    if (res.data.status == "success") {
      const { logs, users } = res.data.records;
      const dataSource = [];

      for (let i = 0; i < Object.keys(logs).length; i++) {
        const value = Object.values(logs)[i];
        const tech = value.technician;
        const parts = value.parts;
        const wanted_count = value.wanted_count;
        const count = value.count;
        const user_name = Object.values(users).filter(
          (item) => item._id == value.userID
        )[0].name;
        dataSource.push({
          createdAt: value.createdAt,
          desc: `${user_name} gave ${wanted_count}/${count} ${parts} to ${tech}.`,
        });
      }

      setData(dataSource);
    } else {
      message.error("Didn't retrieve logs!");
    }
  };

  useEffect(() => {
    if (props.open) {
      get_logs();
    }
  }, [props.open]);

  const [data, setData] = useState([{ desc: "", createdAt: "" }]);
  const defaultColumns = [
    {
      title: "Description",
      dataIndex: "desc",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
    },
  ];

  return (
    <Modal
      open={props.open}
      title="Technician Logs"
      onCancel={props.onCancel}
      footer={null}
      width={1000}
    >
      <Table columns={defaultColumns} bordered dataSource={data}></Table>
    </Modal>
  );
};

export default LogModal;
