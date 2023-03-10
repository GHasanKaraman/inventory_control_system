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
  CarOutlined,
} from "@ant-design/icons";

export const items = [
  HomeOutlined,
  UploadOutlined,
  TagsOutlined,
  ToolFilled,
  BookFilled,
  DatabaseOutlined,
  ShopOutlined,
  CarOutlined,
  LogoutOutlined,
].map((icon, index) => ({
  key: index + 1,
  icon: React.createElement(icon),
  label: [
    "Home",
    "Add New Item",
    "Labels",
    "Technicians",
    "Logs",
    "Locations",
    "Vendors",
    "Orders",
    "Log Out",
  ][index],
}));
