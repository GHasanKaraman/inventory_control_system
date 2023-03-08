import baseRequest from "../core/baseRequest";

import { message, Tag } from "antd";

const getLabels = async () => {
  const res = await baseRequest.post("/labels", {});
  if (res.data.status === "success") {
    return Object.values(res.data.records);
  } else if (res.data.status === "failed") {
    message.error("Something went wrong while retrieving labels!");
    return null;
  }
};

const addLabel = async (values) => {
  const res = await baseRequest.post("/labels/add", values);
  if (res.data.error && res.data.error.code) {
    if (res.data.error.code === 11000) {
      message.error("This label already exists!");
    }
  } else {
    message.success(
      res.data.resultData.name + " label is successfully created!"
    );
  }
};

const deleteLabel = async (id) => {
  const res = await baseRequest.post("/labels/delete", { id: id });
  if (res.data.status === "success") {
    message.success("Label has been successfully deleted!");
  } else if (res.data.status === "failed") {
    message.error("Didn't delete the label!");
  } else {
    message.error("Server didn't get the request properly!");
  }
};

const updateLabel = async (row) => {
  const res = await baseRequest.post("/labels/update", row);
  if (res.data.status === "success") {
    message.success("Label has been successfully updated!");
  } else if (res.data.status === "failed") {
    message.error("Didn't update the label!");
  } else {
    message.error("Server didn't get the request properly!");
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

export { getLabels, addLabel, deleteLabel, updateLabel, tagRender };
