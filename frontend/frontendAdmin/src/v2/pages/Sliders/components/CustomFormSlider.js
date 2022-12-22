import React, { useState } from "react";
import { Input, Form, Radio, Select, Space } from "antd";
import {
  PropsForm,
  PropsFormItemName,
  PropsFormItem_Label_Name,
} from "../../../config/props";
import TextArea from "antd/lib/input/TextArea";
import LabelCustomization from "../../../components/subComponents";
function CustomFormSlider({
  list,
  check,
  form,
  setCheck,
  handleFinishCreate,
  ...props
}) {
  return (
    <>
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
              console.log("get value: true");

              // setSortOrderState(2)
              setCheck(true);
              form.setFieldsValue({ sortOrder: 0 });
            } else {
              console.log("get value:false");

              // setSortOrderState(3)
              // setCheck(false);
              form.setFieldsValue({ sortOrder: 0 });
            }
          }}
        >
          <Radio value={"ACTIVE"}>Hiển thị</Radio>
          <Radio value={"INACTIVE"}>Không hiển thị</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label={<LabelCustomization title={"Thu tu"} />}
        name="sortOrder"
      >
        <Select
          // value={sortOrderState}
          style={{ width: 120 }}
          allowClear
          options={list}
          disabled={check}
        />
      </Form.Item>
    </>
  );
}

export default CustomFormSlider;
