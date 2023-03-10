import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Select,
  Form,
  Input,
  Button,
  Upload,
  message,
  Image,
  Row,
  ConfigProvider,
  Menu,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";

import { addItem } from "../../controllers/itemsController";
import { tagRender } from "../../controllers/labelsController";

import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";

import { getLabels } from "../../controllers/labelsController";
import { getLocations } from "../../controllers/locationsController";
import { getVendors } from "../../controllers/vendorsController";
import { getNotificationsLength } from "../../controllers/notificationsController";

import userAuth from "../../utils/userAuth.js";
import baseRequest from "../../core/baseRequest";

import { TIME } from "../../utils/const";

const { Content, Sider } = Layout;

const ItemsPage = (props) => {
  const [form] = Form.useForm();
  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [options, setOptions] = useState([{ value: "gold" }]);
  const [file, setFile] = useState(null);

  const [notificationsLength, setNotificationsLength] = useState(0);

  const navigate = useNavigate();

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
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

  const loadItems = async (res) => {
    const labels = await getLabels(res);
    setOptions(labels);
  };
  const loadLocations = async (res) => {
    const locations = await getLocations(res);
    setLocations(locations);
  };

  const loadVendors = async (res) => {
    const vendors = await getVendors(res);
    setVendors(vendors);
  };

  const loadNotifications = async () => {
    const length = await getNotificationsLength();
    setNotificationsLength(length);
  };

  const loadItemsPage = async () => {
    const res = await baseRequest.post("/location", {});

    const status = userAuth.control(res);
    if (status) {
      loadLocations(res);
      loadVendors();
      loadItems();
      loadNotifications();
    } else {
      message.error("You should sign in again!");
      navigate("/login");
    }
  };

  useEffect(() => {
    form.resetFields();
    setImageUrl(null);

    loadItemsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadItemsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

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
              defaultSelectedKeys={"2"}
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
                <Form
                  enctype="multipart/form-data"
                  name="normal_login"
                  onFinish={async (values) => {
                    values["file"] = file;
                    const status = await addItem(values, form);
                    if (status == "success") {
                      setImageUrl(null);
                    }
                  }}
                  form={form}
                >
                  <Form.Item
                    style={{ textAlign: "center" }}
                    name="file"
                    rules={[
                      {
                        validator(e, value) {
                          return new Promise((resolve, reject) => {
                            if (value) {
                              resolve();
                            } else {
                              reject("Please upload the image of the item!");
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
                      {
                        required: true,
                        message: "Please input name of the parts!",
                      },
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
                        message: "Please enter a vendor name!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Vendor"
                      options={vendors.map((item) => {
                        return { value: item.vendor };
                      })}
                    ></Select>
                  </Form.Item>
                  <Form.Item
                    name="min_quantity"
                    rules={[
                      {
                        validator(_, value) {
                          return new Promise((resolve, reject) => {
                            if (!value) {
                              reject("Please enter min quantity!");
                            }
                            if (value.includes(".")) {
                              reject("Please enter an integer!");
                            }
                            if (!isNaN(value)) {
                              if (value < 0) {
                                reject("Please enter a number greater than 0");
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
                    <Input placeholder="Min Quantity" />
                  </Form.Item>
                  <Form.Item
                    name="new_location"
                    rules={[
                      { required: true, message: "Please enter the location!" },
                    ]}
                  >
                    <Select
                      placeholder="Location"
                      options={locations.map((item) => {
                        return { value: item.location };
                      })}
                    ></Select>
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
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                    >
                      Add Item
                    </Button>
                  </Form.Item>
                </Form>
              </Row>
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </Layout>
  );
};

export default ItemsPage;
