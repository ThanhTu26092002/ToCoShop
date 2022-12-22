import React from "react";
import { Form, Input } from "antd";
import {
  PropsFormItemAddress,
  PropsFormItemEmail,
  PropsFormItemName,
  PropsFormItemPhoneNumber,
} from "../../../config/props";
import TextArea from "antd/lib/input/TextArea";

function CustomFormSupplier() {
  return (
    <>
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

      <Form.Item
        {...PropsFormItemPhoneNumber({})}
      >
        <Input placeholder="Số điện thoại của nhà phân phối" />
      </Form.Item>

      <Form.Item {...PropsFormItemAddress({ nameTitle: "address" })}>
        <TextArea rows={3} placeholder="Địa chỉ của nhà phân phối" />
      </Form.Item>
    </>
  );
}

export default CustomFormSupplier;
