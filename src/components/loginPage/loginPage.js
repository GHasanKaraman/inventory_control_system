import React from "react";
import { useState } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";

import baseRequest from "../../core/baseRequest.js";
import logo from "../../images/logo.png";
import "../../App.css";

import {
  message,
  Form,
  Input,
  Button,
  Modal,
  Checkbox,
  Avatar,
  Image,
  Select,
} from "antd";

import { UserOutlined, LockOutlined } from "@ant-design/icons";

var md5 = require("md5");

const { Option } = Select;
const loginPage = observer((props) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState();
  const [inputVisible, setInputVisible] = useState();
  const [adminPass, setAdminPass] = useState();

  const [form] = Form.useForm();

  const register = (values) => {
    setLoading(true);
    const data = {
      name: values.name,
      username: values.username,
      password: md5(values.password),
      email: values.email,
    };

    const res = baseRequest.post("/register", data).then((res) => {
      console.log(res.data);
    });
  };

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

  const showModal = () => {
    setInputVisible({ display: "flex" });
    setVisible({ display: "none" });
    setAdminPass("");
    setOpen(true);
  };

  const hideModal = () => {
    setOpen(false);
    if (loading) {
      setLoading(false);
    }
    form.resetFields();
  };

  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }}>
        <Option value="1">+1</Option>
        <Option value="90">+90</Option>
      </Select>
    </Form.Item>
  );

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

              <a className="login-form-forgot" onClick={showModal}>
                Create User
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

          <Modal onCancel={hideModal} open={open} title="Sign Up" footer={null}>
            <Input.Password
              value={adminPass}
              style={inputVisible}
              placeholder="Admin Password"
              prefix={<LockOutlined />}
              onChange={(e) => {
                setAdminPass(e.target.value);
                if (e.target.value == "12345") {
                  setVisible({ display: "inline" });
                  setInputVisible({ display: "none" });
                } else {
                  setVisible({ display: "none" });
                }
              }}
            />
            <Form
              form={form}
              style={visible}
              {...formItemLayout}
              name="register"
              onFinish={register}
              initialValues={{
                prefix: "1",
              }}
              scrollToFirstError
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  {
                    required: true,
                    message: "Please input your full name!",
                    whitespace: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                    whitespace: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="E-mail"
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                  {
                    required: true,
                    message: "Please input your E-mail!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The two passwords that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Register
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Col>
        <Col span={6}></Col>
      </Row>
    </div>
  );
});

export default loginPage;
