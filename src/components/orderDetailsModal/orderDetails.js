import { Modal, Form, Button, Select, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { getLocations } from "../../controllers/locationsController";
import { transferOrder } from "../../controllers/orderDetailsController";

const OrderDetailsModal = (props) => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);

  const [open, setOpen] = useState(false);

  const load_locations = async () => {
    const locations = await getLocations();
    setData(locations);
  };

  useEffect(() => {
    if (props.open) {
      form.resetFields();
      load_locations();
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [props.open]);

  return (
    <Modal open={open} onCancel={props.onCancel} footer={null}>
      <Typography.Title level={3} style={{ color: "green" }}>
        {props.item.parts}
      </Typography.Title>
      <Form
        encType="multipart/form-data"
        name="normal_login"
        onFinish={async (values) => {
          await transferOrder(props.item._id, values);
          form.resetFields();
          setOpen(false);
          props.reload();
        }}
        form={form}
        style={{ marginTop: 30 }}
      >
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
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            {"Transfer to Inventory"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderDetailsModal;
