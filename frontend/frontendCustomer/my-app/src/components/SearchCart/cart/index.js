import React from 'react'
import './style.css'
import { AiOutlineShoppingCart} from "react-icons/ai";
function index() {
  return (
    <div className='cart'>
                    <div className='cart_icon'>
                        <a href='#' >
                            <li><AiOutlineShoppingCart style={{ width: 40, height: 40, color: "black" }} /></li>
                        </a>
                    </div>
                </div>
  )
}

export default index