import React, { useEffect, useState } from "react";
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
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Content } from "antd/lib/layout/layout";
import {
  PropsForm,
  PropsFormItemDetailAddress,
  PropsFormItemEmail,
  PropsFormItemFirstName,
  PropsFormItemLastName,
  PropsFormItemName,
  PropsFormItemPhoneNumber,
  PropsFormItemStatus,
  PropsFormItem_Label_Name,
  PropsTable,
} from "../config/props";
import TextArea from "antd/lib/input/TextArea";
import axios from "axios";
import { URLQLLogin, URLTransportation } from "../config/constants";
import axiosClient from "../config/axios";
import useAuth from "../hooks/useZustand";
import { useNavigate } from "react-router-dom";
import { formatterNumber, objCompare } from "../config/helperFuncs";
import { BoldText, NumberFormatter } from "../components/subComponents";
function Transportations() {
  const navigate = useNavigate();
  const { auth, signOut } = useAuth((state) => state);

  const [totalDocs, setTotalDocs] = useState(0);
  const [transportations, setTransportations] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const columns = [
    {
      title: "Tên",
      key: "name ",
      dataIndex: "name",
      render: (text) => {
        return <BoldText title={text} />;
      },
    },
    {
      title: "Giá vận chuyển",
      key: "price",
      dataIndex: "price",
      render: (text) => {
        return <NumberFormatter text={text} />;
      },
    },
    {
      title: "Tên công ty",
      key: "companyName",
      dataIndex: "companyName",
    },
    {
      title: "Số điện thoại công ty",
      key: "companyPhoneNumber",
      dataIndex: "companyPhoneNumber",
    },
    {
      title: "Email công ty",
      key: "companyEmail",
      dataIndex: "companyEmail",
    },
    {
      title: "Ghi chú",
      key: "note",
      dataIndex: "note",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "5%",
      fixed: "right",
      render: (record) => {
        return (
          <div className="divActs">
            <Button
              icon={<EditOutlined />}
              type="primary"
              title="Chỉnh sửa"
              onClick={() => handleClick_EditBtn(record)}
            ></Button>
            <Popconfirm
              overlayInnerStyle={{ width: 300 }}
              title="Bạn muốn xóa không ?"
              okText="Đồng ý"
              cancelText="Đóng"
              onConfirm={() => handleConfirmDelete(record._id)}
            >
              <Button
                icon={<DeleteOutlined />}
                type="primary"
                danger
                loading={loadingBtn}
                style={{ fontWeight: 600 }}
                onClick={() => {}}
                title="Xóa"
              ></Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  const handleOk = () => {
    formEdit.submit();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    formEdit.resetFields();
  };
  const handleFinishCreate = (values) => {
    setLoadingBtn(true);
    //SUBMIT
    let newData = { ...values };
    console.log(newData);
    //POST
    axiosClient
      .post(`${URLTransportation}/insertOne`, newData)
      .then((response) => {
        if (response.status === 201) {
          setLoading(true);
          setRefresh((e) => !e);
          form.resetFields();
          notification.info({
            message: "Thông báo",
            description: "Thêm mới thành công",
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
  };
  const handleClick_EditBtn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);

    let fieldsValues = { ...record };
    formEdit.setFieldsValue(fieldsValues);
  };
  const handleFinishUpdate = (values) => {
    //Kiểm tra trùng dữ liệu cũ thì ko làm gì cả
    const checkChangedData = objCompare(values, selectedRecord);

    //Thông tin fomUpdate không thay đổi thì checkChangedData=null ko cần làm gì cả
    if (!checkChangedData) {
      setIsModalOpen(false);
      form.resetFields();
      setSelectedId(null);
      return;
    }
    setLoadingBtn(true);
    axiosClient
      .patch(`${URLTransportation}/updateOne/${selectedId}`, checkChangedData)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
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
  };

  const handleCancelCreate = () => {
    form.resetFields();
  };
  const handleConfirmDelete = (_id) => {
    setLoadingBtn(true);
    axiosClient
      .delete(`${URLTransportation}/deleteOne/` + _id)
      .then((response) => {
        if (response.status === 200) {
          setRefresh((f) => f + 1);
          message.info("Xóa thành công");
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
  };
  useEffect(() => {
    axios.get(`${URLTransportation}`).then((response) => {
      let tmp = response.data.results;
      setTotalDocs(tmp.length);
      setTransportations(tmp);
    });
  }, [refresh]);

  return (
    <div>
      <Layout>
        <Content>
          <Form
            {...PropsForm}
            form={form}
            name="form"
            onFinish={handleFinishCreate}
            onFinishFailed={() => {
              console.error("Error at onFinishFailed at formCreate");
            }}
          >
            <Form.Item
              {...PropsFormItemName({
                labelTitle: "Tên phương thức ",
                nameTitle: "name",
              })}
            >
              <Input placeholder="Tên phương thức " />
            </Form.Item>
            <Form.Item
              {...PropsFormItem_Label_Name({
                label: `Giá tiền`,
                name: "price",
              })}
              rules={[
                {
                  required: true,
                  message: "Chưa nhập giá vận chuyển",
                },
              ]}
              hasFeedback
            >
              <InputNumber
                defaultValue={0}
                formatter={formatterNumber}
                style={{ minWidth: 120, maxWidth: 360 }}
                min={0}
                addonAfter="VNĐ"
              />
            </Form.Item>
            <Form.Item
              {...PropsFormItemName({
                labelTitle: "Tên công ty vận chuyển",
                nameTitle: "companyName",
              })}
              hasFeedback
            >
              <Input placeholder="Tên công ty vận chuyển" />
            </Form.Item>
            <Form.Item
              {...PropsFormItemPhoneNumber({
                require: true,
                labelTitle: "Số điện thoại công ty",
                nameTitle: "companyPhoneNumber",
              })}
              hasFeedback
            >
              <Input placeholder="Số điện thoại công ty vận chuyển" />
            </Form.Item>
            <Form.Item
              {...PropsFormItemEmail({
                nameTitle: "companyEmail",
                labelTitle: "Email công ty",
              })}
              hasFeedback
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item
              {...PropsFormItem_Label_Name({ label: "Ghi chú", name: "note" })}
              rules={[{ max: 200, message: "Ghi chú không thể quá 200 kí tự" }]}
              hasFeedback
            >
              <TextArea rows={3} placeholder="Ghi chú..." />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Space wrap>
                <Button type="primary" danger onClick={handleCancelCreate}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loadingBtn}>
                  Tạo mới
                </Button>
              </Space>
            </Form.Item>
          </Form>
          <Table
            {...PropsTable({ isLoading: loading })}
            columns={columns}
            dataSource={transportations}
            pagination={{
              total: totalDocs,
              showTotal: (totalDocs, range) =>
                `${range[0]}-${range[1]} of ${totalDocs} items`,
              defaultPageSize: 10,
              defaultCurrent: 1,
            }}
          />
          <Modal
            title="Cập nhật thông tin"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
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
              </Button>,
            ]}
          >
            <Form
              {...PropsForm}
              form={formEdit}
              onFinish={handleFinishUpdate}
              initialValues={{ note: "" }}
            >
              <Form.Item
                {...PropsFormItemName({
                  labelTitle: "Tên phương thức ",
                  nameTitle: "name",
                })}
              >
                <Input placeholder="Tên phương thức " />
              </Form.Item>
              <Form.Item
                {...PropsFormItem_Label_Name({
                  label: `Giá tiền`,
                  name: "price",
                })}
                rules={[
                  {
                    required: true,
                    message: "Chưa nhập giá vận chuyển",
                  },
                ]}
                hasFeedback
              >
                <InputNumber
                  defaultValue={0}
                  formatter={formatterNumber}
                  style={{ minWidth: 120, maxWidth: 360 }}
                  min={0}
                  addonAfter="VNĐ"
                />
              </Form.Item>
              <Form.Item
                {...PropsFormItemName({
                  labelTitle: "Tên công ty vận chuyển",
                  nameTitle: "companyName",
                })}
                hasFeedback
              >
                <Input placeholder="Tên công ty vận chuyển" />
              </Form.Item>
              <Form.Item
                {...PropsFormItemPhoneNumber({
                  require: true,
                  labelTitle: "Số điện thoại công ty",
                  nameTitle: "companyPhoneNumber",
                })}
                hasFeedback
              >
                <Input placeholder="Số điện thoại công ty vận chuyển" />
              </Form.Item>
              <Form.Item
                {...PropsFormItemEmail({
                  nameTitle: "companyEmail",
                  labelTitle: "Email công ty",
                })}
                hasFeedback
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                {...PropsFormItem_Label_Name({
                  label: "Ghi chú",
                  name: "note",
                })}
                rules={[
                  { max: 200, message: "Ghi chú không thể quá 200 kí tự" },
                ]}
                hasFeedback
              >
                <TextArea rows={3} placeholder="Ghi chú..." />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </div>
  );
}
export default Transportations;
