import React, { useState, useEffect } from "react";
import Slider from "../../components/slide/Slider";
import Images from "../../components/Listproducts/images";
import Footer from "../../components/Footer/Footer";
import Search_cart from "../../components/SearchCart/index";
import { useParams } from "react-router-dom";

import axios from "axios";
import "./productdetails.css";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { InputNumber } from "antd";
function productdetails() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { id } = useParams();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [product, setProduct] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [images, setImages] = useState(null); //danhmuc
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [categoryId, setCategoryId] = useState(null); //danhmuc
  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        "http://localhost:9000/v1/products/findById/" + id
      );
      setProduct(res.data);
      console.log("get Cate:", res.data.categoryId);

      const resCate = await axios.get(
        "http://localhost:9000/v1/products/02getByCategoryId/" + res.data.categoryId
      );
      console.log('get data:', resCate.data.results)
      setImages(resCate.data.results)
    } catch (error) {
      console.log("err:", error);
    }
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
   
    fetchProduct();
    
    // axios
    //   .get("http://localhost:9000/v1/products/findById/" + id)
    //   .then((response) => {
    //     setProduct(response.data);
    //     console.log("results productDetail:", response.data);
    //      setCategoryId( response.data.categoryId)
    //   });

    // axios
    //   .get("http://localhost:9000/v1/products/02getByCategoryId/" + categoryId)
    //   .then((response) => {
    //     console.log("get category:", response.data.results);
    //     setImages(response.data.results);
    //     // func(response.data.results)
    //   });
  }, []);
  return (
    <div className="main_product_detall">
      <Slider />
      <Search_cart />
      <div className="detail">
        <div className="product_detall_container">
          <div className="product_img">
            <div className="product_img_container">
              <img src="newfashion11.png" alt="" />
            </div>
          </div>
          <div className="product_detall">
            <div className="product_detall_main">
              <p>QUẦN THUN W2AT</p>
              <div className="price">
                <p>
                  <del>425.000VNĐ</del>
                </p>
                <p>375.000VNĐ</p>
                <div className="discount">
                  <p>giảm 25%</p>
                </div>
              </div>
              <div className="size">
                <p>SIZE: </p>
                <div className="size_container">
                  <a href="#">S</a>
                  <a href="#">M</a>
                  <a href="#">L</a>
                </div>
              </div>
              <a href="#" className="btnsize">
                Bảng qui đổi kích cở
              </a>
              <div className="amount">
                <h4>Amount:</h4>
                <InputNumber style={{ marginRight: 30 }} defaultValue={0} />
                <p>1038 sản phẩm có sẵn</p>
              </div>
              <div className="btn_cart_buy">
                <a href="#" className="btncart">
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
          <p>ÁO PHÔNG basic trơn trắng, đen....</p>
          <p>Chất liệu thun cotton mềm mịn, form chuẩn. 2 màu hồng, đỏ...</p>
          <br />
          <p> 149 Bà Triệu - Huế</p>
          <p> Xuất xứ: Việt Nam</p>
          <p> Hot line : 01222773986</p>
          <p> Link facebook shop: https://m.facebook.com/ToCoClothes</p>
          <p> https://m.facebook.com/ToCoClothes</p>
          <br />
          <p>
            Sản phẩm của shop đảm bảo chất lượng tuyệt đối. Chất liệu đẹp, form
            dáng chuẩn. Và đặc biệt shop chuyên những mặt hàng tầm trung cho đến
            cao cấp không bán những mặt hàng rẻ, kém chất lượng. Khách hàng khi
            order sẽ được ship COD nên nếu sản phẩm không làm hài lòng quý khách
            hàng thì có thể ko thanh toán và gửi trả lại.
          </p>
          <br />
          <p>Chân thành cảm ơn quý khách hàng đã ghé xem và theo dõi shop ạ.</p>
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
  );
}

export default productdetails;
