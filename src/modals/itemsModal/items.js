import { useState, useEffect } from "react";

import {
  Modal,
  Select,
  Form,
  Input,
  Button,
  Typography,
  Upload,
  message,
  Image,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";

import {
  addItem,
  get_labels,
  tagRender,
  updateItem,
  get_locations,
} from "./itemsController";

const ItemsModal = (props) => {
  const [form] = Form.useForm();

  const [data, setData] = useState([]);

  const [id, setID] = useState();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [options, setOptions] = useState([{ value: "gold" }]);
  const [file, setFile] = useState(null);

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

  const load_items = async () => {
    const labels = await get_labels();
    setOptions(labels);
  };
  const load_locations = async () => {
    const locations = await get_locations();
    setData(locations);
  };

  useEffect(() => {
    if (props.open) {
      load_items();
      load_locations();
      if (props.product) {
        form.setFieldsValue(props.product);
        setID(props.product.id);
      }
    } else {
      form.resetFields();
      setImageUrl(null);
    }
  }, [props.open]);

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
    <Modal
      open={props.open}
      footer={null}
      onCancel={() => {
        props.onCancel();
      }}
    >
      <Typography.Title level={3} style={{}}>
        {props.title}
      </Typography.Title>
      <Form
        enctype="multipart/form-data"
        name="normal_login"
        onFinish={async (values) => {
          values["file"] = file;
          if (props.type === "add") {
            const status = await addItem(values, form);
            if (status == "success") {
              setImageUrl(null);
            }
          }
          if (props.type === "update") updateItem(values, id);
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
          rules={[{ required: true, message: "Please enter the location!" }]}
        >
          <Select
            placeholder="Location"
            options={data.map((loc) => {
              return { value: loc.location };
            })}
          ></Select>
        </Form.Item>
        <Form.Item
          name="fishbowl"
          rules={[{ required: true, message: "Please enter Fishbowl code!" }]}
        >
          <Input placeholder="Fishbowl" />
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
            {props.buttonText}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ItemsModal;
