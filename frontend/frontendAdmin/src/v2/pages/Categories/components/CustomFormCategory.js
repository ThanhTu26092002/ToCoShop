import React from "react";
import { Form, Input, Space, Button } from "antd";
import {
  PropsForm,
  PropsFormItemName,
  PropsFormItem_Label_Name,
} from "../../../config/props";
import TextArea from "antd/lib/input/TextArea";
function CustomFormCategory({ form, handleFinish, handleCancel, loadingBtn }) {
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
          labelTitle: "Tên danh mục",
          nameTitle: "name",
        })}
      >
        <Input placeholder="Tên danh mục mới" />
      </Form.Item>

      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Mô tả",
          nameTitle: "description",
        })}
      >
        <TextArea rows={3} placeholder="Mô tả danh mục mới" />
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

export default CustomFormCategory;
