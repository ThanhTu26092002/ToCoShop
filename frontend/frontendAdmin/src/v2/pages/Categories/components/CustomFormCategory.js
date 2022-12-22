import React from 'react'
import {
    Form,
    Input,
  } from "antd";
  import {
    PropsFormItemName,
    PropsFormItem_Label_Name,
  } from "../../../config/props";
import TextArea from 'antd/lib/input/TextArea';
function CustomFormCategory() {
  return (
    <>
        <Form.Item {...PropsFormItemName}>
              <Input placeholder="Tên danh mục mới" />
            </Form.Item>

            <Form.Item {...PropsFormItem_Label_Name({labelTitle: "Mô tả", nameTitle:"description"})}>
              <TextArea rows={3} placeholder="Mô tả danh mục mới" />
            </Form.Item>
    </>
  )
}

export default CustomFormCategory