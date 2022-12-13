import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Space, Select, Layout, InputNumber, Modal, Table, notification, message, Popconfirm , Upload} from 'antd'
import Operation from 'antd/lib/transfer/operation'
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined,UploadOutlined } from '@ant-design/icons';
import { Content } from "antd/lib/layout/layout";
import TextArea from "antd/lib/input/TextArea";
import axios from "axios";
import { URLProduct,WEB_SERVER_UPLOAD_URL } from "../config/constants";
import axiosClient from "../config/axios";
function Products() {

  const [categories, setCategories] = useState(null);
  const [suppliers, setSuppliers] = useState(null);
  const [products, setProducts] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();

  const beforeUpload = (file) => {
    const isImage =
      file.type === "image/jpg" ||
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/gif";
    if (!isImage) {
      message.error("You can only upload jpg-jpeg-png-gif file!");
      return false;
    } else {
      return true;
    }
  };
  
  const handleUploadImage = (options, record) => {
    setLoading(true);
    const { file } = options;
    let formData = new FormData();
    let URL = URLProduct + "/productImage/" + record._id;
    //If containing an image <=> file !== null
    if (!record.coverImage) {
      console.log(record.coverImage)
      formData.append("currentImgUrl", null);
    } else {
      
      formData.append("currentImgUrl", record.coverImage);
    }
    formData.append("file", file);

    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    //POST
    axiosClient
      .post(URL, formData, config)
      .then((response) => {
        if (response.status === 200) {
          console.log("ok upload image");
          setRefresh((f) => f + 1);
          message.success(`Cập nhật hình ảnh thành công!`);
        }
      })
      .catch((error) => {
        message.error(`Cập nhật hình ảnh thất bại.`);
        setLoading(false);
      })
      .finally(() => { });
  };
  const columns = [
    {
      title: "hình ảnh",
      key: "coverImage",
      dataIndex: "coverImage",
      width: "100px",
      render: (text) => {
        return (
          <div className="loadImg">
            <img
              src={
                text && text !== "null"
                  ? `${WEB_SERVER_UPLOAD_URL}/${text}`
                  : "./images/noImage.jpg"
              }
              style={{ width: "100%", height: "100%" }}
              alt=""
            ></img>
          </div>
        );
      },
    },
    {
      title: "Mã sản phẩm ",
      key: "productCode",
      dataIndex: "productCode",
      
      sorter: (a, b) => a.name.length - b.name.length,
      render: (Text) => {
        return <span style={{ fontWeight: '600' }}>{Text}</span>
      }
    },
    {
      title: "Tên sản phẩm ",
      key: "name",
      dataIndex: "name",
      
      // defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.length - b.name.length,
      render: (Text) => {
        return <span style={{ fontWeight: '600' }}>{Text}</span>
      }
    },
    {
      title: () => {
        return "Giá bán";
      },
      key: "price",
      dataIndex: "price",
      render: (text) => {
        return <span style={{ fontWeight: '600' }}>{text}</span>
      },
    },

    {
      title: () => {
        return "Giảm";
      },
      key: "discount",
      dataIndex: "discount",
      width: "4%",
      render: (text) => {
        return <span style={{ fontWeight: '600' }}>{text}</span>
      },
    },
    {
      title: "Nhóm sản phẩm",
      key: "categoryId",
      dataIndex: "categoryId",
      render: (text) => {
        return <div style={{ textAlign: "left" }}> {text ? text.name : <span style={{ color: 'red' }}>Không tìm thấy</span>}</div>;
      },
    },
    {
      title: "NCC",
      key: "supplierId",
      dataIndex: "supplierId",
      render: (text) => {
        return <div style={{ textAlign: "left" }}> {text ? text.name : <span style={{ color: 'red' }}>Không tìm thấy</span>}</div>;
      },
    },
    {
      title: "Mô tả",
      key: "description",
      dataIndex: "description",
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '10%',
      render: (record) => {
        return (
          <Space>
             
        <Upload
              beforeUpload={(file) => beforeUpload(file)}
              showUploadList={false}
              name="file"
              customRequest={(options) => {
                handleUploadImage(options, record);
              }}
            >
              <Button
                title="Cập nhật ảnh"
                icon={<UploadOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              ></Button>
            </Upload>
            <Button type='dashed' icon={<EditOutlined />} style={{ fontWeight: '600' }} onClick={() => {
              setVisible(true)
              setSelectedRow(record)
              const valuesize = record.size
              valuesize.map((e) => {
                formEdit.setFieldValue(`size${e.typeSize}`, e.amount)
              })

              console.log("record", record)

              formEdit.setFieldValue('productCode', record.productCode)
              formEdit.setFieldValue('name', record.name)
              formEdit.setFieldValue('price', record.price)
              formEdit.setFieldValue('discount', record.discount)
              formEdit.setFieldValue('categoryId', record.categoryId._id)
              formEdit.setFieldValue('supplierId', record.supplierId._id)
              formEdit.setFieldValue('description', record.description)
              formEdit.setFieldValue('promotionPosition', record.promotionPosition)

            }}></Button>
            <Popconfirm
              overlayInnerStyle={{ width: 300 }}
              title="Bạn muốn xóa không ?"
              okText="Đồng ý"
              cancelText="Đóng"
              onConfirm={() => handleConfirmDelete(record._id)}
            >
              <Button
                icon={<DeleteOutlined />}
                type="danger"
                style={{ fontWeight: 600 }}
                onClick={() => { }}
                title="Xóa"
              ></Button>
            </Popconfirm>
          </Space>
        )
      }

    }


  ]
  const optionspromotion = [];
  optionspromotion.push(
    {
      label: "đồ nử",
      value: "donu",
    },
    {
      label: "đồ nam",
      value: "donam",
    },
    {
      label: "áo khoác",
      value: "aokhoac",
    },

  );
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  React.useEffect(() => {
    axios.get("http://localhost:9000/v1/products/").then((response) => {
      setProducts(response.data);

    })
  }, [refresh])

   useEffect(() => {
     axios.get("http://localhost:9000/v1/categories").then((response) => {
       setCategories(response.data.results);
     })
   })
   useEffect(() => {
     axios.get("http://localhost:9000/v1/suppliers").then((response) => {
       setSuppliers(response.data.results);

     })
   })
  const handleConfirmDelete = (_id) => {
    axios.delete("http://localhost:9000/v1/products/" + _id).then((response) => {
      if (response.status === 200) {
        setRefresh((f) => f + 1);
        message.info("Xóa thành công");
      }
    });
  };

  const initialValues = {
    sizeM: 0,
    sizeL: 0,
    sizeS: 0,
    sizeXL: 0,
    sizeXXL: 0,
    discount: 0,
    price: 0,

  }
  return (
    <div>
      <Layout>
        <Content>
          <Form
            style={{ marginLeft: 400 }}
            form={form}
            initialValues={initialValues}
            onFinish={(values) => {

              const SizeS = [
                {
                  typeSize: "S",
                  amount: values.sizeS
                },
                {
                  typeSize: "M",
                  amount: values.sizeM
                },
                {
                  typeSize: "L",
                  amount: values.sizeL
                },
                {
                  typeSize: "XL",
                  amount: values.sizeXL
                },
                {
                  typeSize: "XXL",
                  amount: values.sizeXXL
                }
              ]
              delete values.sizeM
              delete values.sizeL
              delete values.sizeS
              delete values.sizeXL
              delete values.sizeXXL
              values.size = SizeS
              axios.post('http://localhost:9000/v1/products/', values).then(response => {
                if (response.status === 200) {
                  setRefresh((f) => f + 1);
                  form.resetFields();
                  notification.info({ message: 'Thông báo', description: 'thêm mới thành công' })
                }
              })
              console.log(values);
            }}
          >
            <Form.Item rules={[{
              required: true,
              message: "nhập mã sản phẩm"
            }]} name={"productCode"} label="mã sản phẩm" >
              <Input placeholder='product code' />
            </Form.Item>

            <Form.Item rules={[{
              required: true,
              message: "nhập tên sản phẩm"
            }]} name={"name"} label="tên sản phẩm" >
              <Input placeholder='name product' />
            </Form.Item>
            <Form.Item rules={[{
              required: true,
              message: "nhập giá bán"
            }]} name={"price"} label="giá bán" >
              <InputNumber style={{ marginLeft: 40 }} min={0} placeholder="0" addonAfter='VND' />
            </Form.Item>
            <Form.Item name={"discount"} label="giảm giá" >
              <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='%' />
            </Form.Item>

            <Form.Item name={"sizeM"} label="sizeM" >
              <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
            </Form.Item>
            <Form.Item name={"sizeS"} label="sizeS" >
              <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
            </Form.Item>
            <Form.Item name={"sizeL"} label="sizeL" >
              <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
            </Form.Item>
            <Form.Item name={"sizeXL"} label="sizeXL" >
              <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
            </Form.Item>
            <Form.Item name={"sizeXXL"} label="sizeXXL" >
              <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
            </Form.Item>

            <Form.Item name={"promotionPosition"} label="promotionPosition">
              <Select
                mode="multiple"
                allowClear
                style={{
                  width: '100%',
                }}
                placeholder="Please select"

                onChange={handleChange}
                options={optionspromotion}
              />
            </Form.Item>
            <Form.Item name={"categoryId"} rules={[{
              required: true,
              message: "Vui lòng chọn loại hàng hóa!",
            }]} label="loại hàng hóa">
              <Select placeholder="Chọn tùy thuộc danh mục" loading={!categories}>
                {categories &&
                  categories.map((c) => {
                    return (
                      <Select.Option key={c._id} value={c._id}>
                        {c.name}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>
            <Form.Item name={"supplierId"} rules={[{
              required: true,
              message: "Vui lòng chọn nhà phân phối!",
            }]} label="nhà phân phối">
              <Select placeholder="Chọn nhà phân phối" loading={!suppliers}>
                {suppliers &&
                  suppliers.map((c) => {
                    return (
                      <Select.Option key={c._id} value={c._id}>
                        {c.name}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>
            <Form.Item name={"description"} label="Mô tả sản phẩm" >
              <TextArea rows={3} placeholder="Mô tả sản phẩm mới" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu thông tin
            </Button>
          </Form>
          <Table rowKey='_id' columns={columns} dataSource={products} pagination={false} />
          <Modal title="chinh sua thon tin danh muc" open={visible} onOk={() => {
            formEdit.submit()
            setVisible(false)
          }} onCancel={() => {
            setVisible(false)
          }}>
            <Form
              style={{}}
              form={formEdit}
              initialValues={{
                productCode: '',
                name: '',
                price: '',
                discount: '',
                description: '',
                categoryId: '',
                supplierId: '',
                promotionPosition: ''

              }}
              onFinish={(values) => {

                const SizeS = [
                  {
                    typeSize: "S",
                    amount: values.sizeS
                  },
                  {
                    typeSize: "M",
                    amount: values.sizeM
                  },
                  {
                    typeSize: "L",
                    amount: values.sizeL
                  },
                  {
                    typeSize: "XL",
                    amount: values.sizeXL
                  },
                  {
                    typeSize: "XXL",
                    amount: values.sizeXXL
                  }
                ]
                delete values.sizeM
                delete values.sizeL
                delete values.sizeS
                delete values.sizeXL
                delete values.sizeXXL
                values.size = SizeS

 


                axios.patch('http://localhost:9000/v1/products/' + selectedRow._id, values).then(response => {
                  if (response.status === 200) {
                    setRefresh((f) => f + 1);
                    form.resetFields();
                    notification.info({ message: 'Thông báo', description: 'cập nhật thành công' })
                  }
                })
                console.log(values);
              }}
            >
              <Form.Item rules={[{
                required: true,
                message: "nhập mã sản phẩm"
              }]} name={"productCode"} label="mã sản phẩm" >
                <Input placeholder='product code' />
              </Form.Item>

              <Form.Item rules={[{
                required: true,
                message: "nhập tên sản phẩm"
              }]} name={"name"} label="tên sản phẩm" >
                <Input placeholder='name product' />
              </Form.Item>
              <Form.Item rules={[{
                required: true,
                message: "nhập giá bán"
              }]} name={"price"} label="giá bán" >
                <InputNumber style={{ marginLeft: 40 }} min={0} placeholder="0" addonAfter='VND' />
              </Form.Item>
              <Form.Item name={"discount"} label="giảm giá" >
                <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='%' />
              </Form.Item>

              <Form.Item name={"sizeM"} label="sizeM" >
                <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
              </Form.Item>
              <Form.Item name={"sizeS"} label="sizeS" >
                <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
              </Form.Item>
              <Form.Item name={"sizeL"} label="sizeL" >
                <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
              </Form.Item>
              <Form.Item name={"sizeXL"} label="sizeXL" >
                <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
              </Form.Item>
              <Form.Item name={"sizeXXL"} label="sizeXXL" >
                <InputNumber style={{ marginLeft: 45 }} min={0} placeholder="0" addonAfter='so luong' />
              </Form.Item>

              <Form.Item name={"promotionPosition"} label="promotionPosition">
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: '100%',
                  }}
                  placeholder="Please select"

                  onChange={handleChange}
                  options={optionspromotion}
                />
              </Form.Item>
              <Form.Item name={"categoryId"} rules={[{
                required: true,
                message: "Vui lòng chọn loại hàng hóa!",
              }]} label="loại hàng hóa    ">
                <Select placeholder="Chọn tùy thuộc danh mục" loading={!categories}>
                  {categories &&
                    categories.map((c) => {
                      return (
                        <Select.Option key={c._id} value={c._id}>
                          {c.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Form.Item name={"supplierId"} rules={[{
                required: true,
                message: "Vui lòng chọn nhà phân phối!",
              }]} label="nhà phân phối">
                <Select placeholder="Chọn nhà phân phối" loading={!suppliers}>
                  {suppliers &&
                    suppliers.map((c) => {
                      return (
                        <Select.Option key={c._id} value={c._id}>
                          {c.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
              <Form.Item name={"description"} label="Mô tả sản phẩm" >
                <TextArea rows={3} placeholder="Mô tả sản phẩm mới" />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Lưu thông tin
              </Button>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </div>
  )
}

export default Products



