import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Row,
  Tag,
  Select,
  Table,
  Popconfirm,
  Layout,
  ConfigProvider,
  Menu,
  message,
} from "antd";

import {
  getLabels,
  addLabel,
  deleteLabel,
  updateLabel,
} from "../../controllers/labelsController";
import { getNotificationsLength } from "../../controllers/notificationsController";

import { EditableCell, EditableRow } from "../tableUtils";
import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";
import baseRequest from "../../core/baseRequest";
import userAuth from "../../utils/userAuth";

const { Option } = Select;
const { Content, Sider } = Layout;

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
  "pink",
  "brown",
  "violet",
];

const LabelsPage = (props) => {
  const [data, setData] = useState();
  const [pageIndex, setPageIndex] = useState(0);
  const [form] = Form.useForm();

  const [notificationsLength, setNotificationsLength] = useState(0);

  const navigate = useNavigate();

  const loadLabels = async (res) => {
    const dataSource = await getLabels(res);
    setData(dataSource);
  };

  const loadNotifications = async () => {
    const length = await getNotificationsLength();
    setNotificationsLength(length);
  };

  const loadLabelsPage = async () => {
    const res = await baseRequest.post("/labels", {});
    const status = userAuth.control(res);
    if (status) {
      loadLabels(res);
      loadNotifications();
    } else {
      message.error("You should sign in again!");
      navigate("/login");
    }
  };

  useEffect(() => {
    loadLabelsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadLabelsPage();
    }, 1000 * 60 * 20);

    return () => clearInterval(interval);
  }, []);

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
      type: "colorSelect",
    },
    {
      title: "Action",
      dataIndex: "operation",
      render: (_, record) =>
        data.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={async () => {
              await deleteLabel(record._id);
              await loadLabelsPage();
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
          await updateLabel(row);
          await loadLabelsPage();
        },
      }),
    };
  });

  return (
    <Layout style={{ width: "100%" }}>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 15,
            colorPrimary: "#227C70",
          },
        }}
      >
        <Layout style={{ height: "100%" }}>
          <Sider>
            <Menu
              defaultSelectedKeys={"3"}
              theme="dark"
              mode="inline"
              items={menu.items(notificationsLength)}
              onClick={(item) => {
                setPageIndex({ key: item.key });
              }}
            />
            <MenuSelector selectedIndex={pageIndex} />
          </Sider>

          <Layout style={{ padding: "0 24px 24px", width: "100%" }}>
            <Content>
              <div
                style={{
                  padding: 24,
                }}
              ></div>
              <Row justify={"center"}>
                <Form
                  name="horizontal_login"
                  form={form}
                  onFinish={async (values) => {
                    await addLabel(values, form);
                    await loadLabelsPage();
                  }}
                >
                  <Form.Item
                    name="label"
                    rules={[
                      {
                        required: true,
                        message: "Please input a new label name!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Label"
                      style={{
                        width: "200px",
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="color"
                    rules={[
                      { required: true, message: "Please pick a color!" },
                    ]}
                  >
                    <Select
                      placeholder="Color"
                      allowClear
                      style={{
                        textAlign: "center",
                        width: "200px",
                      }}
                    >
                      {colors.map((color) => {
                        return (
                          <Option
                            key={color}
                            value={color}
                            style={{ textAlign: "center" }}
                          >
                            <Tag
                              color={color}
                              style={{ width: 75, textAlign: "center" }}
                            >
                              <p style={{ height: 8 }}>{color}</p>
                            </Tag>
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item shouldUpdate>
                    {() => (
                      <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                          width: "200px",
                        }}
                      >
                        Add Label
                      </Button>
                    )}
                  </Form.Item>
                </Form>
              </Row>
              <Row justify={"center"}>
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
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </Layout>
  );
};

export default LabelsPage;
