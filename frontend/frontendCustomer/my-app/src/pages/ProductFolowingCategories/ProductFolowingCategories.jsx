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
  const [imagesnew, setImagesnew] = useState([]);//danhmuc

  const[categoryName,setCategoryName]=useState(null);
  const { id } = useParams();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    axios.get("https://tococlothes.onrender.com/v1/products/02getByCategoryId/"+ id).then((response) => {
      
      setImages(response.data.results);
      setImagesnew(response.data.results);
      setCategoryName(response.data.results[0].categories[0].name)
    });


  }, [id])
  
  const discountOnclick=()=>{
    axios.get("https://tococlothes.onrender.com/v1/products/09getByCategoryIdSortByDiscount/"+ id).then((response) => {
      
      setImages(response.data.results);
      
    });
    
  }
  const newproduct=()=>{
    setImages(imagesnew)
  }
  
  return (
    <div className="Men_product">
      <Slider />
      <Search_cart />
      <div className="Sort">
        <div className="Sort_title">
          <h3>Sắp xếp theo</h3>
        </div>
        <div className="Sort_Latest" onClick={newproduct}>
          <h3>Mới nhất</h3>
        </div>
        <div className="Sort_selling" onClick={discountOnclick}>
          <h3>Đang Khuyến Mãi</h3>
        </div>
      </div>
      <div className='listproducts'>
        <div className="listproducts_title">
       <i><h1>{categoryName}</h1></i>
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