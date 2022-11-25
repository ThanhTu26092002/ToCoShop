import React, { useState, useEffect } from "react";
import "./Newfashion.css"
import Slider from "../../components/slide/Slider"
import Images from "../../components/Listproducts/images"
import Footer from "../../components/Footer/Footer"
import Search_cart from "../../components/SearchCart/index"
import axios from 'axios';
function Newfashion() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [images, setImages] = useState([]);//danhmuc

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {

        axios.get("http://localhost:9000/categories3/").then((response) => {
            
            setImages(response.data.results);
        });


    }, [])
    return (
        <div className='mainhome'>
            <Slider />
           
            <Search_cart/>
            <div className='listproducts'>
                <div className="listproducts_title">
                    <h1>NEW ARRIVALS</h1>
                </div>

                <div className='listproducts_main'>
                    <Images amount={9} data={images} ></Images>
                </div>
            </div>
           
            <Footer amount1={8}></Footer>

        </div>
    )
}

export default Newfashion