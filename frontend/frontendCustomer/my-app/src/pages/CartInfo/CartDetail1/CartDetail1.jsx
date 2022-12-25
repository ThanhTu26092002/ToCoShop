import "./CartDetail1.css";
import React, { useState, useEffect } from "react";
import Slider from "../../../components/slide/Slider";
import Images from "../../../components/Listproducts/images";
import Footer from "../../../components/Footer/Footer";
import Search_cart from "../../../components/SearchCart/index";
import axios from "axios";
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
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import { useCheckout } from "../../../hooks/useCheckout";
import { useNavigate } from "react-router-dom";
import TextArea from "antd/lib/input/TextArea";
import CheckoutCartdetail1 from "../../../components/CartInfo/checkoutCartDetail1"
import CheckoutCartdetail2 from "../../../components/CartInfo/checkoutCartDetail2"
import CheckoutCartdetail3 from "../../../components/CartInfo/checkoutCartDetail3"
//  import useCheckout from '../../../hooks/useCheckout'
function CartDetail1() {
  const { info,add } = useCheckout((state) => state);
  // const navigate = useNavigate();
  const [statesListContactInfo, setStatesListContactInfo] = useState(null);
  const [countryList, setCountryList] = useState(null);
  const [cityListContactInfo, setCityListContactInfo] = useState(null);
  const [cartDetail1, setCartDetail1] = useState(true);
  const [cartDetail2, setCartDetail2] = useState(false);
  const [cartDetail3, setCartDetail3] = useState(false);
  const [savedContactInfo, setSavedContactInfo] = useState(null);
  const [savedShippingInfo, setSavedShippingInfo] = useState(null);
  const [savedOtherInfo, setSavedOtherInfo] = useState(null);
  const [formContactInfo] = Form.useForm();
  const [formShippingInfo] = Form.useForm();
  const [formOtherInfo] = Form.useForm();
  // const [formContactInfo] = Form.useForm();
  const handleFinishCreate = (values) => {
    console.log("handle",values)
    setCartDetail1(false)
    setCartDetail2(true)
    setCartDetail3(false)
    setSavedContactInfo(values)
    add({contactInfo:values})
  };
  const handleFinishCreate2 = (values) => {
    setCartDetail1(false)
    setCartDetail2(false)
    setCartDetail3(true)
    add({shippingInfo:values})
    setSavedShippingInfo(values)
  };
  const handleFinishCreat3 = (values) => {
    
    setSavedOtherInfo(values)
  };
  
  
  useEffect(() => {
    fetch("http://localhost:3006/data/countries+states+cities.json")
      .then((response) => response.json())
      .then((data) => setCountryList(data))
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);
  const previousfunc =() => {
    setCartDetail1(true)
    setCartDetail2(false)
    setCartDetail3(false)
  }
  const previousfunc1 =() => {
    setCartDetail1(false)
    setCartDetail2(true)
    setCartDetail3(false)
  }

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
          {cartDetail1 && <CheckoutCartdetail1   handleFinishCreate={handleFinishCreate} formContactInfo={formContactInfo} countryList={countryList} />}
        </div>
        <div
          className="main_body_Cartdetall2"
          style={cartDetail2 ? { display: "block" } : { display: "none" }}
        >
      
        { cartDetail2 &&<CheckoutCartdetail2 previousfunc={previousfunc} formShippingInfo={formShippingInfo} handleFinishCreate={handleFinishCreate2} countryList={countryList} info={info}/>}
        </div>
        <div
          className="main_body_Cartdetall3"
          style={cartDetail3 ? { display: "block" } : { display: "none" }}
        >
          {cartDetail3&&<CheckoutCartdetail3 previousfunc={previousfunc1} handleFinishCreate={handleFinishCreat3} info={info} formOtherInfo={formOtherInfo}/>}

        </div>
      </div>
      <Footer amount1={8}></Footer>
    </div>
  );
}

export default CartDetail1;
