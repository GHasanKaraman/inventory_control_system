import { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Select, message } from "antd";

import baseRequest from "../../core/baseRequest";

const { Option } = Select;

const GiveModal = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (props.open) {
      get_technicians();
    }
  }, [props.open]);

  const get_technicians = async () => {
    const res = await baseRequest.post("/technician", {});
    if (res.data.status === "success") {
      const records = res.data.records;
      const dataSource = [];
      for (let i = 0; i < Object.keys(records).length; i++) {
        dataSource.push(Object.values(records)[i]);
      }
      setData(dataSource);
    } else if (res.data.status === "failed") {
      message.error("Something went wrong while retrieving labels!");
    }
  };

  const onFinish = async (values) => {
    values.price = values.price.substring(1);
    console.log(values);
    const res = await baseRequest.post("/home/give", values);
    console.log(res.data);
    if (res.data.result === "success") {
      message.success("You can give the items!");
      props.form.resetFields();
    } else if (res.data.status === "failed") {
      message.error("Something went wrong while giving the item!");
    }
  };

  return (
    <Modal
      open={props.open}
      onCancel={props.onCancel}
      title={props.title}
      footer={null}
    >
      <Form name="normal-login" onFinish={onFinish} form={props.form}>
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
                    } else if (value > props.form.getFieldValue("count")) {
                      reject(
                        `Please enter a number less than ${props.form.getFieldValue(
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
