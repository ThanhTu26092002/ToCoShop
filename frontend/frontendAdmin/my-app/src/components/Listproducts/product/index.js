import React from 'react'
import "./style.css";
import { AiOutlineHeart } from "react-icons/ai"
function index({imgproduct}) {
  return (
    <div className='product'>
        <div className='product_img'>
            <img src={"http://localhost:9000"+imgproduct.imageUrl} alt=''></img>
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
    </div>
  )
}

export default index