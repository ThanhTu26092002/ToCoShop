import React from "react";

import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Form, Input, Button, Divider, message } from "antd";
import axios from "axios";
import useAuth from "../hooks/useZustand";

const markdown = ``;

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth((state) => state);

  const onFinish = (values) => {
    const { email, password } = values;

    axios
      .post("http://localhost:9000/v1/login", { email, password })
      .then((response) => {
        // localStorage.setItem("auth", JSON.stringify(response.data));
        // Zustand: method
        console.log(response)
        signIn({ payload: response.data.payload, token: response.data.token, employeeInfo: response.data.employeeInfo });
        message.success("Login success");
        navigate("/home");
      })
      .catch((err) => {
        if (err.response.status === 401) {
          message.error("Sai email hoặc mật khẩu!");
        }

        if (err.response.status === 500) {
          message.error("Lỗi hệ thống!");
        }
        if (err.response.status === 400) {
          message.error("Tài khoản này không tồn tại");
        }
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <React.Fragment>
      <h3 style={{textAlign: 'center'}}>Login</h3>
      <Divider />
      <Form
        name="login-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        initialValues={{
          email: "",
          password: "",
          // , remember: true
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email không được để trống" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Mật khẩu không được để trống" },
            {
              min: 6,
              max: 10,
              message: "Độ dài mật khẩu phải nằm trong khoảng 6 đến 10 ký tự",
            },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        {/* <Form.Item
          name="remember"
          valuePropName="checked"
          wrapperCol={{ offset: 8, span: 16 }}
        >
          <Checkbox>Remember me</Checkbox>
        </Form.Item> */}

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" style={{ minWidth: 120 }}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
      <Divider></Divider>
      <ReactMarkdown children={markdown}></ReactMarkdown>
    </React.Fragment>
  );
};

export default Login;
