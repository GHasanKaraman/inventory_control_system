import baseRequest from "../../core/baseRequest";
import { message, Tag } from "antd";

const addItem = async (values, form) => {
  let {
    file,
    count,
    fishbowl,
    from_where,
    min_quantity,
    new_location,
    parts,
    price,
    tags,
  } = values;

  values.parts = parts.toUpperCase();
  values.from_where = from_where.toUpperCase();
  values.new_location = new_location.toUpperCase();
  values.fishbowl = fishbowl.toUpperCase();
  values.tags = tags == undefined || tags.length == 0 ? "NTAG" : tags;

  const formData = new FormData();
  for (const name in values) {
    formData.append(name, values[name]);
  }

  const response = await baseRequest.post("/items", formData);

  if (response.data.result === "success") {
    message.success("Item has been successfully added!");
    form.resetFields();
    return "success";
  } else if (response.data.result === "failed") {
    message.wrong("Something went wrong while adding the item!");
  }
  return "failed";
};

const updateItem = async (values, id) => {
  const res = await baseRequest.post("/home/update", { id, ...values });

  console.log(values);

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
