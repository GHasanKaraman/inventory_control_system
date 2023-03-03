import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Modal,
  Row,
  Table,
  Popconfirm,
  Space,
  Layout,
} from "antd";

import {
  get_technicians,
  addTechnician,
  handleDelete,
  handleSave,
} from "./techniciansController";

import { EditableCell, EditableRow } from "../tableUtils";

const { Content } = Layout;

const TechniciansPage = (props) => {
  const [data, setData] = useState();

  const load_technicians = async () => {
    const technicians = await get_technicians();
    setData(technicians);
  };

  useEffect(() => {
    if (props.open) {
      load_technicians();
    }
  }, [props.open]);

  const [form] = Form.useForm();

  const defaultColumns = [
    {
      title: "Technician Name",
      dataIndex: "name",
      width: "70%",
      editable: true,
      type: "input",
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
              await load_technicians();
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
          await load_technicians();
        },
      }),
    };
  });

  return (
    <Space direction="vertical" align="center" size="large">
      <Row>
        <Form
          name="horizontal_login"
          form={form}
          layout="inline"
          onFinish={async (values) => {
            await addTechnician(values, form);
            await load_technicians();
          }}
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Please input a technician name!" },
            ]}
          >
            <Input placeholder="Technician" />
          </Form.Item>

          <Form.Item shouldUpdate>
            {() => (
              <Button type="primary" htmlType="submit">
                Add Technician
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
            components={components}
            rowClassName={() => "editable-row"}
            bordered
            dataSource={data}
            columns={columns}
          />
        </Content>
      </Row>
    </Space>
  );
};

export default TechniciansPage;
