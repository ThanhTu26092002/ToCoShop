import { Form, Input } from "antd";
import React from "react";
import { PropsForm, PropsFormItem_Label_Name } from "../../../config/props";

function UpdatePassword({
  formUpdatePassword,
  handleFinishUpdatePassword,
  savedPassword,
}) {
  return (
    <Form
      {...PropsForm}
      form={formUpdatePassword}
      name={`${formUpdatePassword}`}
      onFinish={handleFinishUpdatePassword}
      onFinishFailed={() => {
        // message.info("Error at onFinishFailed at formUpdate");
        console.error("Error at onFinishFailed at formUpdatePassword");
      }}
    >
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Mật khẩu cũ",
          nameTitle: "oldPassword",
        })}
        rules={[
          {
            required: true,
            message: "Vui lòng nhập mật khẩu hiện tại!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || savedPassword === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Mật khẩu cũ không đúng!"));
            },
          }),
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Mật khẩu mới",
          nameTitle: "password",
        })}
        rules={[
          {
            required: true,
            message: "Vui lòng nhập mật khẩu mới!",
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

      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Xác nhận mật khẩu mới",
          nameTitle: "confirm",
        })}
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Vui lòng xác nhận mật khẩu mới!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Không khớp hai mật khẩu!"));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
    </Form>
  );
}

export default UpdatePassword;
