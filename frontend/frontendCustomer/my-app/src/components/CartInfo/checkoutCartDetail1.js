import React,{useEffect,useState} from 'react'
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
  function checkoutCartdetail1({handleFinishCreate,formContactInfo ,countryList}) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [statesListContactInfo, setStatesListContactInfo] = useState(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [cityListContactInfo, setCityListContactInfo] = useState(null);
    
  return (
    <div>
        <div className="Cartdetall_form">
            <h2>Thông tin người đặt hàng:</h2>
            <div className="Cartdetall_form_main">
              <Form
                form={formContactInfo}
                style={{ marginLeft: 100 }}
                name="formContactInfo"
                onFinish={handleFinishCreate}
                onFinishFailed={() => {
                  console.error("Error at onFinishFailed at formCreate");
                }}
              >
                <Form.Item
                  name="firstNameContactInfo"
                  className="a"
                  label="Họ:"
                >
                  <Input style={{ marginLeft: 57 }} placeholder="Họ" />
                </Form.Item>
                <Form.Item
                  name="lastNameContactInfo"
                  className="a"
                  label="Tên:"
                >
                  <Input style={{ marginLeft: 57 }} placeholder="Tên" />
                </Form.Item>
                <Form.Item name="emailContactInfo" className="a" label="Email:">
                  <Input style={{ marginLeft: 47 }} placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="phoneNumberContactInfo"
                  className="a"
                  label="Số điện thoại:"
                >
                  <Input placeholder="Số điện thoại" />
                </Form.Item>
                <Form.Item
                  name="countryContactInfo"
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
                <Form.Item name="stateContactInfo" className="a" label="Tỉnh:">
                  <Select
                    style={{ width: 150 }}
                    placeholder="Chọn..."
                    onChange={(value) => {
                      setCityListContactInfo(
                        statesListContactInfo.states.find(
                          (e) => e.name === value
                        )
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
                  name="cityContactInfo"
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
                  name="detailAddressContactInfo"
                  className="a"
                  label="Địa chỉ:"
                >
                  <Input style={{ marginLeft: 37 }} placeholder="Địa chỉ" />
                </Form.Item>
                <div className="Cartdetallbtn">
            <button
            type='submit'
            >
              Tiếp tục
              <DoubleRightOutlined />
            </button>
          </div>
              </Form>
            </div>
          </div>
          
    </div>
  )
}

export default checkoutCartdetail1