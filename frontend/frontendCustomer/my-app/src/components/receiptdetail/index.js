import React from "react";
import "./style.css";
import styles from "./receiptdetail.module.css";
import numeral from "numeral";
function index({ items }) {
  const attributes = items.product.attributes;
  let attributesItem = null;
  attributes.map((e) => {
    if (e._id === items.attributeId) {
      attributesItem = e;
    }
  });

  return (
    attributesItem && (
      <div className={styles.detailItem}>
        <div className="receipt">
          <div className="receipt_detail">
            <div className="receipt_detail_title">
              <span>Tên sản phẩm:</span>
              <span>Màu:</span>
              <span>Size:</span>
              <span>Số Lượng:</span>
              <span>Thành tiền:</span>
            </div>
            <div className="receipt_detail_information">
              <span>
                {`${items.product.name}`}-{`${items.product.productCode}`}
              </span>
              <span> {attributesItem.color}</span>
              <span> {attributesItem.size}</span>
              <span> {items.quantity}</span>
              <span>
                {" "}
                {numeral(attributesItem.totalPriceEachType).format("0,0")}VNĐ
              </span>
            </div>
          </div>
          <div className="receipt_img">
            <img
              src={
                "https://tococlothes.onrender.com/uploads" +
                items.product.coverImage
              }
              alt=""
            />
          </div>
        </div>
        <div className="receipt_UIIphone">
          <div className="receipt_detail">
            <div className="receipt_detail_information">
              <span>
                {`${items.product.name}`}-{`${items.product.productCode}`}
              </span>
              <span> {`${attributesItem.size}/${attributesItem.color}`}</span>
              <span> {`Số lượng: ${items.quantity}`}</span>
              <span className="totalPrice">
                {" "}
                {numeral(attributesItem.totalPriceEachType).format("0,0")}VNĐ
              </span>
            </div>
          </div>
          <div className="receipt_img">
            <img
              src={
                "https://tococlothes.onrender.com/uploads" +
                items.product.coverImage
              }
              alt=""
            />
          </div>
        </div>
      </div>
    )
  );
}

export default index;
