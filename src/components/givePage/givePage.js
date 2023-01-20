import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get_product, giveItem, fetchImage } from "./giveController";

import {
  Row,
  Col,
  Form,
  Button,
  Input,
  Select,
  Image,
  Result,
  Spin,
} from "antd";

const GivePage = (props) => {
  const params = useParams();

  const [product, setProduct] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [image, setImage] = useState("");

  const [buttonColor, setButtonColor] = useState(undefined);
  const [buttonText, setButtonText] = useState("Give");

  const [loading, setLoading] = useState(true);

  const [form] = Form.useForm();

  const { id } = params;

  const load_product = async () => {
    const item = await get_product(id);
    setProduct(item);
    if (item) {
      form.setFieldsValue(item.resultData);
      setImage(await fetchImage(item.resultData.image));
      setTechnicians(Object.values(item.records));
      setLoading(false);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  useEffect(() => {
    load_product();
  }, []);
  return (
    <Row>
      <Col
        xl={{ span: 8, offset: 8 }}
        xs={{ span: 18, offset: 3 }}
        span={8}
        offset={8}
      >
        <Spin spinning={loading} tip="Loading">
          {!product && !loading ? (
            <div style={{ textAlign: "center" }}>
              <Result
                status="404"
                title="404"
                subTitle="We couldn't find this item! It might be removed in the system!"
              />
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Image style={{ marginBottom: "10px" }} width={200} src={image} />
              <Form
                name="normal-login"
                onFinish={async (values) => {
                  const result = await giveItem(values);
                  if (result === "success") {
                    setButtonColor("#227C70");
                    setButtonText("You can take the item.");
                  } else {
                    setButtonColor("red");
                    setButtonText("You cannot take the item!");
                  }
                  form.resetFields();
                  setTimeout(() => {
                    setButtonColor(undefined);
                    setButtonText("Give");
                  }, 2000);
                  await load_product();
                }}
                form={form}
              >
                <Form.Item name="_id" noStyle={true} />
                <Form.Item name="price" noStyle={true} />
                <Form.Item name="parts" label="Parts">
                  <Input disabled style={{ color: "black" }} />
                </Form.Item>
                <Form.Item name="count" label="Count">
                  <Input disabled style={{ color: "black" }} />
                </Form.Item>
                <Form.Item name="new_location" label="Location">
                  <Input disabled style={{ color: "black" }} />
                </Form.Item>
                <Form.Item
                  name="technician"
                  rules={[
                    {
                      required: "true",
                      message:
                        "Please enter the technician who wants this item!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Who wants?"
                    options={technicians.map((tech) => {
                      return { value: tech.name };
                    })}
                  ></Select>
                </Form.Item>
                <Form.Item
                  name="wanted_count"
                  rules={[
                    {
                      validator(rule, value) {
                        return new Promise((resolve, reject) => {
                          if (!value) {
                            reject("Please enter the count of the item!");
                          }
                          if (!isNaN(value)) {
                            if (form.getFieldValue("count") == 0) {
                              reject("This item is out of stock!");
                            }
                            if (value <= 0) {
                              reject("Please enter a number greater than 0");
                            } else if (value > form.getFieldValue("count")) {
                              reject(
                                `Please enter a number less than ${form.getFieldValue(
                                  "count"
                                )} `
                              );
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
                  <Input placeholder="How many you want?" />
                </Form.Item>
                <Form.Item
                  name="target"
                  rules={[
                    {
                      required: true,
                      message: "Please enter where you are taking the item!",
                    },
                  ]}
                >
                  <Input placeholder="Target" />
                </Form.Item>
                <Form.Item>
                  <Button
                    style={{ backgroundColor: buttonColor }}
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
                    {buttonText}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </Spin>
      </Col>
    </Row>
  );
};

export default GivePage;
