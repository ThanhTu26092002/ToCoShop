import React from 'react'
import "./style.css";
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import { AiOutlineHeart } from "react-icons/ai"
import Productdetal from "../../../pages/ProductDetail/ProductDetail"
import numeral from "numeral";
function index({imgproduct}) {
    console.log("imgproduct",imgproduct)
  return (
    <div className='product'>
        <div className='product_img'>
            <img src={"http://localhost:9000/uploads"+imgproduct.coverImage} alt=''></img>
            {/* <div className='addToCart cart1'>
                    <a  href='#'>Add to Cart</a>
                </div> */}  
        </div>
        <div className='product_title'>
            <div className='product_price'>
                
                <p>{imgproduct.productCode}</p>
                <p><del>{numeral(imgproduct.price).format("0,0")} VNĐ</del></p>
                
            </div>
            <div className='product_evaluate'>
            <p className='priceproduct'>{numeral(imgproduct.minTotalPrice).format("0,0")} VNĐ</p>
                
            </div>
        </div>
        <Routes>
        <Route path='/demo1' element={<Productdetal detall={imgproduct}/>}/>
        </Routes>
    </div>
    
  )
}

export default index