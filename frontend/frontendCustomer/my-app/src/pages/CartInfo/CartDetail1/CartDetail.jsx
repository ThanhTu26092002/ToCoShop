import "./CartDetail.css";
import React, { useState, useEffect } from "react";
import Slider from "../../../components/slide/Slider";
import Footer from "../../../components/Footer/Footer";
import axios from "axios";
import { Form, notification, message } from "antd";
import { useCheckout } from "../../../hooks/useCheckout";
import CheckoutCartdetail1 from "../../../components/CartInfo/checkoutCartDetail1";
import CheckoutCartdetail2 from "../../../components/CartInfo/checkoutCartDetail2";
import CheckoutCartdetail3 from "../../../components/CartInfo/checkoutCartDetail3";
import numeral from "numeral";
import moment from "moment";
import { useCart } from "../../../hooks/useCart";
import { useNavigate } from "react-router-dom";

//  import useCheckout from '../../../hooks/useCheckout'
function CartDetail1() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();

  const { info, add, remove } = useCheckout((state) => state);
  const { removeAll } = useCart((state) => state);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { items } = useCart((state) => state);
  if (items.length === 0) {
    navigate("/");
  }
  const [countryList, setCountryList] = useState(null);
  const [cartDetail1, setCartDetail1] = useState(true);
  const [cartDetail2, setCartDetail2] = useState(false);
  const [cartDetail3, setCartDetail3] = useState(false);
  const [savedContactInfo, setSavedContactInfo] = useState(null);
  const [savedShippingInfo, setSavedShippingInfo] = useState(null);
  const [savedOtherInfo, setSavedOtherInfo] = useState(null);
  const [historyInfo, setHistoryInfo] = useState(null);
  const [formContactInfo] = Form.useForm();
  const [formShippingInfo] = Form.useForm();
  const [formOtherInfo] = Form.useForm();

  const orderDetails = [];
  items.map((i) => {
    i.product.attributes.map((j) => {
      if (i.attributeId === j._id) {
        let itemAttribute = {
          price: j.price,
          discount: j.discount,
          productAttributeId: j._id,
          quantity: i.quantity,
          productName: i.product.name,
          color: j.color,
          size: j.size,
        };
        orderDetails.push(itemAttribute);
      }
    });

    return;
  });
  const customCreateAHandler = (firstName, lastName) => {
    const userName = "Khách hàng: " + firstName + " " + lastName;
    const currentTime = moment().format("DD-MM-YYY- HH:mm");
    const action = `Thời gian: ${currentTime} : Đặt hàng online`;
    const handler = { userName, action };
    return handler;
  };

  const handleFinishCreate = (values) => {
    setCartDetail1(false);
    setCartDetail2(true);
    setCartDetail3(false);
    setSavedContactInfo(values);
    const datacontactinfo = {
      firstName: values.firstNameContactInfo,
      lastName: values.lastNameContactInfo,
      phoneNumber: values.phoneNumberContactInfo,
      email: values.emailContactInfo,
      address: {
        country: values.countryContactInfo,
        state: values.stateContactInfo,
        city: values.cityContactInfo,
        detailAddress: values.detailAddressContactInfo,
      },
    };
    add({ contactInfo: datacontactinfo });
    setHistoryInfo(
      customCreateAHandler(
        values.firstNameContactInfo,
        values.lastNameContactInfo
      )
    );
  };

  const handleFinishCreate2 = (values) => {
    setCartDetail1(false);
    setCartDetail2(false);
    setCartDetail3(true);
    setSavedShippingInfo(values);
    const datashippinginfo = {
      firstName: values.firstNameShippingInfo,
      lastName: values.lastNameShippingInfo,
      phoneNumber: values.phoneNumberShippingInfo,
      email: values.emailShippingInfo,
      address: {
        country: values.countryShippingInfo,
        state: values.stateShippingInfo,
        city: values.cityShippingInfo,
        detailAddress: values.detailAddressShippingInfo,
      },
      note: values.note,
    };
    add({ shippingInfo: datashippinginfo });
    // console.log("datashippinginfo",dataShippingInfo)
  };
  const handleFinishCreat3 = (values) => {
    setSavedOtherInfo(values);
    let datashippinginfo2 = info.shippingInfo;
    datashippinginfo2 = {
      ...datashippinginfo2,
      transportationId: values.transportationId,
      transportationPrice: numeral(values.transportationPrice).value(),
    };
    add({ shippingInfo: datashippinginfo2 });
    const paymentInfo = {
      paymentMethod: values.paymentMethod,
    };
    add({ paymentInfo: paymentInfo });
    let newOrderinfo = {
      contactInfo: info.contactInfo,
      // shippingInfo: info.shippingInfo,
      shippingInfo: datashippinginfo2,
      orderDetails: orderDetails,
      handlers: historyInfo,
    };
    console.log("newOrderinfo", newOrderinfo);
    axios
      .post(`http://localhost:9000/v1/orders/insertOne`, newOrderinfo)
      .then((response) => {
        if (response.status === 201) {
          notification.info({
            message: "Thông báo",
            description:
              "Bạn đã tạo đơn hàng thành công. Cửa hàng sẽ nhanh chóng liên hệ với bạn!",
          });
          setTimeout(() => {
            remove();
            removeAll();
            navigate("/");
          }, 3000);
          return;
        }
      })
      .catch((error) => {
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
      });
  };
  // console.log("paymentInfo",info.paymentInfo)

  useEffect(() => {
    fetch("http://localhost:3006/data/countries+states+cities.json")
      .then((response) => response.json())
      .then((data) => setCountryList(data))
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);
  const previousfunc = () => {
    setCartDetail1(true);
    setCartDetail2(false);
    setCartDetail3(false);
  };
  const previousfunc1 = () => {
    setCartDetail1(false);
    setCartDetail2(true);
    setCartDetail3(false);
  };

  return (
    <div className="main_Cartdetall">
      <Slider />
      <div className="Cartdetall_body">
        <div className="Cartdetall_title">
          <h1>Thông Tin Giỏ Hàng</h1>
        </div>
        <div
          className="main_body_Cartdetall1"
          style={cartDetail1 ? { display: "block" } : { display: "none" }}
        >
          {cartDetail1 && (
            <CheckoutCartdetail1
              handleFinishCreate={handleFinishCreate}
              formContactInfo={formContactInfo}
              countryList={countryList}
            />
          )}
        </div>
        <div
          className="main_body_Cartdetall2"
          style={cartDetail2 ? { display: "block" } : { display: "none" }}
        >
          {cartDetail2 && (
            <CheckoutCartdetail2
              previousfunc={previousfunc}
              formShippingInfo={formShippingInfo}
              handleFinishCreate={handleFinishCreate2}
              countryList={countryList}
              info={info}
            />
          )}
        </div>
        <div
          className="main_body_Cartdetall3"
          style={cartDetail3 ? { display: "block" } : { display: "none" }}
        >
          {cartDetail3 && (
            <CheckoutCartdetail3
              previousfunc={previousfunc1}
              handleFinishCreate={handleFinishCreat3}
              info={info}
              formOtherInfo={formOtherInfo}
            />
          )}
        </div>
      </div>
      <Footer amount1={8}></Footer>
    </div>
  );
}

export default CartDetail1;
