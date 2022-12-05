import React, { useState, useEffect } from "react";
import "./Menclothes.css"
import { AiOutlineShoppingCart, AiOutlineSearch } from "react-icons/ai";
import Slider from "../../components/slide/Slider"
import Images from "../../components/Listproducts/images"
import Footer from "../../components/Footer/Footer"
import axios from 'axios';
import Search_cart from "../../components/SearchCart/index"
function Menclothes() {
  const [images, setImages] = useState([]);//danhmuc

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {

    axios.get("http://localhost:9000/categories3/").then((response) => {
      console.log(response.data.results);
      setImages(response.data.results);
    });


  }, [])
  return (
    <div className="Men_product">
      <Slider />
      <Search_cart />
      <div className="Sort">
        <div className="Sort_title">
          <h3>Sắp xếp theo</h3>
        </div>
        <div className="Sort_Latest">
          <h3>Mới nhất</h3>
        </div>
        <div className="Sort_selling">
          <h3>Bán chạy nhất</h3>
        </div>
      </div>
      <div className='listproducts'>
        <div className="listproducts_title">
          <h1>WOMEN CLOTHES</h1>
        </div>
        <div className='listproducts_main'>
          <Images amount={12} data={images}  /> 
        </div>
      </div>
      <Footer amount1={12} ></Footer>
    </div>
  )
}

export default Menclothes