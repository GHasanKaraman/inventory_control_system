import { useState, useRef } from "react";

import { Button, Input, Space, Table, Tag, Layout } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

const { Content } = Layout;

const ProductTable = (props) => {
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
    onFilter: (value, record) => {
      if (record[dataIndex]) {
        return record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      }
    },
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

  const tagRenderer = (tags) => {
    return (
      <span>
        {tags != null ? (
          tags.split(",").map((tag) => {
            tag = tag.trim().toLowerCase();
            let color = "green";
            if (tag === "belt") color = "geekblue";
            if (tag == "roasting") color = "black";
            if (tag == "resistance") color = "magenta";
            if (tag == "ntag") color = "volcano";
            return (
              <div>
                <Tag color={color} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
              </div>
            );
          })
        ) : (
          <Tag color="volcano" key="ntag">
            {"NTAG"}
          </Tag>
        )}
      </span>
    );
  };

  const columns = [
    {
      title: "Parts",
      dataIndex: "parts",
      key: "parts",
      width: "30%",
      ...getColumnSearchProps("parts"),
      onCell: (record, rowIndex) => {},
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
      render: (tags) => {
        return tagRenderer(tags);
      },
    },
  ];
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  return (
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
      <Table columns={columns} dataSource={props.dataSource} />
    </Content>
  );
};

export default ProductTable;
