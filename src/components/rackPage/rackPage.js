import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  message,
  Image,
  Row,
  Col,
  Typography,
  Result,
} from "antd";

import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

import { tagRender } from "../../controllers/itemsController";

import { get_datas, addItem } from "../../controllers/rackController";

const RackPage = (props) => {
  const params = useParams();
  const { id } = params;
  const [form] = Form.useForm();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [options, setOptions] = useState([{ value: "gold" }]);
  const [file, setFile] = useState(null);
  const [rack, setRack] = useState("");

  const load_datas = async () => {
    const datas = await get_datas(id);
    setRack(datas.racks[0].rack);
    const locations = datas.locations.filter(
      (loc) => loc.rack == datas.racks[0].rack
    );
    setOptions(datas.labels);
    setData(locations);
  };

  useEffect(() => {
    load_datas();
  }, []);

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
    <Row>
      <Col
        xl={{ span: 8, offset: 8 }}
        xs={{ span: 18, offset: 3 }}
        span={8}
        offset={8}
      >
        {!rack ? (
          <div style={{ textAlign: "center" }}>
            <Result
              status="404"
              title="404"
              subTitle="This rack has been removed!"
            />
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <Typography.Title
              level={3}
              style={{ color: "green", marginTop: "10px" }}
            >
              Add New Item to {rack}
            </Typography.Title>
            <Form
              encType="multipart/form-data"
              name="normal_login"
              onFinish={async (values) => {
                values["file"] = file;
                const status = await addItem(values, form);
                if (status == "success") {
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
                rules={[
                  { required: true, message: "Please enter the location!" },
                ]}
              >
                <Select
                  placeholder="Location"
                  options={data.map((loc) => {
                    return { value: loc.location };
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
          </div>
        )}
      </Col>
    </Row>
  );
};

export default RackPage;
