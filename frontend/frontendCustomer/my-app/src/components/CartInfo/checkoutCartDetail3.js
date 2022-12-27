import React, { useEffect, useState, useRef } from "react";
import { DoubleLeftOutlined } from "@ant-design/icons";
import { Form, Input, Select } from "antd";
import axios from "axios";
import numeral from "numeral";
import { PropsFormItem_Label_Name } from "../../config/props";
import Receipt from "../../components/receiptdetail/index";
import { useCart } from "../../hooks/useCart";

function checkoutCartDetail3({
  handleFinishCreate,
  previousfunc,
  info,
  formOtherInfo,
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [transportations, setTransportations] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    axios.get("http://localhost:9000/v1/transportations").then((response) => {
      setTransportations(response.data.results);
      console.log("transportations", response.data.results);
    });
  }, []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formRef = useRef();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { items, remove, increase, decrease } = useCart((state) => state);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [shippingCost, setShippingcost] = useState(0);
  let totalmoney = null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [totalMoneyreceipt, setTotalMoneyreceipt] = useState(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [totalMoneyreceiptShow, setTotalMoneyreceiptShow] = useState(false);
  return (
    <div>
      <div className="Cartdetall3_form">
        <h2>Thanh toán:</h2>
        <div className="Cartdetall3_form_main">
          <Form
            style={{ marginLeft: 100 }}
            form={formOtherInfo}
            ref={formRef}
            initialValues={{ paymentMethod: "COD" }}
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
                        console.log("found", found);
                        const priceText = numeral(found.price).format("0,0");
                        console.log("test type:", typeof Number(priceText));
                        formOtherInfo.setFieldsValue({
                          transportationPrice: priceText,
                        });

                        setShippingcost(priceText);

                        const total = found.price + totalmoney;

                        setTotalMoneyreceipt(total);
                        setTotalMoneyreceiptShow(true)
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
            <Form.Item
              className="a"
              {...PropsFormItem_Label_Name({
                labelTitle: "Phương thức thanh toán",
                nameTitle: "paymentMethod",
                require: true,
              })}
            >
              <Select
                style={{ width: 200 }}
                placeholder="Chọn..."
                options={[
                  {
                    value: "COD",
                    label: "COD",
                  },
                ]}
                disabled={true}
              ></Select>
            </Form.Item>
          </Form>
        </div>
      </div>
      <div className="Cartdetall3_form_main bodernone">
        <h2>Đơn hàng của bạn là: </h2>
        <nav className="nav_Cartdetall3">
          {/* <Receipt/>
           <Receipt/>
           <Receipt/> */}
          {items.map((i, index) => {
            let attributesItem = null;
            i.product.attributes.map((e) => {
              if (e._id === i.attributeId) {
                attributesItem = e;
                totalmoney +=
                  Number(attributesItem.totalPriceEachType) *
                  Number(i.quantity);
              }
            });
            return (
              <div key={items._id}>
                <Receipt items={i} />
              </div>
            );
          })}
        </nav>
      </div>
      <div className="Cartdetall3_price">
        <span>Tạm tính: {numeral(totalmoney).format("0,0")} VNĐ </span>
        <span>Vận chuyển: {numeral(shippingCost).format("0,0")} VNĐ</span>
        {totalMoneyreceiptShow&&<span>Tổng tiền: {numeral(totalMoneyreceipt).format("0,0")} VNĐ</span>}
      </div>
      <div className="Cartdetall3btn ">
        <button onClick={previousfunc}>
          <DoubleLeftOutlined />
        </button>
        <button
          onClick={() => {
            let tmp = formOtherInfo.getFieldsValue();
            return handleFinishCreate(tmp);
          }}
        >
          Xác nhận đặt hàng
        </button>
      </div>
    </div>
  );
}

export default checkoutCartDetail3;
