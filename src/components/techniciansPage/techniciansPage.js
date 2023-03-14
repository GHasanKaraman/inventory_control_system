import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  ConfigProvider,
  Layout,
  Menu,
  Row,
  Table,
  Popconfirm,
  message,
} from "antd";

import {
  getTechnicians,
  addTechnician,
  deleteTechnician,
  updateTechnician,
} from "../../controllers/techniciansController";

import { EditableCell, EditableRow } from "../tableUtils";
import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";

import baseRequest from "../../core/baseRequest";
import userAuth from "../../utils/userAuth";

import { TIME } from "../../utils/const";

const { Sider, Content } = Layout;

const TechniciansPage = (props) => {
  const [data, setData] = useState();
  const [pageIndex, setPageIndex] = useState(0);

  const navigate = useNavigate();

  const loadTechnicians = async (res) => {
    const technicians = await getTechnicians(res);
    setData(technicians);
  };

  const loadTechniciansPage = async () => {
    const res = await baseRequest.post("/technician", {});
    const status = userAuth.control(res);
    if (status) {
      loadTechnicians(res);
    } else {
      message.error("You should sign in again!");
      navigate("/login");
    }
  };

  useEffect(() => {
    loadTechniciansPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadTechniciansPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

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
              await deleteTechnician(record._id);
              await loadTechnicians();
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
          await updateTechnician(row);
          await loadTechnicians();
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
              defaultSelectedKeys={"4"}
              theme="dark"
              mode="inline"
              items={menu.items(true)}
              onClick={(item) => setPageIndex({ key: item.key })}
            />
            <MenuSelector selectedIndex={pageIndex} />
          </Sider>

          <Layout style={{ padding: "0 24px 24px", width: "400%" }}>
            <Content>
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                }}
              ></div>
              <Row justify="center">
                <Form
                  name="horizontal_login"
                  form={form}
                  onFinish={async (values) => {
                    await addTechnician(values, form);
                    await loadTechnicians();
                  }}
                >
                  <Form.Item
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please input a technician name!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Technician"
                      style={{
                        width: "200px",
                      }}
                    />
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
                        Add Technician
                      </Button>
                    )}
                  </Form.Item>
                </Form>
              </Row>
              <Row justify="center">
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

export default TechniciansPage;
