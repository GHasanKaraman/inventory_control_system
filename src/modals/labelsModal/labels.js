import { useEffect, useState } from "react";
import {
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

import {
  get_labels,
  addLabel,
  handleDelete,
  handleSave,
} from "./labelsController";

import { EditableCell, EditableRow } from "../../components/tableUtils";

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
  const [form] = Form.useForm();

  const load_labels = async () => {
    const dataSource = await get_labels();
    setData(dataSource);
  };

  useEffect(() => {
    if (props.open) {
      load_labels();
    }
  }, [props.open]);

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
            onConfirm={async () => {
              await handleDelete(record._id);
              await load_labels();
            }}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

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
        handleSave: async (row) => {
          await handleSave(row);
          await load_labels();
        },
      }),
    };
  });

  return (
    <Modal
      onCancel={() => {
        props.onCancel();
        form.resetFields();
      }}
      width={"28%"}
      footer={null}
      open={props.open}
      title="Labels"
    >
      <Space direction="vertical" align="center" size="large">
        <Row justify={"start"}>
          <Form
            wrapperCol={{
              xxl: { span: 15, offset: 8 },
              xs: { span: 24, offset: 0 },
            }}
            name="horizontal_login"
            form={form}
            layout="inline"
            onFinish={async (values) => {
              await addLabel(values, form);
              await load_labels();
            }}
          >
            <Form.Item
              wrapperCol={{
                xxl: { span: 22, offset: 2 },
                xs: { span: 18, offset: 6 },
              }}
              name="label"
              rules={[
                { required: true, message: "Please input a new label name!" },
              ]}
            >
              <Input placeholder="Label" />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                xxl: { span: 18, offset: 1 },
                xs: { span: 0, offset: 5 },
              }}
              name="color"
              rules={[{ required: true, message: "Please pick a color!" }]}
            >
              <Select
                placeholder="Color"
                allowClear
                style={{
                  textAlign: "center",
                  width: "130px",
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
            <Form.Item
              shouldUpdate
              wrapperCol={{
                xxl: { span: 19, offset: 5 },
                xs: { span: 2, offset: 24 },
              }}
            >
              {() => (
                <Button type="primary" htmlType="submit">
                  Add Label
                </Button>
              )}
            </Form.Item>
          </Form>
        </Row>
        <Row>
          <Content>
            <Table
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
