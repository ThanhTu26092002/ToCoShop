import React from 'react'
import "./productcart.css"
import numeral from "numeral"
function productcart({items}) {
  console.log( "item",items)

  const attributes=items.product.attributes
  let attributesItem=null
  attributes.map((e)=>{
    if(e._id===items.attributeId){
      console.log( "itemsize",e  )
      attributesItem=e
      console.log( "attributeIdprice",attributesItem.price)
    }
  })
  console.log( "attributeId",items.attributeId)
  
  
  return (
  attributesItem &&  <div className="product_cart">
            <div className="product_cart_img">
            <img
                  src={"http://localhost:9000/uploads" + items.product.coverImage}
                  alt=""
                />
            </div>
            <div className="product_cart_detall">
              <span className="product_cart_detall_title">Tên sản phẩm: <span>{items.product.name}</span></span>
              
               <span className="product_cart_detall_title">Size: <span>{attributesItem.size}</span></span> 
              <span className="product_cart_detall_title">Màu: <span>{attributesItem.color}</span></span>
              <span className="product_cart_detall_title">Số lượng: <span>{items.quantity}</span></span>
              <span className="product_cart_detall_title">Giảm giá: <span>{attributesItem.discount}%</span></span>
              <span className="product_cart_detall_title">Đơn giá: <span className="oldprice"><del>{numeral(attributesItem.price).format("0,0")}VNĐ</del></span> <span className="newprice">{numeral(attributesItem.totalPriceEachType).format("0,0")}VNĐ</span></span>
              <span className="product_cart_detall_title">Thành tiền: <span>{numeral(Number(attributesItem.totalPriceEachType)*Number(items.quantity)).format("0,0")}VNĐ</span></span>
            </div>
          </div>
        
  )
}

export default productcart