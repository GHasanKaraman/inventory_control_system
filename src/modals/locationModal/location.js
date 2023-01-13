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
  get_locations,
  addLocation,
  handleDelete,
  handleSave,
} from "./locationController";

import { EditableCell, EditableRow } from "../../components/tableUtils";

const { Content } = Layout;

const LocationModal = (props) => {
  const [data, setData] = useState();

  const load_locations = async () => {
    const locations = await get_locations();
    setData(locations);
  };

  useEffect(() => {
    if (props.open) {
      load_locations();
    }
  }, [props.open]);

  const [form] = Form.useForm();

  const defaultColumns = [
    {
      title: "Location Name",
      dataIndex: "location",
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
              await load_locations();
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
          await load_locations();
        },
      }),
    };
  });

  return (
    <Modal
      width={"23%"}
      onCancel={() => {
        props.onCancel();
        form.resetFields();
      }}
      footer={null}
      open={props.open}
      title="Locations"
    >
      <Space direction="vertical" align="center" size="large">
        <Row>
          <Form
            name="horizontal_login"
            form={form}
            layout="inline"
            onFinish={async (values) => {
              await addLocation(values, form);
              await load_locations();
            }}
          >
            <Form.Item
              name="location"
              rules={[
                { required: true, message: "Please input a location name!" },
              ]}
            >
              <Input placeholder="Location" />
            </Form.Item>

            <Form.Item shouldUpdate>
              {() => (
                <Button type="primary" htmlType="submit">
                  Add Location
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
    </Modal>
  );
};

export default LocationModal;
