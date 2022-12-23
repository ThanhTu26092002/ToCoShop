import React from "react";
import moment from "moment";
import "moment/locale/vi";
import locale from "antd/es/locale/vi_VN";
import { Form, Input, DatePicker } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { dateFormatList } from "../../../config/constants";
import {
  PropsForm,
  PropsFormItemEmail,
  PropsFormItemFirstName,
  PropsFormItemLastName,
  PropsFormItemPhoneNumber,
  PropsFormItem_Label_Name,
  PropsFormItemAddress,
} from "../../../config/props";
function UpdateInfo({ formUpdate, handleFinishUpdate }) {
  const disabledDate = (current) => {
    // Can not select days after 18 years ago
    return current >= moment().add(-18, "year");
  };
  return (
    <Form
      {...PropsForm}
      form={formUpdate}
      name={`${formUpdate}`}
      onFinish={handleFinishUpdate}
      onFinishFailed={() => {
        // message.info("Error at onFinishFailed at formUpdate");
        console.error("Error at onFinishFailed at formUpdate");
      }}
    >
      <Form.Item {...PropsFormItemFirstName}>
        <Input placeholder="First name" />
      </Form.Item>

      <Form.Item {...PropsFormItemLastName}>
        <Input placeholder="Last name" />
      </Form.Item>

      <Form.Item {...PropsFormItemEmail({ require: true })}>
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item {...PropsFormItemPhoneNumber({})}>
        <Input placeholder="Số điện thoại của nhân viên" />
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Ngày sinh",
          nameTitle: "currentBirthday",
        })}
      >
        <DatePicker
          allowClear={false}
          showToday={false}
          disabledDate={disabledDate}
          placeholder="dd/mm/yyyy"
          format={dateFormatList}
          locale={locale}
          renderExtraFooter={() => "Nhân viên đủ 18 tuổi trở lên"}
        />
      </Form.Item>
      <Form.Item {...PropsFormItemAddress({ nameTitle: "address" })}>
        <TextArea rows={3} placeholder="Dia chi nhan vien" />
      </Form.Item>
    </Form>
  );
}

export default UpdateInfo;
