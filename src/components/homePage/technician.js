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
const { Content } = Layout;

const TechnicianModal = (props) => {
  const [data, setData] = useState();

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

  useEffect(() => {
    if (props.open) {
      get_technicians();
    }
  }, [props.open]);

  const addTechnician = async (values) => {
    const res = await baseRequest.post("/technician/add", values);
    if (res.data.error) {
      if (res.data.error.code === 11000) {
        message.error("This technician already exists!");
      }
    } else {
      message.success(res.data.resultData.name + " is successfully created!");

      form.resetFields();
      get_technicians();
    }
  };
  const [form] = Form.useForm();

  const handleDelete = async (id) => {
    const res = await baseRequest.post("/technician/delete", { id: id });
    if (res.data.status === "success") {
      message.success("Technician has been successfully deleted!");
      get_technicians();
    } else if (res.data.status === "failed") {
      message.error("Didn't delete the technician!");
    } else {
      message.error("Server didn't get the request properly!");
    }
  };
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
            onConfirm={() => handleDelete(record._id)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];
  const handleSave = async (row) => {
    const res = await baseRequest.post("/technician/update", row);
    if (res.data.status === "success") {
      message.success("Label has been successfully updated!");
      get_technicians();
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
      title="Technicians"
    >
      <Space direction="vertical" align="center" size="large">
        <Row>
          <Form
            name="horizontal_login"
            form={form}
            layout="inline"
            onFinish={addTechnician}
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

export default TechnicianModal;
