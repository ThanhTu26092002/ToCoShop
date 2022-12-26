import React,{useEffect, useState,useRef} from 'react'
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
  import axios  from 'axios'
  import numeral from "numeral";
import { PropsFormItem_Label_Name } from '../../config/props';
  
function checkoutCartDetail3({handleFinishCreate,previousfunc,info,formOtherInfo}) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
  const[transportations,setTransportations] = useState(null)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    axios.get("http://localhost:9000/v1/transportations").then((response) => {
      setTransportations(response.data.results);
      console.log("transportations",response.data.results)
    });
  }, []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formRef = useRef()
  return (
    <div>
        <div className="Cartdetall3_form">
            <h2>Thanh toán:</h2>
            <div className="Cartdetall3_form_main">
              <Form style={{ marginLeft: 100 }}
               form={formOtherInfo}
               ref={formRef}
               initialValues={{paymentMethod:'COD'}}
              >
                
                <Form.Item
                {...PropsFormItem_Label_Name({
                  labelTitle: "Phương tiện vận chuyển",
                  nameTitle: "transportationPrice",
                  require: true,
                })}
              >
                <Input
                  style={{ width: 400 }}
                  disabled
                  addonAfter={"VNĐ"}
                  addonBefore={
                    <Form.Item
                      {...PropsFormItem_Label_Name({
                        labelTitle: "Phương tiện vận chuyển",
                        nameTitle: "transportationId",
                        require: true,
                      })}
                      noStyle
                    >
                      <Select
                        style={{ width: 250 }}
                        loading={!transportations}
                        placeholder="Chọn"
                        onChange={(value) => {
                          const found = transportations.find(
                            (e) => e._id === value
                          );
                          console.log("found",found)
                          const priceText = numeral(found.price).format("0,0");
                          console.log("test type:", typeof Number(priceText));
                          formOtherInfo.setFieldsValue({
                            transportationPrice: priceText,
                          });
                        }}
                      >
                        {transportations &&
                          transportations.map((t) => {
                            const customPrice = numeral(t.price).format("0,0");
                            return (
                              <Select.Option key={t._id} value={t._id}>
                                {`${t.name}`}
                              </Select.Option>
                            );
                          })}
                      </Select>
                    </Form.Item>
                  }
                />
              </Form.Item>
                <Form.Item className="a" name="paymentMethod" label="Phương thức thanh toán:">
                  <Select
                    style={{ width: 600, marginLeft: 27 }}
                    placeholder="Chọn..."
                    options={[
                      {
                        value: 'COD',
                        label: 'COD',
                      }
                    ]}
                    disabled={true}
                  >
                  </Select>
                </Form.Item>
              </Form>
            </div>
          </div>
          <div className="Cartdetall3_form_main">
          <div className="Cartdetall3btn">
          <img src='' alt=''></img>
            <p>Tên sản phẩm: // Size: // Màu: //Số lượng: //Giảm giá: //Đơn giá: //Thành tiền:</p>
            <button
              onClick={
                previousfunc
              }
            >
              <DoubleLeftOutlined />
            </button>
            <button onClick={()=>{
              let tmp=formOtherInfo.getFieldsValue()
              return handleFinishCreate(tmp)
            }}>dat hang</button>
          </div>
          </div>
    </div>
  )
}

export default checkoutCartDetail3