import React, { useState, useEffect } from "react";
import "./Nav.css"
import "./Navrps.css"
import { AiOutlineUser, AiOutlineShopping, AiOutlineSearch, AiOutlineHeart } from "react-icons/ai";
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import Home from "../Home/Home"
import ProductFolowingCategories from "../ProductFolowingCategories/ProductFolowingCategories"
import Productdetal from "../ProductDetail/ProductDetail"
import Modal from "../../components/Modal/Modal";
import CartDetail from "../CartInfo/CartDetail1/CartDetail";
import axios from 'axios';
import { useCart } from "../../hooks/useCart";
import {
  UnorderedListOutlined,CloseOutlined
} from "@ant-design/icons";
function Nav() {
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);//danhmuc
  const [categoryId, setCategoryId] = useState(null);//danhmuc

  const { items, remove, increase, decrease } = useCart((state) => state);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    axios.get("https://tococlothes.onrender.com/v1/categories").then((response) => {
      setCategories(response.data.results);
    });
  }, [])
 const[overlay,setOverlay]=useState(false)
 const[navmb,setNavmb]=useState(false)
  return (

    <BrowserRouter>
      {modalOpen && <Modal closeModal={setModalOpen} />}
      <div className='main'>
        <div className='sidebar'>
          <div className='sidebar_logo'>
            <div className='container_sldebar_logo'>
              <Link to='/'><img src='ToCoClothes.png' alt='' onError={(e) =>
                (e.target.onerror = null)(
                  (e.target.src = `../../ToCoClothes.png`)
                )}></img></Link>
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
                categories.map((item, index) => {
                  return (
                    <li key={index} className='menu_item'><Link to={`/ProductFolowingCategories/${item._id}`}>{item.name}</Link></li>
                  )
                })
              }
            </ul>
          </nav>
          <div className='sidebar_footer'>
            <div className='box_hotline'>
              <div className='container_hotline'>
                <a href='#'>
                  <img src='image11.png' alt='' onError={(e) =>
                    (e.target.onerror = null)(
                      (e.target.src = `../../image11.png`)
                    )}></img>
                  <span>0 9 0 5 9 0 5 9 9 9 </span>
                </a>
              </div>

            </div>
            <div className='box_hotline1'>
              <div className='container_hotline1'>
                <a href='https://www.facebook.com/people/ToCo-Clothes/100089181962577/'><img src='image12.png' alt='' onError={(e) =>
                  (e.target.onerror = null)(
                    (e.target.src = `../../image12.png`)
                  )
                }></img></a>
                <a href='https://www.youtube.com/watch?v=ofymXsQj5mc'><img src='image13.png' alt='' onError={(e) =>
                  (e.target.onerror = null)(
                    (e.target.src = `../../image13.png`)
                  )}></img></a>
                <a href='https://www.instagram.com/'><img src='image14.png' alt='' onError={(e) =>
                  (e.target.onerror = null)(
                    (e.target.src = `../../image14.png`)
                  )}></img></a>
                <a href='https://twitter.com/i/flow/login?input_flow_data=%7B%22requested_variant%22%3A%22eyJsYW5nIjoidmkifQ%3D%3D%22%7D'><img src='image15.png' alt='' onError={(e) =>
                  (e.target.onerror = null)(
                    (e.target.src = `../../image15.png`)
                  )}></img></a>
              </div>
            </div>
          </div>
        </div>
        <div className="sidebarmb">
          <div className="sidebarmb-outside">
            <div onClick={()=>{
              setOverlay(true)
              setNavmb(true)
            }} for='nav-input' className="sidebarmb-btn">
              <UnorderedListOutlined />
            </div>
            <div className="sidebarmb-logo">
              <Link to='/'><img src='ToCoClothes.png' alt='' onError={(e) =>
                (e.target.onerror = null)(
                  (e.target.src = `../../ToCoClothes.png`)
                )}></img></Link>
            </div>
            <div className="sidebarmb-extra">
              <a className="sidebarmb-extra-cart" onClick={() => {
                setModalOpen(true);
              }}>
                <li > <AiOutlineShopping style={{ width: 25, height: 25 }} /><div>{items.length}</div></li>
              </a>
            </div>
          </div>

        </div>
      
        <div onClick={()=>{
            setOverlay(false)
            setNavmb(false)
        }} style={overlay?{display:'block'}:{display:'none'}} className="sidebarmb-nav__overlay">
        
        </div>
        <nav style={navmb?{transform:'translateX(0%)',opacity:1}:{transform:'translateX(-100%)',opacity:0}} className="nav_mb">
          <div className="nav_mb-close">
          <CloseOutlined onClick={()=>{
            setNavmb(false)
            setOverlay(false)
          }} />
          </div>
          <div className='container_nav_mb_logo'>
              <Link to='/'><img src='ToCoClothes.png' alt='' onError={(e) =>
                (e.target.onerror = null)(
                  (e.target.src = `../../ToCoClothes.png`)
                )}></img></Link>
            </div>

            <ul className="nav_mb-list">
              {
                categories.map((item, index) => {
                  return (
                    <li key={index} onClick={()=>{
                      setNavmb(false)
                      setOverlay(false)
                    }} className='sidebarmb-menu_item'><Link to={`/ProductFolowingCategories/${item._id}`}>{item.name}</Link></li>
                  )
                })
              }
            </ul>
            <div className='sidebar_footer'>
            <div className='box_hotline'>
              <div className='container_hotline'>
                <a href='#'>
                  <img src='image11.png' alt='' onError={(e) =>
                    (e.target.onerror = null)(
                      (e.target.src = `../../image11.png`)
                    )}></img>
                  <span>0 9 0 5 9 0 5 9 9 9 </span>
                </a>
              </div>

            </div>
            </div>
          </nav>
        <div className='content'>

          <Routes>
            <Route path='/' element={<Home categorieId={categoryId} />} />
            <Route path='/ProductFolowingCategories/:id' element={<ProductFolowingCategories />} />
            <Route path='/productDetail' element={<Productdetal />} />
            <Route path='/Thanhtoan' element={<CartDetail />} />


          </Routes>

        </div>
      </div>

    </BrowserRouter>


  )
}

export default Nav