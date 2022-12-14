import React from 'react'
import "./style.css";
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import { AiOutlineHeart } from "react-icons/ai"
import Productdetal from "../../../pages/productdetails/productdetails"
function index({imgproduct}) {
  return (
    <div className='product'>
        <div className='product_img'>
            <img src={"http://localhost:9000/"+imgproduct.coverImage} alt=''></img>
            <div className='addToCart cart1'>
                    <a  href='#'>Add to Cart</a>
                </div>
        </div>
        <div className='product_title'>
            <div className='product_price'>
                <p>{imgproduct.name}</p>
                <p>{imgproduct.description}</p>
            </div>
            <div className='product_evaluate'>
                <AiOutlineHeart style={{ width: 40, height: 40 }}/>
                <p>1.9K</p>
            </div>
        </div>
        <Routes>
        <Route path='/demo1' element={<Productdetal detall={imgproduct}/>}/>
        </Routes>
    </div>
    
  )
}

export default index