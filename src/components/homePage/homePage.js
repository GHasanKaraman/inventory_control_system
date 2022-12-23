import React from "react";
import { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { Row, Col, ConfigProvider } from "antd";

import { Button, message, Input, Space, Table, Tag } from "antd";
import Highlighter from "react-highlight-words";
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  SearchOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import baseRequest from "../../core/baseRequest";
import { useStore } from "../../stores/useStore";

import { Layout, Menu } from "antd";
const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;
const items = [
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  BarChartOutlined,
].map((icon, index) => ({
  key: String(index + 1),
  icon: React.createElement(icon),
  label: ["Inventory", "Add New Item", "Add New Label", "Remove Item"][index],
}));

const homepage = observer((props) => {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState();
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const columns = [
    {
      title: "Parts",
      dataIndex: "parts",
      key: "parts",
      width: "30%",
      ...getColumnSearchProps("parts"),
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      width: "20%",
      ...getColumnSearchProps("count"),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      ...getColumnSearchProps("price"),
      sorter: (a, b) => a.price.length - b.price.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      width: "20%",
      ...getColumnSearchProps("total_price"),
    },
    {
      title: "From Where",
      dataIndex: "from_where",
      key: "from_where",
      width: "20%",
      ...getColumnSearchProps("from_where"),
    },
    {
      title: "Min Quantity",
      dataIndex: "min_quantity",
      key: "min_quantity",
      width: "20%",
      ...getColumnSearchProps("min_quantity"),
    },
    {
      title: "New Location",
      dataIndex: "new_location",
      key: "new_location",
      width: "20%",
      ...getColumnSearchProps("new_location"),
    },
    {
      title: "Fishbowl",
      dataIndex: "fishbowl",
      key: "fishbowl",
      width: "20%",
      ...getColumnSearchProps("fishbowl"),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: "20%",
      ...getColumnSearchProps("tags"),
      render: (tags) => (
        <span>
          {tags.split(",").map((tag) => {
            tag = tag.trim().toLowerCase();
            let color = "green";
            if (tag === "belt") color = "geekblue";
            if (tag == "roasting") color = "volcano";
            if (tag == "resistance") color = "magenta";

            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </span>
      ),
    },
  ];

  const { userStore } = useStore();

  const navigate = useNavigate();
  useEffect(() => {
    const control = async () => {
      const status = userStore.control();
      if (status) {
        const res = await baseRequest.post("/home", {});
        if (res.data.status === "token_error") {
          localStorage.removeItem("token");
          navigate("/login");
        } else if (res.data.status === "token_expired") {
          localStorage.removeItem("token");
          navigate("/login");
          message.error("Your session has expired! Please sign in again.");
        } else if (res.data.status === "success") {
          const records = res.data.records;
          const dataSource = [];
          for (let i = 0; i < Object.keys(records).length; i++) {
            dataSource.push(Object.values(records)[i]);
          }

          setData(dataSource);
        }
      } else {
        navigate("/login");
        message.error("You should be logged in!");
      }
    };
    control();
  }, []);

  const logout = async () => {
    localStorage.removeItem("token");
    navigate("/login");
    message.success("You hace successfully logged out!");
  };

  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 15,
            colorPrimary: "#227C70",
          },
        }}
      >
        <Layout hasSider>
          <Sider
            style={{
              overflow: "auto",
              height: "100vh",
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <Menu
              defaultSelectedKeys={["1"]}
              theme="dark"
              mode="inline"
              items={items}
            />
          </Sider>
          <Layout
            className="site-layout"
            style={{
              marginLeft: 200,
            }}
          >
            <Header
              style={{
                padding: 10,
              }}
            >
              <Row>
                <Col span={8} offset={8}>
                  <Search
                    placeholder="Search"
                    allowClear
                    enterButton
                    onSearch={(value) => {
                      console.log(value);
                    }}
                    style={{ width: 500, alignContent: "center", marginTop: 5 }}
                  />
                </Col>
                <Col span={2} offset={6}>
                  <Button
                    type="primary"
                    icon={<LogoutOutlined />}
                    style={{
                      verticalAlign: "top",
                      marginLeft: 30,
                      marginTop: 5,
                    }}
                    onClick={logout}
                  >
                    Log Out
                  </Button>
                </Col>
              </Row>
            </Header>
            <Content
              style={{
                margin: "24px 16px 0",
                overflow: "initial",
              }}
            >
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                }}
              ></div>
              <Table columns={columns} dataSource={data} />
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </div>
  );
});

export default homepage;
