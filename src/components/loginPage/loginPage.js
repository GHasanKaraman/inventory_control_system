import React from "react";
import { useState } from "react";
import { observer } from "mobx-react";

import axios from "axios";

import logo from "../../images/logo.png";
import "../../App.css";

import { useNavigate } from "react-router-dom";

import { Row, Col } from "antd";
import { message, Form, Input, Button, Checkbox, Avatar, Image } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import baseRequest from "../../core/baseRequest.js";

const loginPage = observer((props) => {
  const navigate = useNavigate();

  const login = (values) => {
    values = { ...values };
    const data = {
      status: "Success",
      username: values.username,
      password: values.password,
    };
    const res = baseRequest.post("/login", data).then((res) => {
      const { perm, username } = res.data;

      if (perm == "enter") {
        navigate("/home");
      } else {
        message.error("No Enter!!!!");
      }
    });
  };

  return (
    <div>
      <Row align="center">
        <Col span={8}>
          <Image
            preview={false}
            width={"1000px"}
            src={require("../../images/roadless.png")}
          />
        </Col>
        <Col span={8} offset={4}>
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={login}
          >
            <Avatar
              size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 300 }}
              src={logo}
            />
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your Username!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Username"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <a className="login-form-forgot" href="">
                Forgot password
              </a>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={6}></Col>
      </Row>
    </div>
  );
});

export default loginPage;
