import { useState, useEffect } from "react";

import { Modal, Select, Form, Input, Button, Typography } from "antd";

import { addItem, get_labels, tagRender, updateItem } from "./itemsController";

const ItemsModal = (props) => {
  const [form] = Form.useForm();
  const [id, setID] = useState();

  const [options, setOptions] = useState([{ value: "gold", value: "lime" }]);

  const load_items = async () => {
    const labels = await get_labels();
    setOptions(labels);
  };

  useEffect(() => {
    if (props.open) {
      load_items();
      if (props.product) {
        form.setFieldsValue(props.product);
        setID(props.product.id);
      }
    } else {
      form.resetFields();
    }
  }, [props.open]);

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
        name="normal_login"
        onFinish={(values) => {
          if (props.type === "add") addItem(values, form);
          if (props.type === "update") updateItem(values, id);
        }}
        form={form}
        style={{ marginTop: 30 }}
      >
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
          <Input placeholder="From Where" />
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
          rules={[{ required: true, message: "Please enter new location!" }]}
        >
          <Input placeholder="New Location" />
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
