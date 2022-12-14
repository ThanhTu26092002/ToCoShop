import React from 'react'
import './style.css'
import Search from './search/index'
import Cart from './cart/index'
function index() {
  return (
    <div className='search_cart'>
        <Search/>
        <Cart/>
    </div>
  )
}

export default index