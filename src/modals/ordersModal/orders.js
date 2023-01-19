import { useState, useEffect } from "react";
import {
  Modal,
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
} from "antd";

import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  get_labels,
  get_locations,
  tagRender,
} from "../itemsModal/itemsController";
import {
  addOrder,
  get_orders,
  step_up,
  delete_order,
} from "./ordersController";
import OrderDetailsModal from "../orderDetailsModal/orderDetails";

const OrdersModal = (props) => {
  const [data, setData] = useState([]);
  const [options, setOptions] = useState([{ value: "gold" }]);
  const [orders, setOrders] = useState([{ title: "N/A" }]);

  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [file, setFile] = useState(null);

  const [form] = Form.useForm();

  const load_items = async () => {
    const labels = await get_labels();
    setOptions(labels);
  };
  const load_locations = async () => {
    const locations = await get_locations();
    setData(locations);
  };

  const load_orders = async () => {
    const _orders = get_orders();
    _orders.then(setOrders);
  };

  useEffect(() => {
    if (props.open) {
      load_orders();
      load_items();
      load_locations();
    }
  }, [props.open]);

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
          style={{ marginTop: 30 }}
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
                        await step_up(item);
                      } else {
                        setDetailsModal(true);
                        setSelectedItem(item);
                      }
                      load_orders();
                    }}
                  >
                    Step
                  </Button>,
                  <Popconfirm
                    title="Sure to delete?"
                    onConfirm={async () => {
                      await delete_order(item._id);
                      load_orders();
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
    <Modal
      open={props.open}
      onCancel={props.onCancel}
      footer={null}
      width="35%"
    >
      <Tabs
        items={tabs}
        onTabClick={(e) => {
          if (e == 2) {
            load_orders();
          }
        }}
      ></Tabs>
      <OrderDetailsModal
        item={selectedItem}
        reload={load_orders}
        open={detailsModal}
        onCancel={() => {
          setDetailsModal(false);
        }}
      />
    </Modal>
  );
};
export default OrdersModal;
