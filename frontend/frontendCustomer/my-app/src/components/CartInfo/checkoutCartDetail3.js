import React, { useEffect, useState, useRef } from "react";
import { DoubleLeftOutlined } from "@ant-design/icons";
import styles from "./checkoutCartDetail3.module.css";
import { Form, Input, Select } from "antd";
import axios from "axios";
import numeral from "numeral";
import { PropsForm, PropsFormItem_Label_Name } from "../../config/props";
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
    axios
      .get("https://tococlothes.onrender.com/v1/transportations")
      .then((response) => {
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
      <div className={styles.cartDetail}>
        <h2>Thanh toán:</h2>
        <div className={styles.cartDetail_main}>
          <Form
            form={formOtherInfo}
            {...PropsForm}
            ref={formRef}
            initialValues={{ paymentMethod: "COD" }}
          >
            <div className={styles.transporation}>
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
                          setTotalMoneyreceiptShow(true);
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
            </div>
            <div className={styles.transporationUI_Iphone}>
              <Form.Item
                {...PropsFormItem_Label_Name({
                  labelTitle: "Phương tiện vận chuyển",
                  nameTitle: "transportationId",
                  require: true,
                })}
              >
                <Select
                  loading={!transportations}
                  placeholder="Chọn"
                  onChange={(value) => {
                    const found = transportations.find((e) => e._id === value);
                    console.log("found", found);
                    const priceText = numeral(found.price).format("0,0");
                    console.log("test type:", typeof Number(priceText));
                    formOtherInfo.setFieldsValue({
                      transportationPrice: priceText,
                    });

                    setShippingcost(priceText);

                    const total = found.price + totalmoney;

                    setTotalMoneyreceipt(total);
                    setTotalMoneyreceiptShow(true);
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
              <Form.Item
                {...PropsFormItem_Label_Name({
                  labelTitle: "Giá vận chuyển",
                  nameTitle: "transportationPrice",
                })}
              >
                <Input disabled addonAfter={"VNĐ"} />
              </Form.Item>
            </div>
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
        {totalMoneyreceiptShow && (
          <span>Tổng tiền: {numeral(totalMoneyreceipt).format("0,0")} VNĐ</span>
        )}
      </div>
      <div className="Cartdetall3btn ">
        <div className={styles.btnPre}>
          <button onClick={previousfunc}>
            <DoubleLeftOutlined />
          </button>
        </div>
        <div className={styles.btnSubmit}>
          <button
            onClick={() => {
              let tmp = formOtherInfo.getFieldsValue();
              return handleFinishCreate(tmp);
            }}
          >
            Xác nhận đặt hàng
          </button>
        </div>

        <div
          className={styles.btnSubmitIphone}
        >
          <div className="Cartdetallbtn ">
            <button  style={{ backgroundColor: "cornflowerblue", fontWeight: 700 }}
              onClick={() => {
                let tmp = formOtherInfo.getFieldsValue();
                return handleFinishCreate(tmp);
              }}
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default checkoutCartDetail3;
