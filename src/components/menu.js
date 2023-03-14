import React from "react";
import {
  HomeOutlined,
  UploadOutlined,
  TagsOutlined,
  LogoutOutlined,
  ToolFilled,
  BookFilled,
  DatabaseOutlined,
  ShopOutlined,
  BellOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { Badge } from "antd";

const ICONS = [
  HomeOutlined,
  UploadOutlined,
  TagsOutlined,
  ToolFilled,
  BookFilled,
  DatabaseOutlined,
  ShopOutlined,
  CarOutlined,
  BellOutlined,
  LogoutOutlined,
];

const labels = (notify) => [
  "Home",
  "Add New Item",
  "Labels",
  "Technicians",
  "Logs",
  "Locations",
  "Vendors",
  "Orders",
  notify ? (
    <span>
      Notifications
      <Badge style={{ marginLeft: "5px" }} size="small" count={notify}></Badge>
    </span>
  ) : (
    "Notifications"
  ),
  "Log Out",
];

export const items = (notify = false) =>
  ICONS.map((icon, index) => ({
    key: index + 1,
    icon: React.createElement(icon),
    label: labels(notify)[index],
  }));
