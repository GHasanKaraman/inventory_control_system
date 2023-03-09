import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ConfigProvider, Layout, Menu, message, Typography } from "antd";

import baseRequest from "../../core/baseRequest";

import ModalRouter from "../../modals/modalRouter";
import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";

import { ProductTable } from "../tableUtils";

import { getItems, deleteItem } from "../../controllers/itemsController";
import { getLabels } from "../../controllers/labelsController";

import userAuth from "../../utils/userAuth.js";

import { TIME } from "../../utils/const";

const { Sider, Content } = Layout;

const HomePage = (props) => {
  const [modalIndex, setmodalIndex] = useState();
  const [pageIndex, setPageIndex] = useState(0);
  const [user, setUser] = useState();
  const [data, setData] = useState();
  const [colorData, setColorData] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    loadHomePage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadHomePage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const loadProducts = async (res) => {
    const products = await getItems(res);
    setData(products);
  };

  const loadColors = async () => {
    const colors = await getLabels();
    setColorData(colors);
  };

  const loadHomePage = async () => {
    const res = await baseRequest.post("/home", {});
    const status = userAuth.control(res);
    if (status) {
      loadProducts(res);
      loadColors();
      setUser(res.data.user[0]);
    } else {
      message.error("You should sign in again!");
      navigate("/login");
    }
  };

  const handleGive = (record) => {
    setmodalIndex({
      key: 2,
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
              defaultSelectedKeys={"1"}
              theme="dark"
              mode="inline"
              items={menu.items}
              onClick={(item) => {
                setPageIndex({ key: item.key });
              }}
            />
            <ModalRouter
              selectedIndex={modalIndex}
              refreshTable={refreshTable}
            />
            <MenuSelector selectedIndex={pageIndex} />
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
                    refreshTable(await deleteItem(id));
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

                        setmodalIndex({ key: 1, product: product });
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
};

export default HomePage;
