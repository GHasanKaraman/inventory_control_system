import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  ConfigProvider,
  Menu,
  Row,
  Table,
  Popconfirm,
  Space,
  Layout,
  Select,
  Tabs,
  message,
} from "antd";

import {
  getNonUsedLocations,
  getRacks,
  addLocation,
  deleteLocation,
  updateLocation,
  addRack,
  deleteRack,
  updateRack,
} from "../../controllers/locationsController";

import { EditableCell, EditableRow } from "../tableUtils";
import MenuSelector from "../../utils/menuSelector";
import * as menu from "../menu";
import PrintComponent from "../../utils/print";

import baseRequest from "../../core/baseRequest";
import userAuth from "../../utils/userAuth";

import { TIME } from "../../utils/const";

const { Content, Sider } = Layout;

const LocationsPage = (props) => {
  const [locations, setLocations] = useState();
  const [racks, setRacks] = useState();

  const [pageIndex, setPageIndex] = useState(0);

  const navigate = useNavigate();

  const loadNonUsedLocations = async (res) => {
    const locations = await getNonUsedLocations(res);
    setLocations(locations);
  };

  const loadRacks = async (res) => {
    const racks = await getRacks(res);
    setRacks(racks);
  };

  const loadLocationsPage = async () => {
    const res = await baseRequest.post("/location/nonused", {});
    const status = userAuth.control(res);
    if (status) {
      loadNonUsedLocations(res);
      loadRacks();
    } else {
      message.error("You should sign in again!");
      navigate("/login");
    }
  };

  useEffect(() => {
    loadLocationsPage();
  }, []);

  useEffect(() => {
    //This is for reloading home page
    const interval = setInterval(() => {
      loadLocationsPage();
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  const [rackForm] = Form.useForm();
  const [locationForm] = Form.useForm();

  const defaultLocationColumns = [
    {
      title: "Location Name",
      dataIndex: "location",
      width: "50%",
      editable: true,
      type: "input",
    },
    {
      title: "Rack Name",
      dataIndex: "rack",
      width: "20%",
      editable: true,
      type: "rackSelect",
    },
    {
      title: "Action",
      dataIndex: "operation",
      width: "20%",
      render: (_, record) =>
        locations.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={async () => {
              await deleteLocation(record._id);
              await loadLocationsPage();
            }}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

  const defaultRackColumns = [
    {
      title: "Rack Name",
      dataIndex: "rack",
      width: "70%",
      editable: true,
      type: "input",
    },
    {
      title: "Action",
      dataIndex: "operation",
      render: (_, record) => (
        <Space>
          <PrintComponent
            buttonType="primary"
            url={(
              "http://" +
              window.location.hostname +
              `:${window.location.port}/rack/${record._id}`
            ).trim()}
            part={record.rack}
            location={""}
          />
          <Popconfirm
            title="Sure to delete?"
            onConfirm={async () => {
              await deleteRack(record._id);
              await loadLocationsPage();
            }}
          >
            <a>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const locationColumns = defaultLocationColumns.map((col) => {
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
          await updateLocation(row);
          await loadLocationsPage();
        },
      }),
    };
  });

  const rackColumns = defaultRackColumns.map((col) => {
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
          await updateRack(row);
          await loadLocationsPage();
        },
      }),
    };
  });

  const onTabChange = (key) => {
    console.log(key);
  };

  const items = [
    {
      key: "1",
      label: `Locations`,
      children: (
        <Space direction="vertical" align="center" size="large">
          <Row>
            <Form
              name="horizontal_login"
              form={locationForm}
              onFinish={async (values) => {
                await addLocation(values, locationForm);
                await loadLocationsPage();
              }}
            >
              <Form.Item
                name="location"
                rules={[
                  { required: true, message: "Please input a location name!" },
                ]}
              >
                <Input
                  placeholder="Location"
                  style={{
                    width: "200px",
                  }}
                />
              </Form.Item>
              <Form.Item
                name="rack"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select a rack that this location will be binded!",
                  },
                ]}
              >
                <Select
                  style={{
                    width: "200px",
                  }}
                  placeholder="Rack"
                  options={
                    racks
                      ? racks.map((rack) => {
                          return { value: rack.rack };
                        })
                      : []
                  }
                ></Select>
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
                dataSource={locations}
                columns={locationColumns}
              />
            </Content>
          </Row>
        </Space>
      ),
    },
    {
      key: "2",
      label: `Racks`,
      children: (
        <Space direction="vertical" align="center" size="large">
          <Row>
            <Form
              name="horizontal_login"
              form={rackForm}
              onFinish={async (values) => {
                await addRack(values, rackForm);
                await loadLocationsPage();
              }}
            >
              <Form.Item
                name="rack"
                rules={[
                  { required: true, message: "Please input a rack name!" },
                ]}
              >
                <Input
                  placeholder="Rack"
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
                    Add Rack
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
                dataSource={racks}
                columns={rackColumns}
              />
            </Content>
          </Row>
        </Space>
      ),
    },
  ];
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
              defaultSelectedKeys={"6"}
              theme="dark"
              mode="inline"
              items={menu.items}
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
                <Tabs
                  defaultActiveKey="1"
                  centered={true}
                  items={items}
                  onChange={onTabChange}
                />
              </Row>
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </Layout>
  );
};

export default LocationsPage;
