import { Form, Input, InputNumber, Space, Button } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React from "react";
import { formatterNumber } from "../../../config/helperFuncs";
import {
  PropsForm,
  PropsFormItemEmail,
  PropsFormItemName,
  PropsFormItemPhoneNumber,
  PropsFormItem_Label_Name,
} from "../../../config/props";
function CustomFormTransportation({
  form,
  loadingBtn,
  handleFinish,
  handleCancel,
}) {
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
      <>
        <Form.Item
          {...PropsFormItemName({
            labelTitle: "Tên phương thức ",
            nameTitle: "name",
          })}
        >
          <Input placeholder="Tên phương thức " />
        </Form.Item>
        <Form.Item
          {...PropsFormItem_Label_Name({
            labelTitle: `Giá tiền`,
            nameTitle: "price",
          })}
          rules={[
            {
              required: true,
              message: "Chưa nhập giá vận chuyển",
            },
          ]}
          hasFeedback
        >
          <InputNumber
            defaultValue={0}
            // formatter={formatterNumber}
            // formatter={formatNumberWithThousandSeparatorAndTwoDecimalPlaces}
            formatter={value => `${value}`.replace(new RegExp(/\B(?=(\d{3})+(?!\d))/g), ',')}
    // parser={value => value.replace(new RegExp(/\$\s?|(,*)/g), '')}
            style={{ minWidth: 120, maxWidth: 360 }}
            min={0}
            addonAfter="VNĐ"
          />
        </Form.Item>
        <Form.Item
          {...PropsFormItemName({
            labelTitle: "Tên công ty vận chuyển",
            nameTitle: "companyName",
          })}
          hasFeedback
        >
          <Input placeholder="Tên công ty vận chuyển" />
        </Form.Item>
        <Form.Item
          {...PropsFormItemPhoneNumber({
            require: true,
            labelTitle: "Số điện thoại công ty",
            nameTitle: "companyPhoneNumber",
          })}
          hasFeedback
        >
          <Input placeholder="Số điện thoại công ty vận chuyển" />
        </Form.Item>
        <Form.Item
          {...PropsFormItemEmail({
            nameTitle: "companyEmail",
            labelTitle: "Email công ty",
          })}
          hasFeedback
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          {...PropsFormItem_Label_Name({
            labelTitle: "Ghi chú",
            nameTitle: "note",
          })}
          rules={[{ max: 200, message: "Ghi chú không thể quá 200 kí tự" }]}
          hasFeedback
        >
          <TextArea rows={3} placeholder="Ghi chú..." />
        </Form.Item>
      </>
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

export default CustomFormTransportation;
