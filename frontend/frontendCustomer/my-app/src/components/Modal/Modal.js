import React from "react";
import "./Modal.css";
import Productcart from "../Productcart/productcart";
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
function Modal({ closeModal }) {
  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <div className="titleCloseBtn">
          <button
            onClick={() => {
                closeModal(false);
            }}
          >
            X
          </button>
        </div>
        <div className="title">
          <p>Thông tin giỏ hàng</p>
        </div>
        <div className="body">
        <nav className="navproductdetall">
        <Productcart/>
        <Productcart/>
        <Productcart/>
        <Productcart/>
        </nav>
          
        </div>
        <div className="footer_modal">
          <div className="footer_modal_price">
            <span>Tổng giá trị đơn hàng:</span>
            <p>2.250.000 VND</p>
          </div>
          <div className="footer_modal_btn">
          <button
            onClick={() => {
                closeModal(false);
            }}
            id="cancelBtn"
          >
            Tiếp tục mua hàng
          </button>
          <button  onClick={() => {
                closeModal(false);
            }}><Link to='/Thanhtoan'>Thanh toán</Link></button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Modal;