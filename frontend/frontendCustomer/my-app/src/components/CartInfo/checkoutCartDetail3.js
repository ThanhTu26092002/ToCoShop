import React from 'react'
import {
    DownOutlined,
    UpOutlined,
    RightOutlined,
    DoubleRightOutlined,
    DoubleLeftOutlined,
  } from "@ant-design/icons";
  import {
    Button,
    Form,
    Input,
    Space,
    Select,
    Layout,
    InputNumber,
    Modal,
    Table,
    notification,
    message,
    Popconfirm,
    Upload,
    Cascader,
    Radio,
  } from "antd";
function checkoutCartDetail3({handleFinishCreate,previousfunc,info}) {
  return (
    <div>
        <div className="Cartdetall3_form">
            <h2>Thanh toán:</h2>
            <div className="Cartdetall3_form_main">
              <Form style={{ marginLeft: 100 }}
               onFinish={handleFinishCreate}
              >
                <Form.Item className="a" label="Phương tiện vận chuyển:">
                  <Cascader
                    style={{ width: 600, marginLeft: 27 }}
                    placeholder="Chọn..."
                  />
                </Form.Item>
                <Form.Item className="a" label="Phương thức thanh toán:">
                  <Cascader
                    style={{ width: 600, marginLeft: 27 }}
                    placeholder="Chọn..."
                  />
                </Form.Item>
              </Form>
            </div>
          </div>
          <div className="Cartdetall3_form_main">
            <Form style={{ marginLeft: 100 }}>
              <Form.Item className="a" label="Tên sản phẩm 1:">
                <Input
                  placeholder="số lượng"
                  style={{ width: 1000 }}
                  addonBefore={
                    <Form.Item name="Ma" noStyle>
                      <Select
                        placeholder="Mã số"
                        style={{
                          width: 100,
                        }}
                      />
                    </Form.Item>
                  }
                ></Input>
              </Form.Item>
              <Form.Item className="a" label="Số lượng:">
                <Input
                  placeholder="số lượng"
                  addonAfter="Sản phẩm"
                  style={{ marginLeft: 35, width: 1000 }}
                  addonBefore={
                    <Form.Item name="Ma" noStyle>
                      <Select
                        placeholder="Size"
                        style={{
                          width: 100,
                        }}
                      />
                    </Form.Item>
                  }
                ></Input>
              </Form.Item>
              <Form.Item className="a" label="Giảm giá:">
                <Input
                  style={{ marginLeft: 40, width: 200 }}
                  addonAfter="%"
                ></Input>
              </Form.Item>
              <Form.Item className="a" label="Giá tiền:">
                <InputNumber
                  defaultValue={0}
                  style={{ marginLeft: 45, width: 200 }}
                  addonAfter="VNĐ"
                ></InputNumber>
              </Form.Item>
              <div className="Cartdetall3btn">
            <button
              onClick={
                previousfunc
              }
            >
              <DoubleLeftOutlined />
            </button>
            <button>OK</button>
          </div>
            </Form>
          </div>
          
    </div>
  )
}

export default checkoutCartDetail3