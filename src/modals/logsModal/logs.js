import { Modal, Table, Tabs, Result } from "antd";
import { useEffect, useState } from "react";
import { get_technicianLogs, get_qrLogs } from "./logsController";

const LogModal = (props) => {
  const [technicianLogs, setTechnicianLogs] = useState([
    { desc: "", createdAt: "" },
  ]);
  const [qrLogs, setQRLogs] = useState([{ desc: "", createdAt: "" }]);

  const load_technicianLogs = async () => {
    const logs = await get_technicianLogs();
    setTechnicianLogs(logs);
  };

  const load_qrLogs = async () => {
    const logs = await get_qrLogs();
    setQRLogs(logs);
  };

  useEffect(() => {
    if (props.open) {
      load_technicianLogs();
      load_qrLogs();
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

  const onTabChange = (key) => {
    console.log(key);
  };

  const items = [
    {
      key: "1",
      label: `User Activity Logs`,
      children: (
        <Table
          columns={defaultColumns}
          bordered
          dataSource={technicianLogs}
        ></Table>
      ),
    },
    {
      key: "2",
      label: `QR Logs`,
      children: (
        <Table columns={defaultColumns} bordered dataSource={qrLogs}></Table>
      ),
    },
    {
      key: "3",
      label: `Product Logs`,
      children: (
        <Result
          title="This feature will be on v1.1"
          subTitle="System needs some data to open this feature."
        />
      ),
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
      <Tabs defaultActiveKey="1" items={items} onChange={onTabChange} />
    </Modal>
  );
};

export default LogModal;
