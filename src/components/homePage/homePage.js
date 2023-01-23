import React from "react";
import { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { ConfigProvider, Layout, Menu, message, Typography } from "antd";
import {
  UploadOutlined,
  TagsOutlined,
  LogoutOutlined,
  ToolFilled,
  BookFilled,
  DatabaseOutlined,
  CarOutlined,
} from "@ant-design/icons";

import baseRequest from "../../core/baseRequest";
import { useStore } from "../../stores/useStore";

import ModalRouter from "../../modals/modalRouter";

import { ProductTable } from "../tableUtils";
import { get_products, handleDelete, get_colors } from "./homeController";
import { openNotifications } from "./notifications";

const { Sider, Content } = Layout;

const items = [
  UploadOutlined,
  TagsOutlined,
  ToolFilled,
  BookFilled,
  DatabaseOutlined,
  CarOutlined,
  LogoutOutlined,
].map((icon, index) => ({
  key: index + 1,
  icon: React.createElement(icon),
  label: [
    "Add New Item",
    "Labels",
    "Technicians",
    "Logs",
    "Locations",
    "Orders",
    "Log Out",
  ][index],
}));

const homepage = observer(() => {
  const { userStore } = useStore();

  const [selectedModal, setSelectedModal] = useState();
  const [user, setUser] = useState();
  const [data, setData] = useState();
  const [colorData, setColorData] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    load_colors();
    loadHomePage();
    openNotifications();
  }, []);

  const load_products = async (res) => {
    const products = await get_products(res);
    setData(products);
  };

  const load_colors = async () => {
    const colors = await get_colors();
    setColorData(colors);
  };

  const loadHomePage = async () => {
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
      } else if (res.data.status === "user_not_found") {
        localStorage.removeItem("token");
        navigate("/login");
        message.error("Your session has expired! Please sign in again.");
      } else if (res.data.status === "success") {
        load_products(res);
        setUser(res.data.user[0]);
      }
    } else {
      navigate("/login");
      message.error("You should be logged in!");
    }
  };

  const handleGive = (record) => {
    setSelectedModal({
      otherKey: 2,
      product: {
        parts: record.parts,
        count: record.count,
        id: record._id,
        price: record.price,
        new_location: record.new_location,
      },
    });
  };

  function refreshTable(data) {
    setData(data);
  }

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
              theme="dark"
              mode="inline"
              items={items}
              onClick={(item) => setSelectedModal({ key: Number(item.key) })}
            />
            <ModalRouter
              selectedIndex={selectedModal}
              refreshTable={refreshTable}
              refresh={load_products}
            />
          </Sider>

          <Layout style={{ padding: "0 24px 24px", width: "400%" }}>
            <Content>
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <Typography.Title style={{ color: "#227C70" }} level={4}>
                  {user ? user.name.split(" ")[0] : ""}
                </Typography.Title>
              </div>
              {colorData ? (
                <ProductTable
                  dataSource={data}
                  tagColors={colorData}
                  onDelete={async (id, image) => {
                    refreshTable(await handleDelete(id));
                  }}
                  onGive={handleGive}
                  onRow={(record, _) => {
                    return {
                      onClick: async () => {
                        const product = {
                          parts: record.parts,
                          count: String(record.count),
                          price: record.price.substring(1),
                          from_where: record.from_where,
                          min_quantity: record.min_quantity,
                          new_location: record.new_location,
                          tags: record.tags.split(","),
                          id: record._id,
                          image: record.image,
                        };

                        setSelectedModal({ otherKey: 1, product: product });
                      },
                    };
                  }}
                />
              ) : null}
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </Layout>
  );
});

export default homepage;
