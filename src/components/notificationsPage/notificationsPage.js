import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Row, ConfigProvider, Menu, message, List, Avatar } from "antd";

import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";

import baseRequest from "../../core/baseRequest";
import userAuth from "../../utils/userAuth";

import { TIME } from "../../utils/const";
import { getNotifications } from "../../controllers/notificationsController";

const { Content, Sider } = Layout;

const NotificationsPage = (props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  const loadNotifications = async (res) => {
    const data = await getNotifications();
    setNotifications(data);
  };

  const loadNotificationsPage = async () => {
    const res = await baseRequest.post("/home", {});
    const status = userAuth.control(res);
    if (status) {
      loadNotifications(res);
    } else {
      message.error("You should sign in again!");
      navigate("/login");
    }
  };

  useEffect(() => {
    loadNotificationsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadNotificationsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

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
              defaultSelectedKeys={"9"}
              theme="dark"
              mode="inline"
              items={menu.items(0)}
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
              <List
                pagination={{ position: "bottom", align: "end" }}
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.image} />}
                      title={<p>{item.message}</p>}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
              <Row justify={"center"}></Row>
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </Layout>
  );
};

export default NotificationsPage;
