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
  getVendors,
  addVendor,
  deleteVendor,
  updateVendor,
} from "../../controllers/vendorsController";

import { EditableCell, EditableRow } from "../tableUtils";
import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";

import baseRequest from "../../core/baseRequest";
import userAuth from "../../utils/userAuth";

import { TIME } from "../../utils/const";

const { Sider, Content } = Layout;

const VendorsPage = (props) => {
  const [data, setData] = useState();
  const [pageIndex, setPageIndex] = useState(0);

  const navigate = useNavigate();

  const loadVendors = async (res) => {
    const vendors = await getVendors(res);
    setData(vendors);
  };

  const loadVendorsPage = async () => {
    const res = await baseRequest.post("/vendor", {});
    const status = userAuth.control(res);
    if (status) {
      loadVendors(res);
    } else {
      message.error("You should sign in again!");
      navigate("/login");
    }
  };

  useEffect(() => {
    loadVendorsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadVendorsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const [form] = Form.useForm();

  const defaultColumns = [
    {
      title: "Vendor",
      dataIndex: "vendor",
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
              await deleteVendor(record._id);
              await loadVendors();
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
          await updateVendor(row);
          await loadVendors();
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
              defaultSelectedKeys={"7"}
              theme="dark"
              mode="inline"
              items={menu.items}
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
                    await addVendor(values, form);
                    await loadVendors();
                  }}
                >
                  <Form.Item
                    name="vendor"
                    rules={[
                      {
                        required: true,
                        message: "Please input a vendor name!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Vendor"
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
                        Add Vendor
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

export default VendorsPage;
