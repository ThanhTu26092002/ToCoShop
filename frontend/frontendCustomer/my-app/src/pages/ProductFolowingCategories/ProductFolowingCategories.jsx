import React, { useState, useEffect } from "react";
import "./ProductFolowingCategories.css"
import { AiOutlineShoppingCart, AiOutlineSearch } from "react-icons/ai";
import Slider from "../../components/slide/Slider"
import Images from "../../components/Listproducts/images"
import Footer from "../../components/Footer/Footer"
import axios from 'axios';
import Search_cart from "../../components/SearchCart/index"
import { useParams } from "react-router-dom";
function Menclothes() {
  const [images, setImages] = useState([]);//danhmuc


  const { id } = useParams();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    axios.get("http://localhost:9000/v1/products/02getByCategoryId/"+ id).then((response) => {
      setImages(response.data.results);
    });


  }, [id])
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
          <h3>Đang Khuyến Mãi</h3>
        </div>
      </div>
      <div className='listproducts'>
        <div className="listproducts_title">
          <i><h1>O U T F I T S U M M E R</h1></i>
          {/* <h1>{id}</h1> */}
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