import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Tabs,
  Result,
  Layout,
  Row,
  ConfigProvider,
  Menu,
  message,
} from "antd";
import { getTechnicianLogs, getQRLogs } from "../../controllers/logsController";
import { getNotificationsLength } from "../../controllers/notificationsController";

import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";

import baseRequest from "../../core/baseRequest";
import userAuth from "../../utils/userAuth";

import { TIME } from "../../utils/const";

const { Content, Sider } = Layout;

const LogsPage = (props) => {
  const [technicianLogs, setTechnicianLogs] = useState([
    { desc: "", createdAt: "" },
  ]);
  const [qrLogs, setQRLogs] = useState([{ desc: "", createdAt: "" }]);

  const [pageIndex, setPageIndex] = useState(0);

  const [notificationsLength, setNotificationsLength] = useState(0);

  const navigate = useNavigate();

  const loadTechnicianLogs = async (res) => {
    const logs = await getTechnicianLogs(res);
    setTechnicianLogs(logs);
  };

  const loadQRLogs = async (res) => {
    const logs = await getQRLogs(res);
    setQRLogs(logs);
  };

  const loadNotifications = async () => {
    const length = await getNotificationsLength();
    setNotificationsLength(length);
  };

  const loadLogsPage = async () => {
    const res = await baseRequest.post("/logs/qr", {});
    const status = userAuth.control(res);
    if (status) {
      loadQRLogs(res);
      loadTechnicianLogs();
      loadNotifications();
    } else {
      message.error("You should sign in again!");
      navigate("/login");
    }
  };

  useEffect(() => {
    loadLogsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadLogsPage();
    }, TIME);

    return () => clearInterval(interval);
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
            <Menu
              defaultSelectedKeys={"5"}
              theme="dark"
              mode="inline"
              items={menu.items(notificationsLength)}
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
