import React, { useState } from "react";
import { Input, Form, Radio, Select, Space, Button } from "antd";
import {
  PropsForm,
  PropsFormItemName,
  PropsFormItem_Label_Name,
} from "../../../config/props";
import TextArea from "antd/lib/input/TextArea";
function CustomFormSlider({
  form,
  handleFinish,
  handleCancel,
  loadingBtn,
  list,
}) {
  const [check, setCheck] = useState(false);
  // if(selectedRecord){
  //   if (selectedRecord.status === "INACTIVE") {
  //     setCheck(true);
  //   } else {
  //     setCheck(false);
  //   }
  // }

  return (
    <Form
      {...PropsForm}
      form={form}
      initialValues={{
        title: "",
        description: "",
      }}
      onFinish={handleFinish}
    >
      <Form.Item
        {...PropsFormItemName({
          labelTitle: "Tiêu đề",
          nameTitle: "title",
          max: 500,
        })}
      >
        <Input placeholder="Tiêu đề" />
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Mô tả",
          nameTitle: "description",
        })}
      >
        <TextArea rows={3} placeholder="Mô tả" />
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Trạng thái",
          nameTitle: "status",
        })}
        rules={[
          {
            required: true,
            message: "Vui lòng chọn trạng thái",
          },
        ]}
      >
        <Radio.Group
          onChange={(e) => {
            if (e.target.value === "INACTIVE") {
              setCheck(true);
              form.setFieldsValue({ sortOrder: 0 });
            } else {
              setCheck(false);
              form.setFieldsValue({ sortOrder: 0 });
            }
          }}
        >
          <Radio value={"ACTIVE"}>Hiển thị</Radio>
          <Radio value={"INACTIVE"}>Không hiển thị</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
      {...PropsFormItem_Label_Name({
        labelTitle:"Thứ tự" , nameTitle:"sortOrder"
      })}
        rules={[
          {
            required: true,
            message: "Vui lòng chọn trạng thái",
          },
        ]}
      >
        <Select
          style={{ width: 120 }}
          allowClear
          options={list}
          disabled={check}
        />
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

export default CustomFormSlider;
