import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ConfigProvider,
  Menu,
  Tabs,
  Avatar,
  List,
  Steps,
  Form,
  Input,
  Button,
  Upload,
  Select,
  Image,
  Popconfirm,
  message,
  Row,
  Layout,
} from "antd";

import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  addOrder,
  getOrders,
  stepUpOrder,
  deleteOrder,
} from "../../controllers/ordersController";
import { getLabels, tagRender } from "../../controllers/labelsController";

import OrderDetailsModal from "../orderDetailsModal/orderDetails";

import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";

import baseRequest from "../../core/baseRequest";
import userAuth from "../../utils/userAuth";

import { TIME } from "../../utils/const";

const { Content, Sider } = Layout;

const OrdersPage = (props) => {
  const [options, setOptions] = useState([{ value: "gold" }]);
  const [orders, setOrders] = useState([{ title: "N/A" }]);

  const [pageIndex, setPageIndex] = useState(0);

  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [file, setFile] = useState(null);

  const [form] = Form.useForm();

  const navigate = useNavigate();

  const loadLabels = async (res) => {
    const labels = await getLabels();
    setOptions(labels);
  };

  const loadOrders = async (res) => {
    const orders = await getOrders(res);
    setOrders(orders);
  };

  const loadOrdersPage = async () => {
    const res = await baseRequest.post("/order", {});
    const status = userAuth.control(res);
    if (status) {
      loadLabels(res);
      loadOrders();
    } else {
      message.error("You should sign in again!");
      navigate("/login");
    }
  };

  useEffect(() => {
    loadOrdersPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadOrdersPage();
    }, TIME);
    return () => clearInterval(interval);
  }, []);
  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  const beforeUpload = (file) => {
    setFile(file);
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      message.error("Image must smaller than 10MB!");
    }
    return isJpgOrPng && isLt2M;
  };
  const uploadButton = (
    <div>
      {props.product && props.product.image ? (
        <Image src={props.product.image} preview={false} width={90} />
      ) : loading ? (
        <LoadingOutlined />
      ) : (
        <PlusOutlined />
      )}
      <div
        style={{
          marginTop: 8,
        }}
      >
        {props.product && props.product.image ? null : "Upload"}
      </div>
    </div>
  );

  const dummyRequest = async ({ file, onSuccess }) => {
    setLoading(true);
    setImageUrl(null);
    setTimeout(() => {
      onSuccess("ok");
      setLoading(false);
    }, 1000);
  };

  const tabs = [
    {
      key: "1",
      label: `Add Order`,
      children: (
        <Form
          encType="multipart/form-data"
          name="normal_login"
          onFinish={async (values) => {
            values["file"] = file;
            const status = await addOrder(values, form);
            if (status === "success") {
              setImageUrl(null);
            }
          }}
          form={form}
        >
          <Form.Item
            name="file"
            rules={[
              {
                validator(e, value) {
                  return new Promise((resolve, reject) => {
                    if (value) {
                      resolve();
                    } else {
                      if (props.type === "update") {
                        resolve();
                      } else {
                        reject("Please upload the image of the item!");
                      }
                    }
                  });
                },
              },
            ]}
          >
            <Upload
              customRequest={dummyRequest}
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="avatar"
                  style={{
                    width: "100%",
                  }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name="parts"
            rules={[
              { required: true, message: "Please input name of the parts!" },
            ]}
          >
            <Input placeholder="Part Name" />
          </Form.Item>
          <Form.Item
            name="count"
            rules={[
              {
                validator(_, value) {
                  return new Promise((resolve, reject) => {
                    if (!value) {
                      reject("Please enter the count of the item!");
                    }
                    if (value.includes(".")) {
                      reject("Please enter an integer!");
                    }
                    if (!isNaN(value)) {
                      value = Number(value);
                      if (value < 0) {
                        reject("Please enter a number greater than 0");
                      } else {
                        resolve();
                      }
                    } else {
                      reject("Enter an number!");
                    }
                  });
                },
              },
            ]}
          >
            <Input placeholder="Count" />
          </Form.Item>
          <Form.Item
            name="price"
            rules={[
              {
                validator(_, value) {
                  return new Promise((resolve, reject) => {
                    if (!value) {
                      reject("Please enter the price of the item!");
                    }
                    if (value.includes(".")) {
                      reject("Dot symbol is not accepted!");
                    }
                    value = value.split(",");
                    if (value.length > 2) {
                      reject("Please enter the number properly!");
                    }
                    if (!isNaN(value[0])) {
                      if (value.length == 2) {
                        if (isNaN(value[1])) {
                          reject("Please enter a number!");
                        }
                        if (value[1] == "") {
                          reject("Please enter a number!");
                        }
                      }
                      if (value[0] < 0) {
                        reject("Please enter a price greater than 0");
                      } else {
                        resolve();
                      }
                    } else {
                      reject("Please enter a number!");
                    }
                  });
                },
              },
            ]}
          >
            <Input placeholder="Price" />
          </Form.Item>

          <Form.Item
            name="from_where"
            rules={[
              {
                required: true,
                message: "Please enter where did you get this item from!",
              },
            ]}
          >
            <Input placeholder="Vendor" />
          </Form.Item>
          <Form.Item name="tags" required>
            <Select
              maxTagCount={4}
              placeholder="Tags"
              mode="multiple"
              showArrow
              tagRender={(e) => tagRender({ options, e })}
              style={{
                width: "100%",
              }}
              options={options.map((item) => {
                return { value: item.name };
              })}
            />
          </Form.Item>
          <Form.Item
            name="status"
            rules={[{ required: true, message: "Please select the status!" }]}
          >
            <Select
              placeholder="Status"
              options={[
                { value: "ordered", label: "ORDERED" },
                { value: "delivery", label: "IN DELIVERY" },
              ]}
            ></Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              {"Add Order"}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "2",
      label: `Show Orders`,
      children: (
        <List
          itemLayout="horizontal"
          dataSource={orders}
          renderItem={(item) => {
            return (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    key="list-loadmore-edit"
                    onClick={async () => {
                      if (item.status != 2) {
                        await stepUpOrder(item);
                      } else {
                        setDetailsModal(true);
                        setSelectedItem(item);
                      }
                      loadOrdersPage();
                    }}
                  >
                    Step
                  </Button>,
                  <Popconfirm
                    title="Sure to delete?"
                    onConfirm={async () => {
                      await deleteOrder(item._id);
                      loadOrdersPage();
                    }}
                  >
                    <Button type="link" key="list-loadmore-more">
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.image} />}
                  title={
                    /*Order link can be added here in href*/
                    <a href="#order_link">{item.parts}</a>
                  }
                  description={item.from_where}
                />
                <Steps
                  responsive={true}
                  current={item.status}
                  type="inline"
                  items={[
                    {
                      title: "Ordered",
                    },
                    {
                      title: "In Delivery",
                    },
                    {
                      title: "Delivered",
                    },
                  ]}
                />
              </List.Item>
            );
          }}
        />
      ),
    },
  ];
  return (
    <div>
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
                defaultSelectedKeys={"8"}
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
                    items={tabs}
                    onTabClick={(e) => {
                      if (e == 2) {
                        loadOrdersPage();
                      }
                    }}
                  ></Tabs>
                </Row>
              </Content>
            </Layout>
          </Layout>
        </ConfigProvider>
      </Layout>

      <OrderDetailsModal
        item={selectedItem}
        reload={loadOrdersPage}
        open={detailsModal}
        onCancel={() => {
          setDetailsModal(false);
        }}
      />
    </div>
  );
};
export default OrdersPage;
