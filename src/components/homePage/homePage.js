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
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  TagsOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import baseRequest from "../../core/baseRequest";
import { useStore } from "../../stores/useStore";

import { ProductTable } from "./tableUtils.js";
import LabelsModal from "./labels";
import ItemsModal from "./items";
import { Item } from "rc-menu";

const { Header, Sider } = Layout;
const { Search } = Input;

const items = [UploadOutlined, TagsOutlined].map((icon, index) => ({
  key: String(index + 1),
  icon: React.createElement(icon),
  label: ["Add New Item", "Labels"][index],
}));

const homepage = observer((props) => {
  const { userStore } = useStore();
  const [user, setUser] = useState();
  const [productData, setProductData] = useState();
  const [queryData, setQueryData] = useState();
  const [labelsModal, setLabelsModal] = useState(false);
  const [itemsModal, setItemsModal] = useState(false);
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
          setUser(res.data.user[0]);
          const dataSource = [];
          for (let i = 0; i < Object.keys(records).length; i++) {
            dataSource.push(Object.values(records)[i]);
          }
          setProductData(dataSource);
          setQueryData(dataSource);
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

  const searchTable = (query) => {
    query = query.split(";");
    let newData = Object.values({ ...productData });

    for (let i = 0; i < query.length; i++) {
      if (query[i][0] === "p") {
        const key = query[i].slice(2);
        newData = newData.filter((i) => {
          return i.parts.toLowerCase().includes(key.toLowerCase());
        });
      }

      if (query[i][0] === "c") {
        let key;
        if (query[i][1] === "=") {
          key = query[i].slice(2);
          newData = newData.filter((i) => {
            return i.count === key;
          });
        } else if (query[i][1] === "<") {
          if (query[i][2] === "=") {
            key = query[i].slice(3);
            newData = newData.filter((i) => {
              return i.count <= key;
            });
          } else {
            key = query[i].slice(2);
            newData = newData.filter((i) => {
              return i.count < key;
            });
          }
        } else if (query[i][1] === ">") {
          if (query[i][2] === "=") {
            key = query[i].slice(3);
            newData = newData.filter((i) => {
              return i.count >= key;
            });
          } else {
            key = query[i].slice(2);
            newData = newData.filter((i) => {
              return i.count > key;
            });
          }
        }
      }
    }
    setQueryData(newData);
  };

  const menuSelector = (item) => {
    if (item.key == "1") {
      setItemsModal(true);
    } else if (item.key == "2") {
      setLabelsModal(true);
    }
  };

  const hideModal = () => {
    setLabelsModal(false);
    setItemsModal(false);
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
              onClick={(item) => menuSelector(item)}
            />
            <LabelsModal onCancel={hideModal} open={labelsModal} />
            <ItemsModal open={itemsModal} onCancel={hideModal} />
            <div>
              <Button
                type="primary"
                style={{
                  position: "absolute",
                  bottom: 0,
                  display: "block",
                  width: "100%",
                }}
                icon={<UserOutlined />}
              >
                {user ? user.name.split(" ")[0] : ""}
              </Button>
            </div>
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
                      searchTable(value);
                    }}
                    onChange={(value) => {
                      if (value.target.value === "") {
                        setQueryData(productData);
                      }
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
            <ProductTable dataSource={queryData} />
          </Layout>
        </Layout>
      </ConfigProvider>
    </div>
  );
});

export default homepage;
