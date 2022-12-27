import React, { useState, useEffect } from "react";
import "./Home.css"
import Slider from "../../components/slide/Slider"
import Images from "../../components/Listproducts/images"
import Footer from "../../components/Footer/Footer"
import Search_cart from "../../components/SearchCart/index"

import axios from 'axios';
function Home({categorieId}) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [images, setImages] = useState([]);//danhmuc

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        console.log(categorieId);
    axios.get("https://tococlothes.onrender.com/v1/products/07getByPromotionPosition?value=WEEKLY").then((response) => {
        console.log('data categories',response.data.results)
        setImages(response.data.results);
    });
    }, [])

    return (
        <div className='mainhome'>
            <Slider />
           
            <Search_cart/>
            <div className='listproducts'>
                <div className="listproducts_title">
                    <h1>Gợi Ý Trong Tuần</h1>
                </div>

                <div className='listproducts_main'>
                    <Images amount={9} data={images} ></Images>
                </div>
            </div>
           
            <Footer amount1={8}></Footer>

        </div>
    )
}

export default Home