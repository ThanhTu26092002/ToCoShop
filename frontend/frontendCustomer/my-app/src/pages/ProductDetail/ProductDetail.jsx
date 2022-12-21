import React, { useState, useEffect } from "react";
import Slider from "../../components/slide/Slider";
import Images from "../../components/Listproducts/images";
import Footer from "../../components/Footer/Footer";
import Search_cart from "../../components/SearchCart/index";
import { useParams } from "react-router-dom";
import { useCart } from '../../hooks/useCart'
import axios from "axios";
import "./ProductDetail.css";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { InputNumber } from "antd";
import Sizeguide from "../../components/Sizeguide/Sizeguide"
function productdetails() {
  // const queryParams = new URLSearchParams("?term=pizza&location=Bangalore")
  // for (const [key, value] of queryParams) {
  //   console.log({ key, value }) // {key: 'term', value: 'pizza'} {key: 'location', value: 'Bangalore'}
  // }
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const productId = params.get("product");
  const atttributeId = params.get("attribute");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [productPriceItems, setProductPriceItems] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [reFresh, setReFresh] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [reFresh1, setReFresh1] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [productDiscount, setProductDiscount] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [productPrice, setProductPrice] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [product, setProduct] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [images, setImages] = useState(null); //danhmuc
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedColor, setSelectedColor] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSize, setSelectedSize] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedColor_Click, setSelectedColor_Click] = useState(atttributeId);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSize_Click, setSelectedSize_Click] = useState(atttributeId);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [categoryId, setCategoryId] = useState(null); //danhmuc
    // eslint-disable-next-line react-hooks/rules-of-hooks
  const {add}=useCart((state)=>state)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [SizeguideOpen, setsizeguideOpen] = useState(false);
  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        "http://localhost:9000/v1/products/findById/" + productId
      );
      setProduct(res.data.results[0]);
      res.data.results[0].attributes.map((item) => {
      console.log("get data1:", res.data.results[0]);
        

        if (item._id === atttributeId) {
          setProductDiscount(item.discount);
          setProductPrice(item.price);
          setProductPriceItems(item.totalPriceEachType);
        }
      });
      const resCate = await axios.get(
        "http://localhost:9000/v1/products/02getByCategoryId/" +
          res.data.results[0].categories[0]._id
      );

      console.log("get data:", resCate);
      setImages(resCate.data.results);
    } catch (error) {
      console.log("err:", error);
    }
  };
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
useEffect(()=>{
  if (selectedColor_Click === selectedSize_Click) {
    product?.attributes.map((item) => {
      if (selectedColor_Click === item._id) {
        console.log("ok")
        setProductDiscount(item.discount);
        setProductPrice(item.price);
        setProductPriceItems(item.totalPriceEachType);
        
      }
    });
  }
},[selectedColor_Click,selectedSize_Click])
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetchProduct();
  }, []);

  return (
    
    product && (

      <div className="main_product_detall">
        {SizeguideOpen && <Sizeguide closeSizeguide={setsizeguideOpen} />}
        <Slider />
        <Search_cart />
        <div className="detail">
          <div className="product_detall_container">
            <div className="product_img">
              <div className="product_img_container">
                <img
                  src={"http://localhost:9000/uploads" + product.coverImage}
                  alt=""
                />
              </div>
            </div>
            <div className="product_detall">
              <div className="product_detall_main">
                <p>
                  {product.name}-{product.productCode}
                </p>
                <div className="price">
                  <p style={{ fontWeight: "bold" }}>
                    {productPrice && <del>{productPrice}VNĐ</del>}
                  </p>
                  <p>{productPriceItems}VNĐ</p>
                  <div className="discount">
                    <p>giảm {productDiscount}%</p>
                  </div>
                </div>
                <div className="color">
                  <p>Màu: </p>
                  <div className="color_container">
                    {reFresh1 &&
                      product.attributes.map((item, index) => {
                        if (item.size === selectedSize && selectedSize) {
                          return (
                            <a
                              style={
                                selectedColor_Click === item._id
                                  ? {
                                      color: "orange",
                                      borderColor: "orange",
                                      borderWidth: "2px",
                                    }
                                  : {}
                              }
                              onClick={() => {
                                setSelectedColor_Click(item._id);
                                setSelectedColor(item.color);
                                setReFresh((e) => e + 1);
                              }}
                            >
                              {item.color}
                            </a>
                          );
                        }
                      })}
                    {!reFresh1 &&
                      product.attributes.map((item, index) => {
                        return (
                          <a
                            style={
                              selectedColor_Click === item._id
                                ? {
                                    color: "orange",
                                    borderColor: "orange",
                                    borderWidth: "2px",
                                  }
                                : {}
                            }
                            onClick={() => {
                              setSelectedColor_Click(item._id);
                              setSelectedColor(item.color);
                              setReFresh((e) => e + 1);
                            }}
                          >
                            {item.color}
                          </a>
                        );
                      })}
                  </div>
                </div>
                <div className="size">
                  <p>SIZE: </p>
                  <div className="size_container">
                    {reFresh &&
                      product.attributes.map((item, index) => {
                        if (item.color === selectedColor && selectedColor) {
                          return (
                            <a
                              style={
                                selectedSize_Click === item._id
                                  ? {
                                      color: "orange",
                                      borderColor: "orange",
                                      borderWidth: "2px",
                                    }
                                  : {}
                              }
                              onClick={() => {
                                setSelectedSize_Click(item._id);
                                setSelectedSize(item.size);
                                setReFresh1((e) => e + 1);
                              }}
                              key={item._id}
                            >
                              {item.size}
                            </a>
                          );
                        }
                      })}
                    {!reFresh &&
                      product.attributes.map((item, index) => {
                        return (
                          <a
                            style={
                              selectedSize_Click === item._id
                                ? {
                                    color: "orange",
                                    borderColor: "orange",
                                    borderWidth: "2px",
                                  }
                                : {}
                            }
                            onClick={() => {
                              setSelectedSize_Click(item._id);
                              setSelectedSize(item.size);
                              setReFresh1((e) => e + 1);
                            }}
                            key={item._id}
                          >
                            {item.size}
                          </a>
                        );
                      })}
                  </div>
                </div>
                <a  className="btnsize" onClick={()=>{
                  setsizeguideOpen(true)
                }}>
                  Bảng qui đổi kích cở
                </a>
                <button
                  className="canclesizebtn"
                  onClick={() => {
                    setReFresh(false);
                    setReFresh1(false);
                  }}
                >
                  Chọn lại
                </button>
                <div className="amount">  
                  <h4>Amount:</h4>
                  <InputNumber style={{ marginRight: 30 }} min={0} defaultValue={1} />
                  <p>{product.stockTotal} sản phẩm có sẵn</p>
                </div>
                <div className="btn_cart_buy">
                  <a href="#" className="btncart" onClick={()=>{
                     console.log("selectedColor_Click",selectedColor_Click)
                    add({product:product,quantity:1,attributeId:selectedColor_Click})
                  }}>
                    THÊM VÀO GIỎ HÀNG
                  </a>
                  <a href="#" className="btnbuy">
                    MUA NGAY
                  </a>
                </div>
                <ul>
                  <li>
                    <img src="image50.png" />
                    <span>BẢO HÀNH TRONG VÒNG 90 NGÀY</span>
                  </li>
                  <li>
                    <img src="image50.png" />
                    <span>ĐỔI HÀNG TRONG VÒNG 30 NGÀY</span>
                  </li>
                  <li>
                    <img src="image50.png" />
                    <span>HOTLINE BÁN HÀNG: 0914 444 179</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="description">
            <p>HÀNG TOÀN BỘ CỦA SHOP ĐỀU CÓ SẴN </p>
            <br />
            <p>{product.description}</p>
            <br />
            <p> 149 Bà Triệu - Huế</p>
            <p> Xuất xứ: Việt Nam</p>
            <p> Hot line : 01222773986</p>
            <p> Link facebook shop: https://m.facebook.com/ToCoClothes</p>
            <p> https://m.facebook.com/ToCoClothes</p>
            <br />
            <p>
              Sản phẩm của shop đảm bảo chất lượng tuyệt đối. Chất liệu đẹp,
              form dáng chuẩn. Và đặc biệt shop chuyên những mặt hàng tầm trung
              cho đến cao cấp không bán những mặt hàng rẻ, kém chất lượng. Khách
              hàng khi order sẽ được ship COD nên nếu sản phẩm không làm hài
              lòng quý khách hàng thì có thể ko thanh toán và gửi trả lại.
            </p>
            <br />
            <p>
              Chân thành cảm ơn quý khách hàng đã ghé xem và theo dõi shop ạ.
            </p>
          </div>
          <div className="grid_item">
            <div className="related-section-header">
              <h3 className="related-section-header_title">
                <span className="related-section-header_text">
                  SẢN PHẨM CÙNG DANH MỤC
                </span>
              </h3>
            </div>
            {/* <Images data={images} count={4}></Images> */}
            {images && <Images data={images} count={4}></Images>}
          </div>
        </div>
        <Footer amount1={8}></Footer>
      </div>
    )
  );
}

export default productdetails;
