import React from "react";
import { Button, Form, Input, Space, Select, Radio } from "antd";
import {
  PropsForm,
  PropsFormItemEmail,
  PropsFormItem_Label_Name,
} from "../../../config/props";
function CustomFormLogin({ form, handleFinish, handleCancel, loadingBtn }) {
  const optionspromotion = [];
  optionspromotion.push(
    {
      label: "ADMINISTRATORS",
      value: "ADMINISTRATORS",
    },
    {
      label: " MANAGERS",
      value: "MANAGERS",
    }
  );
  return (
    <Form
      {...PropsForm}
      form={form}
      initialValues={{ status: "ACTIVE", roles: "MANAGERS" }}
      onFinish={handleFinish}
    >
      <Form.Item {...PropsFormItemEmail({ require: true })} hasFeedback>
        <Input placeholder="Email" />
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Mật khẩu",
          nameTitle: "password",
        })}
        rules={[
          {
            required: true,
            message: "Vui lòng nhập mật khẩu!",
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
          labelTitle: "Xác nhận mật khẩu",
          nameTitle: "confirm",
        })}
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Vui lòng xác nhận mật khẩu!",
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
      <Form.Item
        hasFeedback
        {...PropsFormItem_Label_Name({
          labelTitle: "Quyền thao tác",
          nameTitle: "roles",
        })}
        rules={[
          {
            required: true,
            message: "Vui lòng chọn quyền",
          },
        ]}
      >
        <Select
          mode="multiple"
          allowClear
          style={{
            width: "100%",
          }}
          placeholder="Please select"
          options={optionspromotion}
        />
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Trạng thái",
          nameTitle: "status",
        })}
      >
        <Radio.Group>
          <Radio value={"ACTIVE"}>Kích hoạt</Radio>
          <Radio value={"INACTIVE"}>Khóa</Radio>
        </Radio.Group>
      </Form.Item>
      {handleCancel && (
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Space wrap>
            <Button type="primary" danger onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loadingBtn}>
              Tạo mới
            </Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );
}

export default CustomFormLogin;
