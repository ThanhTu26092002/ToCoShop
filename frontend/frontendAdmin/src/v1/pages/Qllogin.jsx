import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Space, Select, Layout, InputNumber, Modal, Table, notification, message, Popconfirm, Upload, Cascader, Radio } from 'antd'
import Operation from 'antd/lib/transfer/operation'
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { Content } from "antd/lib/layout/layout";

import TextArea from "antd/lib/input/TextArea";
import axios from "axios";
import { URLQLLogin, WEB_SERVER_UPLOAD_URL } from "../config/constants";
import axiosClient from "../config/axios";
function Slides() {
    const [login, setLogin] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [visible, setVisible] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState(null);
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm()
    const optionspromotion = [];
    optionspromotion.push(
        {
            label: "ADMINISTRATORS",
            value: "administrators",
        },
        {
            label: " MANAGERS",
            value: "managers",
        }
    );
    const columns = [
        {
            title: "Email",
            key: "email",
            dataIndex: "email",
            render: (Text) => {
                return <span style={{ fontWeight: '600' }}>{Text}</span>
            }
        },
        {
            title: "Mật khẩu",
            key: "password",
            dataIndex: "password",
            render: (Text) => {
                return <span style={{ fontWeight: '600' }}>{Text}</span>
            }
        },
        {
            title: "Quyền",
            key: "roles",
            dataIndex: "roles",
            render: (Text) => {
                
                return <span style={{ fontWeight: '600' }}>{Text}</span>
            }
        },
        {
            title: "Trạng thái",
            key: "status",
            dataIndex: "status",
            render: (Text) => {
                return <span style={{ fontWeight: '600' }}>{Text}</span>
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: '10%',
            render: (record) => {
                return (
                    <Space>
                        <Button type='dashed' icon={<EditOutlined />} style={{ fontWeight: '600' }} onClick={() => {
                            setVisible(true)
                            setSelectedRow(record)
                            formEdit.setFieldValue('email', record.email)
                            formEdit.setFieldValue('password', record.password)
                            formEdit.setFieldValue('roles', record.roles)
                            formEdit.setFieldValue('status', record.status)
                            handleClick_EditBtn(record)

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
    const handleOk = () => {
        formEdit.submit();
      };
      const handleCancel = () => {
        setIsModalOpen(false);
      };
    const handleClick_EditBtn = (record) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
        setSelectedId(record._id);

        let fieldsValues = {};
        for (let key in record) {
            fieldsValues[key] = record[key];
        }
        formEdit.setFieldsValue(fieldsValues);
    };
    const handleFinishUpdate = (values) => {
       
        setLoadingBtn(true);
        axiosClient
          .patch(
            `${URLQLLogin}/updateOne/${selectedId}`,
            values
          )
          .then((response) => {
            if (response.status === 200) {
              setIsModalOpen(false);
              setLoading(true);
              setRefresh((e) => !e);
              formEdit.resetFields();
              setSelectedId(null);
    notification.info({
                message: "Thông báo",
                description: "Cập nhật thành công",
              });
            }
          })
          .catch((error) => {
            message.error(
              error.response.data.error.message
                ? error.response.data.error.message
                : error
            );
          })
          .finally(() => {
            setLoadingBtn(false);
          });
      }
    React.useEffect(() => {
        axios.get("http://localhost:9000/v1/login/all").then((response) => {
            setLogin(response.data);
        })
    }, [refresh])
    const handleConfirmDelete = (_id) => {
        axios.delete("http://localhost:9000/v1/login/deleteOne/" + _id).then((response) => {
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
                        onFinish={(values) => {
                            axios.post('http://localhost:9000/v1/login/insertOne', values).then(response => {
                                if (response.status === 201) {
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
                            message: "nhập Email"
                        }]} name={"email"} label="Email" >
                            <Input placeholder='Email' />
                        </Form.Item>
                        <Form.Item rules={[{
                            required: true,
                            message: "nhập Pass"
                        }]} name={"password"} label="Mật khẩu" >
                            <Input placeholder='password' />
                        </Form.Item>
                        <Form.Item name={"roles"} label="Quyền">
                            <Select
                                mode="multiple"
                                allowClear
                                style={{
                                    width: '100%',
                                }}
                                placeholder="Please select"
                                options={optionspromotion}
                            />
                        </Form.Item>
                        <Form.Item name={"status"} label="Trạng thái">
                            <Radio.Group >
                                <Radio value={"ACTIVE"}>Kích hoạt</Radio>
                                <Radio value={"INACTIVE"}>Khóa</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Button type="primary" htmlType="submit">
                            Lưu thông tin
                        </Button>
                    </Form>
                    <Table rowKey='_id' columns={columns} dataSource={login} pagination={false} />
                    <Modal title="chinh sua thong tin slides" open={isModalOpen}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        footer={
                            [
                                <Button key="back" onClick={handleCancel}>
                                    Hủy
                                </Button>,
                                <Button
                                    key="submit"
                                    type="primary"
                                    loading={loadingBtn}
                                    onClick={handleOk}
                                >
                                    Sửa
                                </Button>
                            ]
                        }
                    >
                        <Form
                            
                            form={formEdit}
                            onFinish={handleFinishUpdate}
                        >
                            <Form.Item rules={[{
                                required: true,
                                message: "nhập Email"
                            }]} name={"email"} label="Email" >
                                <Input placeholder='Email' />
                            </Form.Item>
                            <Form.Item rules={[{
                                required: true,
                                message: "nhập Pass"
                            }]} name={"password"} label="Mật khẩu" >
                                <Input placeholder='password' />
                            </Form.Item>
                            <Form.Item name={"roles"} label="Quyền">
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{
                                        width: '100%',
                                    }}
                                    placeholder="Please select"
                                    options={optionspromotion}
                                />
                            </Form.Item>
                            <Form.Item name={"status"} label="Trạng thái">
                                <Radio.Group >
                                    <Radio value={"ACTIVE"}>Kích hoạt</Radio>
                                    <Radio value={"INACTIVE"}>Khóa</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </div>
    )

}
export default Slides