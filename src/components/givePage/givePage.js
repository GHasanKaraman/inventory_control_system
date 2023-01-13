import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  get_product,
  giveItem,
  fetchImage,
  get_locations,
} from "./giveController";

import { Row, Col, Form, Button, Input, Select, Image } from "antd";

const GivePage = (props) => {
  const params = useParams();

  const [product, setProduct] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [locations, setLocations] = useState([]);
  const [image, setImage] = useState("");

  const [form] = Form.useForm();

  const { id } = params;

  const load_product = async () => {
    const item = await get_product(id);
    form.setFieldsValue(item.resultData);
    setImage(await fetchImage(item.resultData.image));
    setTechnicians(Object.values(item.records));
    setProduct(item);
    setLocations(Object.values(item.locations));
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
        <div style={{ textAlign: "center" }}>
          <Image style={{ marginBottom: "10px" }} width={200} src={image} />
          <Form name="normal-login" onFinish={giveItem} form={form}>
            <Form.Item name="_id" noStyle={true} />
            <Form.Item name="price" noStyle={true} />
            <Form.Item name="parts" label="Parts">
              <Input disabled style={{ color: "black" }} />
            </Form.Item>
            <Form.Item name="count" label="Count">
              <Input disabled style={{ color: "black" }} />
            </Form.Item>
            <Form.Item
              name="technician"
              rules={[
                {
                  required: "true",
                  message: "Please enter the technician who wants this item!",
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
              name="source"
              rules={[
                { required: true, message: "Please enter the location!" },
              ]}
            >
              <Select
                placeholder="Source"
                options={locations.map((loc) => {
                  return { value: loc.location };
                })}
              ></Select>
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
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Give
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default GivePage;
