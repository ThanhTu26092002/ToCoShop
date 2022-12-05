import React from 'react'
import "./Nav.css"
import { AiOutlineUser, AiOutlineShopping, AiOutlineSearch, AiOutlineHeart } from "react-icons/ai";
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import Home from "../Newfashion/Newfashion"
import Menclothes from "../Menclothes/Menclothes"

function Nav() {
  return (

    <BrowserRouter>
      
      <div className='main'>
        <div className='sidebar'>
          <div className='sidebar_logo'>
            <div className='container_sldebar_logo'>
              <img src='logo.png' alt=''></img>
            </div>

          </div>
          <div className='sidebar_extra'>
            <div className='container_sldebar_extra'>
              <a href='#'>
                <li><AiOutlineUser style={{ width: 25, height: 25 }} /></li>
              </a>
              <a href='#'>
                <li><AiOutlineSearch style={{ width: 25, height: 25 }} /></li>
              </a>
              <a href='#'>
                <li><AiOutlineHeart style={{ width: 25, height: 25 }} /></li>
              </a>
              <a href='#'>
                <li><AiOutlineShopping style={{ width: 25, height: 25 }} /></li>
              </a>
            </div>

          </div>
          <nav>
            <ul>
              <li className='menu_item'><Link to='/'>N E W   F A S H I O N </Link></li>
              <li className='menu_item'><Link to='/Menclothes'>M E N C L O T H E S</Link></li>
              <li className='menu_item'><Link to='/'>W O M E N   C L O T H E S  </Link></li>
              <li className='menu_item'><Link to='/'>U N I S E X </Link></li>
              <li className='menu_item'><Link to='/'>P R O M O T I O N </Link></li>
              <li className='menu_item'><Link to='/'>A C C E S S O R Y </Link></li>
              <li className='menu_item'><Link to='/'>A C C E S S O R Y </Link></li>
              <li className='menu_item'><Link to='/'>A C C E S S O R Y </Link></li>
              <li className='menu_item'><Link to='/'>A C C E S S O R Y </Link></li>
              <li className='menu_item'><Link to='/'>A C C E S S O R Y </Link></li>
            </ul>
          </nav>
          <div className='sidebar_footer'>
            <div className='box_hotline'>
              <div className='container_hotline'>
                <a href='#'>
                  <img src='image11.png' alt=''></img>
                  <span>0 9 6 7 1 1 6 8 0 1</span>
                </a>
              </div>

            </div>
            <div className='box_hotline1'>
              <div className='container_hotline1'>
                  <a href='#'><img src='image12.png' alt=''></img></a>
                  <a href='#'><img src='image13.png' alt=''></img></a>
                  <a href='#'><img src='image14.png' alt=''></img></a>
                  <a href='#'><img src='image15.png' alt=''></img></a>
              </div>
            </div>
          </div>
        </div>
        <div className='content'>
         <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Menclothes' element={<Menclothes />} />
        </Routes> 
        
        </div>
      </div>
      
    </BrowserRouter>


  )
}

export default Nav