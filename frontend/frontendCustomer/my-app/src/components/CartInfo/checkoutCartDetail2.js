import React, { useState } from "react";
import { DoubleRightOutlined, DoubleLeftOutlined } from "@ant-design/icons";
import {
  PropsFormItemDetailAddress,
  PropsFormItemEmail,
  PropsFormItemFirstName,
  PropsFormItemLastName,
  PropsFormItemPhoneNumber,
  PropsFormItem_Label_Name,
} from "../../config/props";
import { Form, Input, Select } from "antd";
import TextArea from "antd/lib/input/TextArea";
function checkoutCartdetail2({
  handleFinishCreate,
  formShippingInfo,
  previousfunc,
  countryList,
  info,
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [statesListContactInfo, setStatesListContactInfo] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [cityListContactInfo, setCityListContactInfo] = useState(null);
  return (
    <div>
      <div className="Cartdetall2_form">
        <h2>Thông tin người nhận hàng:</h2>
        <form style={{}}>
          <input
            id="check"
            type="checkbox"
            onClick={(e) => {
              if (e.target.checked) {
                formShippingInfo.setFieldsValue({
                  firstNameShippingInfo: info.contactInfo.firstName,
                  lastNameShippingInfo: info.contactInfo.lastName,
                  emailShippingInfo: info.contactInfo.email,
                  phoneNumberShippingInfo: info.contactInfo.phoneNumber,
                  countryShippingInfo: info.contactInfo.address.country,
                  stateShippingInfo: info.contactInfo.address.state,
                  cityShippingInfo: info.contactInfo.address.city,
                  detailAddressShippingInfo:
                    info.contactInfo.address.detailAddress,
                });
                console.log("ok", info.contactInfo);
              }
            }}
          />
          <label htmlFor="check">Bạn là người nhận hàng </label>
        </form>

        <div className="Cartdetall2_form_main">
          <Form
            style={{ marginLeft: 100 }}
            form={formShippingInfo}
            //{...PropsForm}
            // form={formCreate}
            name="formShippingInfo"
            onFinish={handleFinishCreate}
            onFinishFailed={() => {
              console.error("Error at onFinishFailed at formCreate");
            }}
          >
            <Form.Item
              {...PropsFormItemFirstName}
              name="firstNameShippingInfo"
              //  className="a"
            >
              <Input placeholder="Họ" />
            </Form.Item>
            <Form.Item
              {...PropsFormItemLastName}
              name="lastNameShippingInfo"
              //  className="a"
            >
              <Input placeholder="Tên" />
            </Form.Item>
            <Form.Item
              {...PropsFormItemEmail({ nameTitle: "emailShippingInfo" })}
              //  className="a"
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item
              {...PropsFormItemPhoneNumber({
                require: true,
                nameTitle: "phoneNumberShippingInfo",
              })}
              // className="a"
            >
              <Input placeholder="Số điện thoại người nhận" />
            </Form.Item>
            <Form.Item
              {...PropsFormItem_Label_Name({
                labelTitle: "Quốc gia",
                nameTitle: "countryShippingInfo",
              })}
              // className="a"
            >
              <Select
                placeholder="Chọn..."
                style={{ width: 150 }}
                onChange={(value) => {
                  setStatesListContactInfo(
                    countryList.find((e) => e.name === value)
                  );
                  formShippingInfo.setFieldsValue({
                    stateContactInfo: null,
                    cityContactInfo: null,
                  });
                }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={
                  countryList &&
                  countryList.map((e) => {
                    const tmp = { value: e.name, label: e.name };
                    return tmp;
                  })
                }
              />
            </Form.Item>
            <Form.Item
              {...PropsFormItem_Label_Name({
                labelTitle: "Tỉnh",
                nameTitle: "stateShippingInfo",
              })}
              // className="a"
            >
              <Select
                style={{ width: 150 }}
                placeholder="Chọn..."
                onChange={(value) => {
                  setCityListContactInfo(
                    statesListContactInfo.states.find((e) => e.name === value)
                  );
                  formShippingInfo.setFieldsValue({ cityContactInfo: null });
                }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={
                  statesListContactInfo &&
                  statesListContactInfo.states.map((e) => {
                    const tmp = { value: e.name, label: e.name };
                    return tmp;
                  })
                }
              />
            </Form.Item>
            <Form.Item
              {...PropsFormItem_Label_Name({
                labelTitle: "Thành phố/ Huyện",
                nameTitle: "cityShippingInfo",
              })}
              // className="a"
            >
              <Select
                placeholder="Chọn..."
                style={{ width: 150 }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={
                  cityListContactInfo &&
                  cityListContactInfo.cities.map((e) => {
                    const tmp = { value: e.name, label: e.name };
                    return tmp;
                  })
                }
              />
            </Form.Item>
            <Form.Item
              {...PropsFormItemDetailAddress({
                nameTitle: "detailAddressShippingInfo",
              })}
              // className="a"
            >
              <Input placeholder="Địa chỉ người nhận hàng" />
            </Form.Item>
            <Form.Item
              {...PropsFormItem_Label_Name({
                labelTitle: "Ghi chú",
                nameTitle: "note",
              })}
              //  className="a"
            >
              <TextArea rows={3} placeholder="Thời gian nhận hàng" />
            </Form.Item>
            <div className="Cartdetall2btn">
              <button onClick={previousfunc}>
                <DoubleLeftOutlined />
              </button>
              <button type="submit">
                Tiếp tục <DoubleRightOutlined />
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default checkoutCartdetail2;
