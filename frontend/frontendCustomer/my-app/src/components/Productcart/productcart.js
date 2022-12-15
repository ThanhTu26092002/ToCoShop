import React from 'react'
import "./productcart.css"
function productcart() {
  return (
    <div className="product_cart">
            <div className="product_cart_img">
              <img src="newfashion11.png" alt=""></img>
            </div>
            <div className="product_cart_detall">
              <span className="product_cart_detall_title">Tên sản phẩm: <span>Áo thun W2AT</span></span>
              <span className="product_cart_detall_title">Size: <span>M</span></span>
              <span className="product_cart_detall_title">Màu: <span>Cam</span></span>
              <span className="product_cart_detall_title">Số lượng: <span>4</span></span>
              <span className="product_cart_detall_title">Đơn giá: <span className="oldprice"><del>425.000</del></span> <span className="newprice">375.000VND</span></span>
              <span className="product_cart_detall_title">Thành tiền: <span>750.000</span></span>
            </div>
          </div>
  )
}

export default productcart