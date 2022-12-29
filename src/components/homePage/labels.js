import { useEffect, useState } from "react";
import {
  message,
  Form,
  Input,
  Button,
  Modal,
  Row,
  Tag,
  Select,
  Table,
  Popconfirm,
  Space,
  Layout,
} from "antd";

import baseRequest from "../../core/baseRequest";

import { EditableCell, EditableRow } from "./tableUtils";

const { Option } = Select;
const { Content } = Layout;

const colors = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
  "black",
];

const LabelsModal = (props) => {
  const [data, setData] = useState();

  const get_labels = async () => {
    const res = await baseRequest.post("/labels", {});
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

  useEffect(() => {
    if (props.open) {
      get_labels();
    }
  }, [props.open]);

  const addLabel = async (values) => {
    const res = await baseRequest.post("/labels/add", values);
    if (res.data.error_code) {
      if (res.data.error.code === 11000) {
        message.error("This label already exists!");
      }
    } else {
      console.log(res.data);
      message.success(
        res.data.resultData.name + " label is successfully created!"
      );

      form.resetFields();
      get_labels();
    }
  };
  const [form] = Form.useForm();

  const handleDelete = async (id) => {
    const res = await baseRequest.post("/labels/delete", { id: id });
    if (res.data.status === "success") {
      message.success("Label has been successfully deleted!");
      get_labels();
    } else if (res.data.status === "failed") {
      message.error("Didn't delete the label!");
    } else {
      message.error("Server didn't get the request properly!");
    }
  };
  const defaultColumns = [
    {
      title: "Tag Name",
      dataIndex: "name",
      width: "30%",
      editable: true,
      type: "input",
    },
    {
      title: "Color",
      dataIndex: "color",
      render: (label) => {
        return <Tag color={label}>{label}</Tag>;
      },
      editable: true,
      type: "select",
    },
    {
      title: "Action",
      dataIndex: "operation",
      render: (_, record) =>
        data.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record._id)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];
  const handleSave = async (row) => {
    const res = await baseRequest.post("/labels/update", row);
    if (res.data.status === "success") {
      message.success("Label has been successfully updated!");
      get_labels();
    } else if (res.data.status === "failed") {
      message.error("Didn't update the label!");
    } else {
      message.error("Server didn't get the request properly!");
    }
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        type: col.type,
        handleSave,
      }),
    };
  });

  return (
    <Modal
      width={700}
      onCancel={() => {
        props.onCancel();
        form.resetFields();
      }}
      footer={null}
      open={props.open}
      title="Labels"
    >
      <Space direction="vertical" align="center" size="large">
        <Row>
          <Form
            name="horizontal_login"
            form={form}
            layout="inline"
            onFinish={addLabel}
          >
            <Form.Item
              name="label"
              rules={[
                { required: true, message: "Please input a new label name!" },
              ]}
            >
              <Input placeholder="Label" />
            </Form.Item>
            <Form.Item
              name="color"
              rules={[{ required: true, message: "Please pick a color!" }]}
            >
              <Select
                placeholder="Color"
                allowClear
                style={{
                  textAlign: "center",
                  width: 150,
                }}
              >
                {colors.map((color) => {
                  return (
                    <Option
                      key={color}
                      value={color}
                      style={{ textAlign: "center" }}
                    >
                      <Tag color={color} style={{ width: 75 }}>
                        <p style={{ textAlign: "center", height: 8 }}>
                          {color}
                        </p>
                      </Tag>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item shouldUpdate>
              {() => (
                <Button type="primary" htmlType="submit">
                  Add Label
                </Button>
              )}
            </Form.Item>
          </Form>
        </Row>
        <Row>
          <Content
            style={{
              margin: "0px 12px 0",
              overflow: "initial",
            }}
          >
            <Table
              style={{ width: 600 }}
              components={components}
              rowClassName={() => "editable-row"}
              bordered
              dataSource={data}
              columns={columns}
            />
          </Content>
        </Row>
      </Space>
    </Modal>
  );
};

export default LabelsModal;
