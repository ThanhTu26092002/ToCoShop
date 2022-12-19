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
import {
    useNavigate,
  } from "react-router-dom";
//  import useCheckout from '../../../hooks/useCheckout'
function CartDetail1() {
    const {add}=useCheckout((state)=>state)
    const navigate = useNavigate();
    const [formContactInfo] = Form.useForm();
   const handleFinishCreate=(values)=>{
        console.log("values",values)
         add({contactInfo:values})
         navigate(
            `/Thanhtoan2`
          );
   }
   const handleOk = () => {
    formContactInfo.submit();
  };
  return (
    <div className="main_Cartdetall">
      <Slider />
      <div className="Cartdetall_body">
        <div className="Cartdetall_title">
          <h1>Thông Tin Giỏ Hàng</h1>
        </div>
        <div className="Cartdetall_form">
          <h2>Thông tin người đặt hàng:</h2>
          <div className="Cartdetall_form_main">
            <Form
            form={formContactInfo}
            
              style={{ marginLeft: 100 }}
              //{...PropsForm}
             // form={formCreate}
              name="formContactInfo"
              onFinish={handleFinishCreate}
              onFinishFailed={() => {
                console.error("Error at onFinishFailed at formCreate");
              }}
              
            >
              <Form.Item name="firstNameContactInfo" className="a" label="Họ:">
                <Input style={{ marginLeft: 57 }} placeholder="Họ" />
              </Form.Item>
              <Form.Item name="lastNameContactInfo" className="a" label="Tên:">
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
                <Cascader
                  style={{ width: 300, marginLeft: 27 }}
                  placeholder="Please select"
                />
              </Form.Item>
              <Form.Item name="stateContactInfo" className="a" label="Tỉnh:">
                <Cascader
                  style={{ width: 300, marginLeft: 57 }}
                  placeholder="Please select"
                />
              </Form.Item>
              <Form.Item
                name="cityContactInfo"
                className="a"
                label="Quận/huyện:"
              >
                <Cascader
                  style={{ width: 300, marginLeft: 8 }}
                  placeholder="Please select"
                />
              </Form.Item>
              <Form.Item
                name="detailAddressContactInfo"
                className="a"
                label="Địa chỉ:"
              >
                <Input style={{ marginLeft: 37 }} placeholder="Địa chỉ" />
              </Form.Item>
              
            </Form>
          </div>
        </div>
        <div className="Cartdetallbtn">
          
          
          <button onClick={handleOk}>Tiếp tục<DoubleRightOutlined /></button>
        </div>
      </div>
      <Footer amount1={8}></Footer>
    </div>
  );
}

export default CartDetail1;
