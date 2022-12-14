import React, { useEffect, useState } from "react";
import SliderContent from "./SliderContent";
import Dots from "./Dots";
import Arrows from "./Arrows";
import sliderImage from "./sliderImage";
import "./slider.css";
import axios from 'axios';

const len = sliderImage.length - 1;

function Slider(props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [images,setImages]=useState([]);//danhmuc
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(activeIndex === images.length-1 ? 0 : activeIndex + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex]);

 

  useEffect(()=>{
    axios.get("http://localhost:9000/categories3/").then((response) => {
      
      setImages(response.data.results);
    });


  },[])
  return (
    <div className="slider-container">
      <SliderContent activeIndex={activeIndex} sliderImage={images} />
      <Arrows
        prevSlide={() =>
          setActiveIndex(activeIndex < 1 ? images.length-1 : activeIndex - 1)
        }
        nextSlide={() =>
          setActiveIndex(activeIndex === images.length-1  ? 0 : activeIndex + 1)
        }
      />
      <Dots
        activeIndex={activeIndex}
        sliderImage={images}
        onclick={(activeIndex) => setActiveIndex(activeIndex)}
      />
    </div>
  );
}

export default Slider;