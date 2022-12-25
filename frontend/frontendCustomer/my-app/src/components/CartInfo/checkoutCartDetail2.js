import React, { useEffect, useState,useCheckout } from "react";
import {
  DownOutlined,
  UpOutlined,
  RightOutlined,
  DoubleRightOutlined,
  DoubleLeftOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Space,
  Select,
  Layout,
  InputNumber,
  Modal,
  Table,
  notification,
  message,
  Popconfirm,
  Upload,
  Cascader,
  Radio,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
function checkoutCartdetail2({
  handleFinishCreate,
  formShippingInfo,
  previousfunc,
  countryList,
  info
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [statesListContactInfo, setStatesListContactInfo] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  console.log("inotest",info)
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
                   formShippingInfo.setFieldsValue({firstNameShippingInfo:info.contactInfo.firstNameContactInfo,
                       lastNameShippingInfo:info.contactInfo.lastNameContactInfo,
                       emailShippingInfo:info.contactInfo.emailContactInfo,
                       phoneNumberShippingInfo:info.contactInfo.phoneNumberContactInfo,
                       countryShippingInfo:info.contactInfo.countryContactInfo,
                       stateShippingInfo:info.contactInfo.stateContactInfo,
                       cityShippingInfo:info.contactInfo.cityContactInfo,
                       detailAddressShippingInfo:info.contactInfo.detailAddressContactInfo,

                   })
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
            <Form.Item name="firstNameShippingInfo" className="a" label="Họ:">
              <Input style={{ marginLeft: 57 }} placeholder="Họ" />
            </Form.Item>
            <Form.Item name="lastNameShippingInfo" className="a" label="Tên:">
              <Input style={{ marginLeft: 57 }} placeholder="Tên" />
            </Form.Item>
            <Form.Item name="emailShippingInfo" className="a" label="Email:">
              <Input style={{ marginLeft: 47 }} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="phoneNumberShippingInfo"
              className="a"
              label="Số điện thoại:"
            >
              <Input placeholder="Số điện thoại" />
            </Form.Item>
            <Form.Item
              name="countryShippingInfo"
              className="a"
              label="Quốc gia:"
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
            <Form.Item name="stateShippingInfo" className="a" label="Tỉnh:">
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
              name="cityShippingInfo"
              className="a"
              label="Quận/huyện:"
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
              name="detailAddressShippingInfo"
              className="a"
              label="Địa chỉ:"
            >
              <Input style={{ marginLeft: 37 }} placeholder="Địa chỉ" />
            </Form.Item>
            <Form.Item name="note" className="a" label="Ghi chú:">
              <TextArea
                rows={3}
                style={{ marginLeft: 30 }}
                placeholder="Thời gian nhận hàng"
              />
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
