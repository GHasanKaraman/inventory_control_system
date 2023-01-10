import { Modal, Table, message } from "antd";
import { useEffect, useState } from "react";
import { get_logs } from "./logsController";

const LogModal = (props) => {
  const [data, setData] = useState([{ desc: "", createdAt: "" }]);
  const load_logs = async () => {
    const logs = await get_logs();
    setData(logs);
  };

  useEffect(() => {
    if (props.open) {
      load_logs();
    }
  }, [props.open]);

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
