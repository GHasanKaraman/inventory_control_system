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
  Form,
  Typography,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  TagsOutlined,
  LogoutOutlined,
  ToolFilled,
  BookFilled,
} from "@ant-design/icons";

import baseRequest from "../../core/baseRequest";
import { useStore } from "../../stores/useStore";

import { ProductTable } from "./tableUtils.js";
import LabelsModal from "./labels";
import ItemsModal from "./items";
import GiveModal from "./give";
import TechnicianModal from "./technician";
import LogModal from "./logs";

const { Header, Sider, Content } = Layout;
const { Search } = Input;

const items = [
  UploadOutlined,
  TagsOutlined,
  ToolFilled,
  BookFilled,
  LogoutOutlined,
].map((icon, index) => ({
  key: String(index + 1),
  icon: React.createElement(icon),
  label: [
    "Add New Item",
    "Labels",
    "Add Technician",
    "Technician Logs",
    "Log Out",
  ][index],
}));

const homepage = observer((props) => {
  const { userStore } = useStore();

  const [user, setUser] = useState();
  const [id, setID] = useState();
  const [productData, setProductData] = useState();
  const [colorData, setColorData] = useState();

  const [logModal, setLogModal] = useState(false);
  const [labelsModal, setLabelsModal] = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [giveModal, setGiveModal] = useState(false);
  const [technicianModal, setTechnicianModal] = useState(false);

  const navigate = useNavigate();

  const [registerForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [giveForm] = Form.useForm();

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
    giveForm.setFieldsValue({
      parts: record.parts,
      count: record.count,
      id: record._id,
      price: record.price,
    });
    setGiveModal(true);
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
    } else {
      message.error("Colors have not been retrieved!");
    }
  };

  useEffect(() => {
    getColor();
    loadHomePage();
  }, []);

  const logout = async () => {
    localStorage.removeItem("token");
    navigate("/login");
    message.success("You hace successfully logged out!");
  };

  const menuSelector = (item) => {
    if (item.key == "1") {
      setRegisterModal(true);
    } else if (item.key == "2") {
      setLabelsModal(true);
    } else if (item.key == "3") {
      setTechnicianModal(true);
    } else if (item.key == "4") {
      setLogModal(true);
    } else if (item.key == "5") {
      logout();
    }
  };

  const hideModal = async () => {
    if (labelsModal) {
      setLabelsModal(false);
    }
    if (registerModal) {
      setRegisterModal(false);
      await get_products();
    }
    if (updateModal) {
      setUpdateModal(false);
    }
    if (giveModal) {
      setGiveModal(false);
      giveForm.resetFields();
    }
    if (technicianModal) {
      setTechnicianModal(false);
    }
    if (logModal) {
      setLogModal(false);
    }
    get_products();
  };
  const addItem = async (values) => {
    let {
      count,
      fishbowl,
      from_where,
      min_quantity,
      new_location,
      parts,
      price,
      tags,
    } = values;

    parts = parts.toUpperCase();
    from_where = from_where.toUpperCase();
    new_location = new_location.toUpperCase();
    fishbowl = fishbowl.toUpperCase();
    tags = tags.length == 0 ? "NTAG" : tags;

    const response = await baseRequest.post("/items", {
      count,
      fishbowl,
      from_where,
      min_quantity,
      new_location,
      parts,
      price,
      tags,
    });

    if (response.data.result === "success") {
      message.success("Item has been successfully added!");
      registerForm.resetFields();
    } else if (response.data.result === "failed") {
      message.wrong("Something went wrong while adding the item!");
    }
  };

  const updateItem = async (values) => {
    const res = await baseRequest.post("/home/update", { id, ...values });

    if (res.data.status === "success") {
      message.success("Item has been successfully updated!");
      get_products();
    } else if (res.data.status === "failed") {
      message.error("Didn't update the item!");
    } else {
      message.error("Server didn't get the request properly!");
    }
  };

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
              onClick={(item) => menuSelector(item)}
            />
            <LabelsModal onCancel={hideModal} open={labelsModal} />
            <ItemsModal
              open={registerModal}
              onCancel={hideModal}
              title="Register New Item"
              buttonText="Add Item"
              onFinish={addItem}
              form={registerForm}
            />
            <ItemsModal
              open={updateModal}
              onCancel={hideModal}
              title="Update Item"
              buttonText="Update Item"
              form={updateForm}
              onFinish={updateItem}
            />
            <GiveModal
              open={giveModal}
              onCancel={hideModal}
              title="Give Item"
              form={giveForm}
            />
            <TechnicianModal open={technicianModal} onCancel={hideModal} />
            <LogModal open={logModal} onCancel={hideModal} />
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
              <ProductTable
                dataSource={productData}
                tagColors={colorData}
                onDelete={handleDelete}
                onGive={handleGive}
                onRow={(record, _) => {
                  return {
                    onClick: async () => {
                      updateForm.setFieldsValue({
                        parts: record.parts,
                        count: String(record.count),
                        price: record.price.substring(1),
                        from_where: record.from_where,
                        min_quantity: record.min_quantity,
                        new_location: record.new_location,
                        fishbowl: record.fishbowl,
                        tags: record.tags.split(","),
                      });
                      setID(record._id);
                      setUpdateModal(true);
                    },
                  };
                }}
              />
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </Layout>
  );
});

export default homepage;
