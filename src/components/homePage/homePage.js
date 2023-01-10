import React from "react";
import { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { ConfigProvider, Layout, Menu, message, Form, Typography } from "antd";
import {
  UploadOutlined,
  TagsOutlined,
  LogoutOutlined,
  ToolFilled,
  BookFilled,
} from "@ant-design/icons";

import baseRequest from "../../core/baseRequest";
import { useStore } from "../../stores/useStore";

import ModalRouter from "../../modals/modalRouter";

import { ProductTable } from "../../modals/tableUtils";

const { Sider, Content } = Layout;

const items = [
  UploadOutlined,
  TagsOutlined,
  ToolFilled,
  BookFilled,
  LogoutOutlined,
].map((icon, index) => ({
  key: index + 1,
  icon: React.createElement(icon),
  label: [
    "Add New Item",
    "Labels",
    "Add Technician",
    "Technician Logs",
    "Log Out",
  ][index],
}));

const homepage = observer(() => {
  const { userStore } = useStore();

  const [selectedModal, setSelectedModal] = useState();

  const [user, setUser] = useState();
  const [productData, setProductData] = useState();

  const [colorData, setColorData] = useState();

  const navigate = useNavigate();

  const get_products = async (response) => {
    const res = response ? response : await baseRequest.post("/home", {});
    const records = res.data.records;
    const dataSource = [];
    for (let i = 0; i < Object.keys(records).length; i++) {
      records[i].price = "$" + records[i].price.replace(".", ",");
      records[i].total_price = "$" + records[i].total_price.replace(".", ",");
      dataSource.push(Object.values(records)[i]);
    }
    setProductData(dataSource);
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
        await get_products(res);
        setUser(res.data.user[0]);
      }
    } else {
      navigate("/login");
      message.error("You should be logged in!");
    }
  };

  const handleGive = (record) => {
    setSelectedModal({
      key: 5,
      product: {
        parts: record.parts,
        count: record.count,
        id: record._id,
        price: record.price,
      },
    });
  };

  const handleDelete = async (id) => {
    const res = await baseRequest.post("/home/delete", { id: id });
    if (res.data.status === "success") {
      message.success("Item has been successfully deleted!");
      await get_products();
    } else if (res.data.status === "failed!") {
      message.error("Didn't delete the item!");
    } else {
      message.error("Server didn't get the request properly!");
    }
  };

  const getColor = async () => {
    const res = await baseRequest.post("/labels", {});

    if (res.data.status === "success") {
      setColorData(Object.values(res.data.records));
    } else if (res.data.status === "failed") {
      message.error("Colors have not been retrieved!");
    }
  };

  useEffect(() => {
    getColor();
    loadHomePage();
  }, []);

  function refreshTable(data) {
    setProductData(data);
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
                  dataSource={productData}
                  tagColors={colorData}
                  onDelete={handleDelete}
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
                          fishbowl: record.fishbowl,
                          tags: record.tags.split(","),
                          id: record._id,
                        };

                        setSelectedModal({ key: 6, product: product });
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
