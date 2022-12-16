import './CartDetail3.css'
import React, { useState, useEffect } from "react";
import Slider from "../../../components/slide/Slider"
import Images from "../../../components/Listproducts/images"
import Footer from "../../../components/Footer/Footer"
import Search_cart from "../../../components/SearchCart/index"
import axios from 'axios';
import { DownOutlined, UpOutlined,DoubleRightOutlined, DoubleLeftOutlined} from '@ant-design/icons';
import { Button, Form, Input, Space, Select, Layout, InputNumber, Modal, Table, notification, message, Popconfirm, Upload, Cascader } from 'antd'
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import TextArea from "antd/lib/input/TextArea";
function Cartdetall3() {
    return (
        <div className='main_Cartdetall3'>
            <Slider />
            <div className='Cartdetall3_body'>
                <div className='Cartdetall3_title'>
                    <h1>Thông Tin Giỏ Hàng</h1>
                </div>
                <div className='Cartdetall3_form'>
                    <h2>Thanh toán:</h2>
                    <div className='Cartdetall3_form_main'>
                        <Form
                            style={{  marginLeft: 100 }}
                        >
                            <Form.Item className='a' label="Phương tiện vận chuyển:">
                                <Cascader  style={{ width: 600,marginLeft: 27 }} placeholder="Chọn..." />
                            </Form.Item>
                            <Form.Item className='a' label="Phương thức thanh toán:">
                                <Cascader style={{ width: 600,marginLeft: 27 }} placeholder="Chọn..." />
                            </Form.Item>
                        </Form>
                    </div>
                </div>
                <div className='Cartdetall3_form_main'>
                        <Form
                            style={{  marginLeft: 100 }}
                        >
                            <Form.Item className='a' label="Tên sản phẩm 1:">
                            <Input
                            placeholder='số lượng'
                            style={{width:1000}}
                            addonBefore={
                              <Form.Item
                                name="Ma"
                                noStyle
                              >
                                <Select
                                  placeholder="Mã số"
                                  style={{
                                    width: 100,
                                  }}
                                  
                                />
                              </Form.Item>
                            }
                          >

                          </Input>
                            </Form.Item>
                            <Form.Item className='a' label="Số lượng:">
                                <Input
                            placeholder='số lượng'
                            addonAfter="Sản phẩm"
                            style={{marginLeft:35,width:1000}}
                            addonBefore={
                              <Form.Item
                                name="Ma"
                                noStyle
                              >
                                <Select
                                  placeholder="Size"
                                  style={{
                                    width: 100,
                                  }}
                                  
                                />
                              </Form.Item>
                            }
                          >

                          </Input>
                            </Form.Item>
                            <Form.Item className='a' label="Giảm giá:">
                                <Input style={{marginLeft:40,width:200}} addonAfter="%"></Input>
                            </Form.Item>
                            <Form.Item className='a' label="Giá tiền:">
                            <InputNumber defaultValue={0} style={{marginLeft:45,width:200}} addonAfter="VNĐ"></InputNumber>
                            </Form.Item>
                        </Form>
                    </div>
                <div className='Cartdetall3btn'>
                        <button><Link to='/Thanhtoan2'><DoubleLeftOutlined /></Link></button>
                        <button>OK</button>
                    </div>
            </div>
            <Footer amount1={8}></Footer>
        </div>
    )
}

export default Cartdetall3