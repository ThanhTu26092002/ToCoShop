import React, { useState, useEffect } from "react";
import "./Nav.css"
import { AiOutlineUser, AiOutlineShopping, AiOutlineSearch, AiOutlineHeart } from "react-icons/ai";
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import Home from "../Home/Home"
import ProductFolowingCategories from "../ProductFolowingCategories/ProductFolowingCategories"
import Productdetal from "../ProductDetail/ProductDetail"
import Modal from "../../components/Modal/Modal";
import CartDetail from "../CartInfo/CartDetail1/CartDetail1";
import CartDetail2 from "../CartInfo/CartDetail2/CartDetail2";
import CartDetail3 from "../CartInfo/CartDetail3/CartDetail3";
import axios from 'axios';
import { useCart } from "../../hooks/useCart";
function Nav() {
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);//danhmuc
  const [categoryId, setCategoryId] = useState(null);//danhmuc
  
  const { items, remove, increase, decrease } = useCart((state) => state);
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
              <Link to='/'><img src='ToCoClothes.png' alt=''></img></Link>
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
              <a className="cart_a" onClick={() => {
                setModalOpen(true);
              }}>
                <li > <AiOutlineShopping style={{ width: 25, height: 25 }} /><div>{items.length}</div></li>
              </a>
            </div>
          </div>
          
          <nav >
            <ul>
            {
                categories.map((item, index)=>{
                    return(
                       <li key= {index} className='menu_item'><Link to={`/ProductFolowingCategories/${item._id}`}>{item.name}</Link></li>                   
                    )
                })
              }
            </ul>
          </nav>
          <div className='sidebar_footer'>
            <div className='box_hotline'>
              <div className='container_hotline'>
                <a href='#'>
                  <img src='image11.png' alt=''></img>
                  <span>0 9 0 5 9 0 5 9 9 9 </span>
                </a>
              </div>

            </div>
            <div className='box_hotline1'>  
              <div className='container_hotline1'>
                <a href='https://www.facebook.com/people/ToCo-Clothes/100089181962577/'><img src='image12.png' alt=''></img></a>
                <a href='https://www.youtube.com/watch?v=ofymXsQj5mc'><img src='image13.png' alt=''></img></a>
                <a href='https://www.instagram.com/'><img src='image14.png' alt=''></img></a>
                <a href='https://twitter.com/i/flow/login?input_flow_data=%7B%22requested_variant%22%3A%22eyJsYW5nIjoidmkifQ%3D%3D%22%7D'><img src='image15.png' alt=''></img></a>
              </div>
            </div>
          </div>
        </div>
        <div className='content'>
        
          <Routes>
            <Route path='/' element={<Home categorieId={categoryId}/>} />
            <Route path='/ProductFolowingCategories/:id' element={<ProductFolowingCategories />} />
            <Route path='/productDetail' element={<Productdetal />} />
            <Route path='/Thanhtoan' element={<CartDetail />} />
            <Route path='/Thanhtoan2' element={<CartDetail2 />} />
            <Route path='/Thanhtoan3' element={<CartDetail3 />} />
          </Routes>

        </div>
      </div>

    </BrowserRouter>


  )
}

export default Nav