import { message } from "antd";
import baseRequest from "../../core/baseRequest";

const get_datas = async (id) => {
  const result = await baseRequest.post("/qr/rack", { _id: id });
  if (result.data.status === "success") {
    return {
      labels: Object.values(result.data.labels),
      locations: Object.values(result.data.locations),
      racks: Object.values(result.data.racks),
    };
  } else {
    return { labels: [], locations: [], racks: [] };
  }
};

const addItem = async (values, form) => {
  let {
    file,
    count,
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
  values.tags = tags == undefined || tags.length == 0 ? "NTAG" : tags;

  const formData = new FormData();
  for (const name in values) {
    formData.append(name, values[name]);
  }

  const response = await baseRequest.post("/qr/rack/add", formData);

  if (response.data.result === "success") {
    message.success("Item has been successfully added!");
    form.resetFields();
    return "success";
  } else if (response.data.result === "failed") {
    message.wrong("Something went wrong while adding the item!");
  }
  return "failed";
};

export { get_datas, addItem };
