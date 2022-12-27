
import React from "react";
import "./Modal.css";
import Productcart from "../Productcart/productcart";
import { useCart } from "../../hooks/useCart";
import numeral from "numeral";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
function Modal({ closeModal }) {
  const { items, remove, increase, decrease } = useCart((state) => state);
  let isEmpty = false;
  if (items.length === 0) {
    console.log("ok");
    isEmpty = true;
  }
  let totalmoney = null;
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
            {isEmpty ? (
              <div className="emptyCart">
                <img style={{width:300, height:300}} 
                 src="emptycart.png" 
                onError={(e) =>
                  (e.target.onerror = null)(
                    (e.target.src = `../../emptycart.png`)
                  )}
                alt=""></img>
              </div>
            ) : (
              items.map((i, index) => {
                let attributesItem = null;
                i.product.attributes.map((e) => {
                  if (e._id === i.attributeId) {
                    console.log("itemsize", e);
                    attributesItem = e;
                    totalmoney +=
                      Number(attributesItem.totalPriceEachType) *
                      Number(i.quantity);
                  }
                });

                console.log("item", attributesItem);
                return (
                  <div key={items._id}>
                    <Productcart items={i} />
                  </div>
                );
              })
            )}
          </nav>
        </div>
        <div className="footer_modal">
       <div className="footer_modal_price">
       {!isEmpty&& <>
            <span>Tổng giá trị đơn hàng:</span>
            <p>{numeral(totalmoney).format("0,0")}VND</p>
            </>}
          </div>
          <div className="footer_modal_btn">
            <button
              onClick={() => {
                closeModal(false);
              }}
              id="cancelBtn"
            >{isEmpty?"Thêm sản phẩm":"Tiếp tục mua hàng"}
            </button>
            {!isEmpty&&<button
              onClick={() => {
                
                closeModal(false);
              }}
            >
              <Link to="/Thanhtoan">Thanh toán</Link>
            </button>}
          </div>
        </div>
      </div>
    </div>
  );
}


export default Modal;