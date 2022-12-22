import React, { useState } from "react";
import {
  Button,
  Form,
  Space,
  Select,
  Layout,
  Modal,
  Table,
  notification,
  message,
  Popconfirm,
  Upload,
  Radio,
} from "antd";
import {
  PropsForm,
  PropsFormItem_Label_Name,
  PropsTable,
} from "../../config/props";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { URLSlides, WEB_SERVER_UPLOAD_URL } from "../../config/constants";
import axiosClient from "../../config/axios";
import { Content } from "antd/lib/layout/layout";
import { beforeUpload, objCompare } from "../../config/helperFuncs";
import LabelCustomization, {
  ColorStatus,
} from "../../components/subComponents";
import CustomFormSlider from "./components/CustomFormSlider";

function Slides() {
  const [slides, setSlides] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [check, setCheck] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const columns = [
    {
      title: "Hình ảnh",
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
      title: "Tiêu đề ",
      key: "title",
      dataIndex: "title",
      render: (Text) => {
        return <span style={{ fontWeight: "600" }}>{Text}</span>;
      },
    },
    {
      title: () => {
        return "Thứ tự";
      },
      width: "10%",
      key: "sortOrder",
      dataIndex: "sortOrder",
    },
    {
      title: () => {
        return "Trạng thái";
      },
      width: "10%",
      key: "status",
      dataIndex: "status",
      render: (text) => {
        return <ColorStatus status={text} />;
      },
    },
    {
      title: "Mô tả",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "Thao tác",
      fixed: "right",
      key: "actions",
      width: "10%",
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
            <Button
              type="dashed"
              icon={<EditOutlined />}
              style={{ fontWeight: "600" }}
              onClick={() => {
                handleClick_EditBtn(record);
              }}
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
                type="danger"
                style={{ fontWeight: 600 }}
                onClick={() => {}}
                title="Xóa"
              ></Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  var orderList = [1, 2, 3, 4, 5];
  Array.prototype.except = function (val) {
    return this.filter(function (x) {
      return x !== val;
    });
  };
  slides &&
    slides.map((c) => {
      return (orderList = orderList.except(c.sortOrder));
    });
  orderList.unshift(0);
  // Mọi slides dù active or inactive đều có thể có số thứ tự là O
  var list = orderList.map((item) => {
    return {
      label: item,
      value: item,
    };
  });

  const handleClick_EditBtn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);
    if (record.status === "INACTIVE") {
      setCheck(true);
    } else {
      setCheck(false);
    }
    let fieldsValues = {};
    for (let key in record) {
      fieldsValues[key] = record[key];
    }
    formEdit.setFieldsValue(fieldsValues);
  };
  const handleFinishUpdate = (values) => {
    const oldData = {
      ...selectedRecord,
    };
    const newData = {
      ...values,
    };
    const checkChangedData = objCompare(newData, oldData);
    //Thông tin fomUpdate không thay đổi thì checkChangedData=null ko cần làm gì cả
    if (!checkChangedData) {
      setIsModalOpen(false);
      formEdit.resetFields();
      setSelectedId(null);
      return;
    }
    setLoadingBtn(true);
    axiosClient
      .patch(`${URLSlides}/${selectedId}`, values)
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
  };
  const handleCancelCreate = () => {
    form.resetFields();
  };
  const handleOk = () => {
    formEdit.submit();
  };
  const handleCancel = () => {
    formEdit.resetFields();
    setIsModalOpen(false);
  };
  const handleUploadImage = (options, record) => {
    setLoading(true);
    const { file } = options;
    let formData = new FormData();
    let URL = URLSlides + "/slidesImage/" + record._id;
    //If containing an image <=> file !== null
    if (!record.imageUrl) {
      formData.append("currentImgUrl", null);
    } else {
      formData.append("currentImgUrl", record.imageUrl);
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

  React.useEffect(() => {
    axiosClient.get("http://localhost:9000/v1/slides/all").then((response) => {
      setSlides(response.data);
    });
  }, [refresh]);
  const handleConfirmDelete = (_id) => {
    setLoading(true);
    axiosClient
      .delete("http://localhost:9000/v1/slides/" + _id)
      .then((response) => {
        if (response.status === 200) {
          setRefresh((f) => f + 1);
          message.info("Xóa thành công");
        }
        setLoading(false);
      });
  };
  return (
    <div>
      <Layout>
        <Content>
          <Form
            {...PropsForm}
            form={form}
            initialValues={{
              title: "",
              description: "",
            }}
            onFinish={(values) => {
              setLoadingBtn(true);
              axiosClient
                .post("http://localhost:9000/v1/slides", values)
                .then((response) => {
                  if (response.status === 200) {
                    setRefresh((f) => f + 1);
                    form.resetFields();
                    notification.info({
                      message: "Thông báo",
                      description: "Thêm mới thành công",
                    });
                  }
                  setLoadingBtn(false);
                });
            }}
          >
            <CustomFormSlider  form={form}/>
          
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
            rowKey="_id"
            columns={columns}
            dataSource={slides}
            pagination={false}
          />
          <Modal
            title="Chỉnh sửa thông tin Slides"
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
            <Form form={formEdit} onFinish={handleFinishUpdate}>
              <CustomFormSlider />
              <Form.Item
                {...PropsFormItem_Label_Name({
                  labelTitle: "Trạng thái",
                  nameTitle: "status",
                })}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn trạng thái",
                  },
                ]}
              >
                <Radio.Group
                  onChange={(e) => {
                    if (e.target.value === "INACTIVE") {
                      setCheck(true);
                      formEdit.setFieldsValue({ sortOrder: 0 });
                    } else {
                      setCheck(false);
                      formEdit.setFieldsValue({ sortOrder: 0 });
                    }
                  }}
                >
                  <Radio value={"ACTIVE"}>Hiển thị</Radio>
                  <Radio value={"INACTIVE"}>Không hiển thị</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label={<LabelCustomization title={"Thu tu"} />}
                name="sortOrder"
              >
                <Select
                  style={{ width: 120 }}
                  allowClear
                  options={list}
                  disabled={check}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </div>
  );
}
export default Slides;
