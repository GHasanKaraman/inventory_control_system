import baseRequest from "../../core/baseRequest";
import { message, Tag } from "antd";

const addItem = async (values, form) => {
  let {
    count,
    fishbowl,
    from_where,
    min_quantity,
    new_location,
    parts,
    price,
    tags,
  } = values;

  parts = parts.toUpperCase();
  from_where = from_where.toUpperCase();
  new_location = new_location.toUpperCase();
  fishbowl = fishbowl.toUpperCase();
  tags = tags.length == 0 ? "NTAG" : tags;

  const response = await baseRequest.post("/items", {
    count,
    fishbowl,
    from_where,
    min_quantity,
    new_location,
    parts,
    price,
    tags,
  });

  if (response.data.result === "success") {
    message.success("Item has been successfully added!");
    form.resetFields();
  } else if (response.data.result === "failed") {
    message.wrong("Something went wrong while adding the item!");
  }
};

const updateItem = async (values, id) => {
  const res = await baseRequest.post("/home/update", { id, ...values });

  if (res.data.status === "success") {
    message.success("Item has been successfully updated!");
  } else if (res.data.status === "failed") {
    message.error("Didn't update the item!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

const get_labels = async () => {
  const res = await baseRequest.post("/labels", {});
  if (res.data.status === "success") {
    const records = res.data.records;
    const dataSource = [];
    for (let i = 0; i < Object.keys(records).length; i++) {
      dataSource.push(Object.values(records)[i]);
    }
    return dataSource;
  } else {
    message.error("Something went wrong while retrieving labels!");
    return null;
  }
};

const tagRender = (props) => {
  const { options, e } = props;
  const { _, value, closable, onClose } = e;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return options.filter((item) => item.name === value).length != 0 ? (
    <Tag
      color={options.filter((item) => item.name === value)[0].color}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{
        marginRight: 3,
      }}
    >
      {value}
    </Tag>
  ) : undefined;
};

export { addItem, get_labels, tagRender, updateItem };
