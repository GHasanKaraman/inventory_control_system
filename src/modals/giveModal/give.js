import { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Select } from "antd";

import { get_technicians, giveItem } from "./giveController";

const GiveModal = (props) => {
  const [data, setData] = useState([]);

  const [form] = Form.useForm();

  const load_technicians = async () => {
    const technicians = await get_technicians();
    setData(technicians);
  };

  useEffect(() => {
    if (props.open) {
      load_technicians();
      if (props.product) {
        form.setFieldsValue(props.product);
      }
    } else {
      form.resetFields();
    }
  }, [props.open]);

  return (
    <Modal
      open={props.open}
      onCancel={props.onCancel}
      title={"Give Item"}
      footer={null}
    >
      <Form name="normal-login" onFinish={giveItem} form={form}>
        <Form.Item name="id" noStyle={true} />
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
            options={data.map((tech) => {
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
    </Modal>
  );
};

export default GiveModal;
