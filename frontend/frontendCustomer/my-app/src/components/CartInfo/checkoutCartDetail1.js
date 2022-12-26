import React, { useState } from "react";
import {

  DoubleRightOutlined,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Select,
} from "antd";
import {
  PropsForm,
  PropsFormItemDetailAddress,
  PropsFormItemEmail,
  PropsFormItemFirstName,
  PropsFormItemLastName,
  PropsFormItemPhoneNumber,
  PropsFormItem_Label_Name,
} from "../../config/props";
function checkoutCartdetail1({
  handleFinishCreate,
  formContactInfo,
  countryList,
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [statesListContactInfo, setStatesListContactInfo] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [cityListContactInfo, setCityListContactInfo] = useState(null);

  return (
    <div>
      <div className="Cartdetall_form">
        <h2>Thông tin người đặt hàng:</h2>
        <div className="Cartdetall_form_main">
          <Form
            form={formContactInfo}
            // style={{ marginLeft: 100 }}
            {...PropsForm}
            name="formContactInfo"
            onFinish={handleFinishCreate}
            onFinishFailed={() => {
              console.error("Error at onFinishFailed ");
            }}
          >
            <Form.Item {...PropsFormItemFirstName} name="firstNameContactInfo">
              <Input placeholder="Họ" />
            </Form.Item>
            <Form.Item {...PropsFormItemLastName} name="lastNameContactInfo">
              <Input placeholder="Tên" />
            </Form.Item>
            <Form.Item
              {...PropsFormItemEmail({ nameTitle: "emailContactInfo" })}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item
              {...PropsFormItemPhoneNumber({
                nameTitle: "phoneNumberContactInfo",
                require: true,
              })}
            >
              <Input placeholder="Số điện thoại của người đặt hàng" />
            </Form.Item>

            <Form.Item
              {...PropsFormItem_Label_Name({
                labelTitle: "Quốc gia",
                nameTitle: "countryContactInfo",
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
                  formContactInfo.setFieldsValue({
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
                nameTitle: "stateContactInfo",
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
                  formContactInfo.setFieldsValue({ cityContactInfo: null });
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
                nameTitle: "cityContactInfo",
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
                nameTitle: "detailAddressContactInfo",
              })}
              // className="a"
            >
              <Input placeholder="Địa chỉ cụ thể" />
            </Form.Item>
            <div className="Cartdetallbtn">
              <button type="submit">
                Tiếp tục
                <DoubleRightOutlined />
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default checkoutCartdetail1;
