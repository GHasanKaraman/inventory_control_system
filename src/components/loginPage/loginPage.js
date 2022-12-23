import React from "react";
import { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";

import baseRequest from "../../core/baseRequest.js";
import logo from "../../images/logo.png";
import "../../App.css";
import { useStore } from "../../stores/useStore";

import {
  message,
  Form,
  Input,
  Button,
  Modal,
  Checkbox,
  Avatar,
  Image,
} from "antd";

import { UserOutlined, LockOutlined } from "@ant-design/icons";

var md5 = require("md5");

const loginPage = observer((props) => {
  const navigate = useNavigate();
  const { userStore } = useStore();

  const [user, setUser] = useState(localStorage.getItem("username") || "");
  const [checked, setChecked] = useState(
    localStorage.getItem("remember") || ""
  );

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState();
  const [inputVisible, setInputVisible] = useState();
  const [adminPass, setAdminPass] = useState();

  const [form] = Form.useForm();

  useEffect(() => {
    const status = userStore.control();
    if (status) {
      navigate("/home");
    }
  }, []);

  const register = async (values) => {
    setLoading(true);
    const data = {
      email: values.email,
      password: md5(values.password),
      name: values.name,
    };
    baseRequest.post("/register", data).then((res) => {
      setLoading(false);
      if (res.data.result === "succes") {
        console.log("Signed up!");
        message.info("You have successfully signed up!");
      } else if (res.data.result === "failed") {
        message.error("Something went wrong. Try again!");
        hideModal();
      } else if (res.data.error.code === 11000) {
        message.error("This user is registered in the system!");
      }
    });
  };

  const login = async (values) => {
    if (values.remember) {
      localStorage.setItem("username", values.email);
      localStorage.setItem("remember", true);
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("remember");
    }

    const res = await userStore.login(values.email, values.password);
    if (res.result === "success") {
      navigate("/home");
    } else if (res.result === "not_found") {
      message.error("Your username or password is incorrect!");
    } else {
      message.error("You are not authenticated!");
    }
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
            initialValues={{ email: user, remember: checked }}
            onFinish={login}
          >
            <Avatar
              size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 300 }}
              src={logo}
            />
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your e-mail address.!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="E-mail"
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
                if (e.target.value === "12345") {
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
