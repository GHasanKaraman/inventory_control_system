import { Table, Tabs, Result, Layout, Row, ConfigProvider, Menu } from "antd";
import { useEffect, useState } from "react";
import { get_technicianLogs, get_qrLogs } from "./logsController";

import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";

const { Content, Sider } = Layout;

const LogsPage = (props) => {
  const [technicianLogs, setTechnicianLogs] = useState([
    { desc: "", createdAt: "" },
  ]);
  const [qrLogs, setQRLogs] = useState([{ desc: "", createdAt: "" }]);

  const [pageIndex, setPageIndex] = useState(0);

  const load_technicianLogs = async () => {
    const logs = await get_technicianLogs();
    setTechnicianLogs(logs);
  };

  const load_qrLogs = async () => {
    const logs = await get_qrLogs();
    setQRLogs(logs);
  };

  useEffect(() => {
    load_technicianLogs();
    load_qrLogs();
  }, []);

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
        <Row justify={"center"}>
          <Table
            columns={defaultColumns}
            bordered
            dataSource={technicianLogs}
          />
        </Row>
      ),
    },
    {
      key: "2",
      label: `QR Logs`,
      children: (
        <Row justify={"center"}>
          <Table columns={defaultColumns} bordered dataSource={qrLogs} />
        </Row>
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
    <Layout style={{ width: "100%" }}>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 15,
            colorPrimary: "#227C70",
          },
        }}
      >
        <Layout style={{ height: "100%" }}>
          <Sider>
            <Menu defaultSelectedKeys={"5"}
              theme="dark"
              mode="inline"
              items={menu.items}
              onClick={(item) => {
                setPageIndex({ key: item.key });
              }}
            />
            <MenuSelector selectedIndex={pageIndex} />
          </Sider>

          <Layout style={{ padding: "0 24px 24px", width: "100%" }}>
            <Content>
              <div
                style={{
                  padding: 24,
                }}
              ></div>
              <Row justify={"center"}>
                <Tabs
                  centered={true}
                  defaultActiveKey="1"
                  items={items}
                  onChange={onTabChange}
                />
              </Row>
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </Layout>
  );
};

export default LogsPage;
