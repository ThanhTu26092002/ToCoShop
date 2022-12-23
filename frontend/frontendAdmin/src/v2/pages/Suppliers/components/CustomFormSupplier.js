import React from "react";
import { Button, Form, Input, Space } from "antd";
import {
  PropsForm,
  PropsFormItemAddress,
  PropsFormItemEmail,
  PropsFormItemName,
  PropsFormItemPhoneNumber,
} from "../../../config/props";
import TextArea from "antd/lib/input/TextArea";

function CustomFormSupplier({ form, handleFinish, handleCancel, loadingBtn }) {
  return (
    <Form
      {...PropsForm}
      form={form}
      name={form}
      onFinish={handleFinish}
      onFinishFailed={() => {
        console.error("Error at onFinishFailed at formCreate");
      }}
    >
      <Form.Item
        {...PropsFormItemName({
          lableTitle: "Tên nhà phân phối",
          nameTitle: "name",
          max: 100,
        })}
      >
        <Input placeholder="Tên nhà phân phối mới" />
      </Form.Item>

      <Form.Item {...PropsFormItemEmail({ require: true })}>
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item {...PropsFormItemPhoneNumber({})}>
        <Input placeholder="Số điện thoại của nhà phân phối" />
      </Form.Item>

      <Form.Item {...PropsFormItemAddress({ nameTitle: "address" })}>
        <TextArea rows={3} placeholder="Địa chỉ của nhà phân phối" />
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

export default CustomFormSupplier;
