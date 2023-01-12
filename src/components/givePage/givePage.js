import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get_product, giveItem } from "./giveController";

import { Row, Col, Form, Button, Input, Select, Image } from "antd";
import GiveModal from "../../modals/giveModal/give";

const GivePage = (props) => {
  const params = useParams();

  const [product, setProduct] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  const [form] = Form.useForm();

  const { id } = params;

  const load_product = async () => {
    const item = await get_product(id);
    form.setFieldsValue(item.resultData);
    setTechnicians(Object.values(item.records));
    setProduct(item);
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
          <Image
            style={{ marginBottom: "10px" }}
            preview={false}
            width={200}
            src="https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg"
          />
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
