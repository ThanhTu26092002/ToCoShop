import React, { useState, useEffect } from "react";
import "./Nav.css"
import { AiOutlineUser, AiOutlineShopping, AiOutlineSearch, AiOutlineHeart } from "react-icons/ai";
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import Home from "../Newfashion/Newfashion"
import Menclothes from "../Menclothes/Menclothes"
import Productdetal from "../productdetails/productdetails"
import Modal from "../../components/Modal/Modal";
import Cartdetall from "../Cartdetall/Cartdetall";
import Cartdetall2 from "../Cartdetall2/Cartdetall2";
import Cartdetall3 from "../Cartdetall3/Cartdetall3";
import axios from 'axios';
function Nav() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);//danhmuc
  const [categoryId, setCategoryId] = useState(null);//danhmuc

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {

        axios.get("http://localhost:9000/v1/categories").then((response) => {
            setCategories(response.data.results);
        });


    }, [])
  return (

    <BrowserRouter>
      {modalOpen && <Modal closeModal={setModalOpen} />}
      <div className='main'>
        <div className='sidebar'>
          <div className='sidebar_logo'>
            <div className='container_sldebar_logo'>
              <img src='ToCoClothes.png' alt=''></img>
            </div>

          </div>
          <div className='sidebar_extra'>
            <div className='container_sldebar_extra'>
              <a href='#' >
                <li><AiOutlineUser style={{ width: 25, height: 25 }} /></li>
              </a>
              <a href='#'>
                <li><AiOutlineSearch style={{ width: 25, height: 25 }} /></li>
              </a>
              <a href='#'>
                <li><AiOutlineHeart style={{ width: 25, height: 25 }} /></li>
              </a>
              <a onClick={() => {
                setModalOpen(true);
              }}>
                <li ><AiOutlineShopping style={{ width: 25, height: 25 }} /></li>
              </a>
            </div>
          </div>
          
          <nav>
            <ul>
            {
                categories.map((item, index)=>{
                    return(
                      <li key= {index} className='menu_item'><Link to={`/Menclothes/${item._id}`}>{item.name}</Link></li>
                    )
                })
              }
              {/* <li className='menu_item'><Link to='/'>N E W   F A S H I O N </Link></li>
              <li className='menu_item'><Link to='/Menclothes'>M E N C L O T H E S</Link></li>
              <li className='menu_item'><Link to='/'>W O M E N   C L O T H E S  </Link></li>
              <li className='menu_item'><Link to='/'>U N I S E X </Link></li>
              <li className='menu_item'><Link to='/'>O U T F I T W I N T E R </Link></li>
              <li className='menu_item'><Link to='/'>O U T F I T S U M M E R  </Link></li> */}
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
            <Route path='/' element={<Home categorieId={categoryId}/>} />
            <Route path='/Menclothes/:id' element={<Menclothes />} />
            <Route path='/productDetail/:id' element={<Productdetal />} />
            <Route path='/Thanhtoan' element={<Cartdetall />} />
            <Route path='/Thanhtoan2' element={<Cartdetall2 />} />
            <Route path='/Thanhtoan3' element={<Cartdetall3 />} />
          </Routes>

        </div>
      </div>

    </BrowserRouter>


  )
}

export default Nav