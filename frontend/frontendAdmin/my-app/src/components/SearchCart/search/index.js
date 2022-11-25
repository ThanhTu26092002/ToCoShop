import React from 'react'
import './style.css'
import {  AiOutlineSearch } from "react-icons/ai";
function index() {
  return (
    <div className='search'>
    <div className='search_input'>
        <input type='text' placeholder='  Search...'></input>
    </div>
    <div className='search_icon'>
        <a href='#' >
            <li><AiOutlineSearch style={{ width: 40, height: 40, color: "black" }} /></li>
        </a>
    </div>
</div>
  )
}

export default index