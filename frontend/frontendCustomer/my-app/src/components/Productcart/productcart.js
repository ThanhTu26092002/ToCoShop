import React from "react";
import "./productcart.css";
import "./productcartrps.css";
import numeral from "numeral";
import { useCart } from "../../hooks/useCart";
import {
  CloseSquareOutlined
} from "@ant-design/icons";
function productcart({ items }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { remove, increase, decrease } = useCart((state) => state);

  const attributes = items.product.attributes;
  let attributesItem = null;
  attributes.map((e) => {
    if (e._id === items.attributeId) {
      console.log("itemsize", e);
      attributesItem = e;
      
    }
  });

  return (
    attributesItem && (
      <div className="product_cart">
        <div className="product_cart_img">
          <img
            src={"https://tococlothes.onrender.com/uploads" + items.product.coverImage}
            alt=""
          />
        </div>
        <div className="product_cart_detall">
          <span className="product_cart_detall_title" >
            Tên sản phẩm: <span>{`${items.product.name}`}</span>
          </span>

          <span className="product_cart_detall_title">
            Size:<span style={{fontWeight:600}}>{attributesItem.size}</span>
          </span>
          <span className="product_cart_detall_title">
            Màu: <span>{`${attributesItem.color}`}</span>
          </span>
          <span className="product_cart_detall_title">
            Số lượng:
            <div className="quantityinput">
              {" "}
              <button
                    onClick={() => {
                      
                      decrease(items.attributeId);
                    }}
                  >
                    -
                  </button>
              <span>{items.quantity}</span>
              <button
                onClick={() => {
                  increase(items.attributeId);
                }}
              >
                +
              </button>
            </div>{" "}
          </span>
          <span className="product_cart_detall_title">
            Giảm giá: <span>{attributesItem.discount}%</span>
          </span>
          <span className="product_cart_detall_title">
            Đơn giá:{" "}
            <span className="oldprice">
              <del>{numeral(attributesItem.price).format("0,0")}VNĐ</del>
            </span>{" "}
            <span className="newprice">
              {numeral(attributesItem.totalPriceEachType).format("0,0")}VNĐ
            </span>
          </span>
          <span className="product_cart_detall_title">
            Thành tiền:{" "}
            <span>
              {numeral(
                Number(attributesItem.totalPriceEachType) *
                  Number(items.quantity)
              ).format("0,0")}
              VNĐ
            </span>
          </span>
        </div>
        <div className="product_cart_remove">
                
                <CloseSquareOutlined className="iconremove" onClick={()=>{
                 if(window.confirm("bạn có muốn xóa không"))
                  remove(items.attributeId)
                }}/>
                
        </div>
      </div>
    )
  );
}

export default productcart;
