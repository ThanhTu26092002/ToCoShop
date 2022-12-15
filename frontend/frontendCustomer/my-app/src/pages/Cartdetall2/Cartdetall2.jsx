import './Cartdetall2.css'
import React, { useState, useEffect } from "react";
import Slider from "../../components/slide/Slider"
import Images from "../../components/Listproducts/images"
import Footer from "../../components/Footer/Footer"
import Search_cart from "../../components/SearchCart/index"
import axios from 'axios';
import { DownOutlined, UpOutlined,DoubleRightOutlined, DoubleLeftOutlined} from '@ant-design/icons';
import { Button, Form, Input, Space, Select, Layout, InputNumber, Modal, Table, notification, message, Popconfirm, Upload, Cascader } from 'antd'
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import TextArea from "antd/lib/input/TextArea";
function Cartdetall2() {
    return (
        <div className='main_Cartdetall2'>
            <Slider />
            <div className='Cartdetall2_body'>
                <div className='Cartdetall2_title'>
                    <h1>Thông Tin Giỏ Hàng</h1>
                </div>
                <div className='Cartdetall2_form'>
                    <h2>Thông tin người nhận hàng:</h2>
                    <div className='Cartdetall2_form_main'>
                        <Form
                            style={{  marginLeft: 100 }}
                        >
                            <Form.Item className='a' label="Họ:">
                                <Input  style={{ marginLeft: 57 }} placeholder="Họ" />
                            </Form.Item>
                            <Form.Item className='a' label="Tên:">
                                <Input  style={{ marginLeft: 57 }} placeholder="Tên" />
                            </Form.Item>
                            <Form.Item className='a' label="Email:">
                                <Input  style={{ marginLeft: 47 }} placeholder="Email" />
                            </Form.Item>
                            <Form.Item className='a' label="Số điện thoại:">
                                <Input  placeholder="Số điện thoại" />
                            </Form.Item>
                            <Form.Item className='a' label="Quốc gia:">
                                <Cascader  style={{ width: 300,marginLeft: 27 }} placeholder="Quốc gia" />
                            </Form.Item>
                            <Form.Item className='a' label="Tỉnh:">
                                <Cascader style={{ width: 300,marginLeft: 57 }} placeholder="Tỉnh" />
                            </Form.Item>
                            <Form.Item className='a' label="Quận/huyện:">
                                <Cascader style={{ width: 300,marginLeft: 8 }} placeholder="Quận/huyện" />
                            </Form.Item>
                            <Form.Item className='a' label="Địa chỉ:">
                                <Input style={{ marginLeft: 37 }} placeholder="Địa chỉ" />
                            </Form.Item>
                            <Form.Item className='a' label="Ghi chú:">
                            <TextArea rows={3} style={{ marginLeft: 30 }}  placeholder="Thời gian nhận hàng" />
                            </Form.Item>
                        </Form>
                    </div>
                    

                </div>
                <div className='Cartdetall2btn'>
                        <button><Link to='/Thanhtoan'><DoubleLeftOutlined /></Link></button>
                        <button><Link to='/Thanhtoan3 '>Tiếp tục   <DoubleRightOutlined /></Link></button>
                    </div>
            </div>
            <Footer amount1={8}></Footer>
        </div>
    )
}

export default Cartdetall2