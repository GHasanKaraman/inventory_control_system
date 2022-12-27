import React from "react";
import { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import {
  Row,
  Col,
  ConfigProvider,
  Layout,
  Menu,
  Button,
  message,
  Input,
  Space,
  Table,
  Tag,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import baseRequest from "../../core/baseRequest";
import { useStore } from "../../stores/useStore";

import ProductTable from "./tableUtils.js";

const { Header, Content, Sider } = Layout;
const { Search } = Input;

const items = [UserOutlined, VideoCameraOutlined, UploadOutlined].map(
  (icon, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label: ["Inventory", "Add New Item", "Labels"][index],
  })
);

const homepage = observer((props) => {
  const [data, setData] = useState();
  const { userStore } = useStore();

  const navigate = useNavigate();
  useEffect(() => {
    const control = async () => {
      const status = userStore.control();
      if (status) {
        const res = await baseRequest.post("/home", {});
        if (res.data.status === "token_error") {
          localStorage.removeItem("token");
          navigate("/login");
        } else if (res.data.status === "token_expired") {
          localStorage.removeItem("token");
          navigate("/login");
          message.error("Your session has expired! Please sign in again.");
        } else if (res.data.status === "success") {
          const records = res.data.records;
          const dataSource = [];
          for (let i = 0; i < Object.keys(records).length; i++) {
            dataSource.push(Object.values(records)[i]);
          }

          setData(dataSource);
        }
      } else {
        navigate("/login");
        message.error("You should be logged in!");
      }
    };
    control();
  }, []);

  const logout = async () => {
    localStorage.removeItem("token");
    navigate("/login");
    message.success("You hace successfully logged out!");
  };

  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 15,
            colorPrimary: "#227C70",
          },
        }}
      >
        <Layout hasSider>
          <Sider
            style={{
              overflow: "auto",
              height: "100vh",
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <Menu
              defaultSelectedKeys={["1"]}
              theme="dark"
              mode="inline"
              items={items}
            />
          </Sider>
          <Layout
            className="site-layout"
            style={{
              marginLeft: 200,
            }}
          >
            <Header
              style={{
                padding: 10,
              }}
            >
              <Row>
                <Col span={8} offset={8}>
                  <Search
                    placeholder="Search"
                    allowClear
                    enterButton
                    onSearch={(value) => {
                      console.log(value);
                    }}
                    style={{ width: 500, alignContent: "center", marginTop: 5 }}
                  />
                </Col>
                <Col span={2} offset={6}>
                  <Button
                    type="primary"
                    icon={<LogoutOutlined />}
                    style={{
                      verticalAlign: "top",
                      marginLeft: 30,
                      marginTop: 5,
                    }}
                    onClick={logout}
                  >
                    Log Out
                  </Button>
                </Col>
              </Row>
            </Header>
            <Content
              style={{
                margin: "24px 16px 0",
                overflow: "initial",
              }}
            >
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                }}
              ></div>
              <ProductTable dataSource={data} />
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </div>
  );
});

export default homepage;
