import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Space, Select, Layout, InputNumber, Modal, Table, notification, message, Popconfirm, Upload, Cascader, Radio } from 'antd'
import Operation from 'antd/lib/transfer/operation'
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { Content } from "antd/lib/layout/layout";
import TextArea from "antd/lib/input/TextArea";
import axios from "axios";
import { URLSlides, WEB_SERVER_UPLOAD_URL } from "../config/constants";
import axiosClient from "../config/axios";

function Slides() {
  const [slides, setSlides] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm()
  const optionssortOrder = [];
  optionssortOrder.push(
    {
      label: 0,
      value: 0,
    },
    {
      label: 1,
      value: 1,
    },
    {
      label: 2,
      value: 2,
    },
    {
      label: 3,
      value: 3,
    },
    {
      label: 4,
      value: 4,
    },
    {
      label: 5,
      value: 5,
    },

  );
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
    let URL = URLSlides + "/slidesImage/" + record._id;
    //If containing an image <=> file !== null
    if (!record.imageUrl) {
      formData.append("coverImage", null);
    } else {
      formData.append("coverImage", record.imageUrl);
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
      .finally(() => {});
  };
  const columns = [
    {
      title: "hình ảnh",
      key: "imageUrl",
      dataIndex: "imageUrl",
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
      title: "Tên sản phẩm ",
      key: "title",
      dataIndex: "title",
      
      // defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.length - b.name.length,
      render: (Text) => {
        return <span style={{ fontWeight: '600' }}>{Text}</span>
      }
    },
    {
      title: () => {
        return "thứ tự";
      },
      key: "sortOrder",
      dataIndex: "sortOrder",
      render: (text) => {
        return <span style={{ fontWeight: '600' }}>{text}</span>
      },
    },
    {
      title: () => {
        return "trạng thái";
      },
      key: "status",
      dataIndex: "status",
      render: (text) => {
        return <span style={{ fontWeight: '600' }}>{text}</span>
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
              formEdit.setFieldValue('title', record.title)
              formEdit.setFieldValue('description', record.description)
              formEdit.setFieldValue('sortOrder', record.sortOrder)
              formEdit.setFieldValue('status', record.status)
              

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
  React.useEffect(() => {
    axios.get("http://localhost:9000/v1/slides").then((response) => {
      setSlides(response.data);

    })
  }, [refresh])
  const handleConfirmDelete = (_id) => {
    axios.delete("http://localhost:9000/v1/slides/" + _id).then((response) => {
      if (response.status === 200) {
        setRefresh((f) => f + 1);
        message.info("Xóa thành công");
      }
    });
  };
  return (
    <div>
      <Layout>
        <Content>
          <Form
            style={{ marginLeft: 400 }}
            form={form}
            initialValues={{
              title:'',
              description:'',
              sortOrder:'',
              status:''
            }}
            onFinish={(values) => {
              axios.post('http://localhost:9000/v1/slides', values).then(response => {
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
              message: "nhập tiêu đề"
            }]} name={"title"} label="tiêu đề" >
              <Input placeholder='tiêu đề' />
            </Form.Item>
            <Form.Item name={"description"} label="Mô tả" >
              <TextArea rows={3} placeholder="Mô tả" />
            </Form.Item>
            <Form.Item name={"sortOrder"} label="thứ tự">
              <Select
                style={{ width: 120 }}
                allowClear
                options={optionssortOrder}
              />
            </Form.Item>
            <Form.Item name={"status"} label="trạng thái">
              <Radio.Group  >
                <Radio value={"ACTIVE"}>hiển thị</Radio>
                <Radio value={"INACTIVE"}>không hiển thị</Radio>
              </Radio.Group>
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu thông tin
            </Button>
          </Form>
          <Table rowKey='_id' columns={columns} dataSource={slides} pagination={false} />
          <Modal title="chinh sua thong tin slides" open={visible} onOk={() => {
            formEdit.submit()
            setVisible(false)
          }} onCancel={() => {
            setVisible(false)
          }}>
            <Form
            
            form={formEdit}
            onFinish={(values) => {
              axios.patch('http://localhost:9000/v1/slides/' + selectedRow._id, values).then(response => {
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
              message: "nhập tiêu đề"
            }]} name={"title"} label="tiêu đề" >
              <Input placeholder='tiêu đề' />
            </Form.Item>
            <Form.Item name={"description"} label="Mô tả" >
              <TextArea rows={3} placeholder="Mô tả" />
            </Form.Item>
            <Form.Item name={"sortOrder"} label="thứ tự">
              <Select
                style={{ width: 120 }}
                allowClear
                options={optionssortOrder}
              />
            </Form.Item>
            <Form.Item name={"status"} label="trạng thái">
              <Radio.Group  >
                <Radio value={"ACTIVE"}>hiển thị</Radio>
                <Radio value={"INACTIVE"}>không hiển thị</Radio>
              </Radio.Group>
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
export default Slides