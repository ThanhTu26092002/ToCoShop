import React from "react";

import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Form, Input, Button, Divider, message } from "antd";
import useAuth from "../hooks/useZustand";
import { PropsFormItemEmail, PropsFormItem_Label_Name } from "../config/props";
import axiosClient from "../config/axios";

const markdown = ``;

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth((state) => state);

  const onFinish = (values) => {
    const { email, password } = values;

    axiosClient
      .post("http://localhost:9000/v1/login", { email, password })
      .then((response) => {
        // localStorage.setItem("employeeInfo", JSON.stringify(response.data.employeeInfo));
        // Zustand: method
        console.log(response);
        signIn({
          payload: response.data.payload,
          token: response.data.token,
          employeeInfo: response.data.employeeInfo,
        });
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
      <h3 style={{ textAlign: "center" }}>Login</h3>
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
          {...PropsFormItemEmail}
          rules={[
            ...PropsFormItemEmail.rules,
            {
              required: true,
              message: "Vui lòng nhập email",
            },
          ]}
          hasFeedback
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          {...PropsFormItem_Label_Name({
            label: "Mật khẩu",
            name: "password",
          })}
          rules={[
            {
              required: true,
              message: "Please nhập mật khẩu!",
            },
            {
              pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
              message:
                "Mật khẩu có ít nhất 8 kí tự bao gồm ít nhất một chữ thường, một chữ in hoa và một chữ số",
            },
          ]}
          hasFeedback
        >
          <Input.Password />
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
