import { useState, useRef } from "react";
import React, { useContext, useEffect } from "react";

import {
  Button,
  Input,
  Space,
  Table,
  Tag,
  Layout,
  Form,
  Select,
  Popconfirm,
  message,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

import baseRequest from "../../core/baseRequest";

const { Content } = Layout;
const { Option } = Select;

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
            let color = "";
            if (tag === "ntag") {
              color = "gray";
            } else {
              const result = props.tagColors.filter(
                (item) => item.name.toUpperCase() === tag.toUpperCase()
              )[0];
              color = result ? result.color : "green";
            }
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
      width: "25%",
      ...getColumnSearchProps("parts"),
      onCell: (record, rowIndex) => {},
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      width: "10%",
      ...getColumnSearchProps("count"),
      sorter: (a, b) => a.count - b.count,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      ...getColumnSearchProps("price"),
      sorter: (a, b) => {
        if (a.price && b.price) {
          a = a.price.substring(1);
          a = a.split(",");
          a = a[0] + "." + a[1];
          a = Number(a);
          b = b.price.substring(1);
          b = b.split(",");
          b = b[0] + "." + b[1];
          b = Number(b);
          return a - b;
        }
      },
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      width: "10%",
      ...getColumnSearchProps("total_price"),
    },
    {
      title: "From Where",
      dataIndex: "from_where",
      key: "from_where",
      width: "15%",
      ...getColumnSearchProps("from_where"),
    },
    {
      title: "Min Quantity",
      dataIndex: "min_quantity",
      key: "min_quantity",
      width: "10%",
      ...getColumnSearchProps("min_quantity"),
    },
    {
      title: "New Location",
      dataIndex: "new_location",
      key: "new_location",
      width: "11%",
      ...getColumnSearchProps("new_location"),
    },
    {
      title: "Fishbowl",
      dataIndex: "fishbowl",
      key: "fishbowl",
      width: "1%",
      ...getColumnSearchProps("fishbowl"),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: "5%",
      ...getColumnSearchProps("tags"),
      render: (tags) => {
        return tagRenderer(tags);
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      width: "15%",
      render: (_, record) =>
        props.dataSource.length >= 1 ? (
          <Space size="middle">
            <Button
              type="primary"
              onClick={(event) => {
                event.stopPropagation();
                props.onGive(record);
              }}
            >
              Give
            </Button>
            <Popconfirm
              title="Sure to delete?"
              onCancel={(event) => event.stopPropagation()}
              onConfirm={(event) => {
                event.stopPropagation();
                props.onDelete(record._id);
              }}
            >
              <Button
                danger
                type="link"
                onClick={(event) => event.stopPropagation()}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ) : null,
    },
  ];
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  return (
    <Table
      columns={columns}
      dataSource={props.dataSource}
      onRow={props.onRow}
    />
  );
};

//======================================================
//Editable Table Components
//======================================================

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

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  type,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {type === "input" ? (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        ) : (
          <Select
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            showSearch={true}
          >
            {colors.map((color) => {
              return (
                <Option key={color} value={color}>
                  <Tag color={color}>
                    <p style={{ height: 8 }}>{color}</p>
                  </Tag>
                </Option>
              );
            })}
          </Select>
        )}
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" onClick={toggleEdit}>
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

export { ProductTable, EditableRow, EditableCell };
