import React from "react";
import moment from "moment";
import "moment/locale/vi";
import locale from "antd/es/locale/vi_VN";
import { genderList } from "../../../config/constants";

import { Button, Form, Input, DatePicker, Select, Space } from "antd";
import {
  PropsForm,
  PropsFormItemAddress,
  PropsFormItemEmail,
  PropsFormItemFirstName,
  PropsFormItemLastName,
  PropsFormItemPhoneNumber,
  PropsFormItem_Label_Name,
} from "../../../config/props";
import { dateFormatList } from "../../../config/constants";
import TextArea from "antd/lib/input/TextArea";

function CustomFormEmployee({ form, handleFinish, handleCancel, loadingBtn }) {
  const disabledDate = (current) => {
    // Can not select days after 18 years ago
    return current >= moment().add(-18, "year");
  };
  return (
    <Form
      {...PropsForm}
      form={form}
      name={`${form}`}
      onFinish={handleFinish}
      onFinishFailed={() => {
        // message.info("Error at onFinishFailed at formCreate");
        console.error("Error at onFinishFailed at formCreate");
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
        <Input placeholder="Số điện thoại của nhan vien" />
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Giới tính",
          nameTitle: "gender",
          require: true,
        })}
      >
        <Select
          placeholder="Giới tính"
          style={{
            width: 200,
          }}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={
            genderList &&
            genderList.map((s) => {
              const tmp = {
                value: s,
                label: s,
              };
              return tmp;
            })
          }
        />
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Ngày sinh",
          nameTitle: "birthday",
          require: false,
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
        <TextArea rows={3} placeholder="Địa chỉ nhân viên" />
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

export default CustomFormEmployee;
