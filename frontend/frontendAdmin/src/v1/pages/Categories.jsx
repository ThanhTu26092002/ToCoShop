import React, { useEffect, useState } from "react";
import "../css/CommonStyle.css";

import {
  Button,
  Layout,
  Table,
  Form,
  Input,
  Popconfirm,
  message,
  notification,
  Modal,
  Upload,
  Spin,
  Space,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import {
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";

import { URLCategory, WEB_SERVER_UPLOAD_URL } from "../config/constants";
import LabelCustomization, {
  ImgIcon,
  BoldText,
  TitleTable,
} from "../components/subComponents";
import axiosClient from "../config/axios";

function Categories() {
  const [isCreate, setIsCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState({});

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const columns = [
    {
      title: () => {
        return <BoldText title={"Danh mục "} />;
      },
      key: "name",
      dataIndex: "name",
      width: "10%",
      fixed: "left",
      // defaultSortOrder: 'ascend',
      // sorter: (a, b) => a.name.length - b.name.length,
      render: (text) => {
        return <BoldText title={text} />;
      },
    },
    {
      title: () => {
        return <BoldText title={"Hình ảnh"} />;
      },
      key: "imageUrl",
      dataIndex: "imageUrl",
      width: "100px",
      render: (text) => {
        return (
          <div className="loadImg">
            <img
              src={
                text && text !== "null"
                  ? `${WEB_SERVER_UPLOAD_URL}${text}`
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
      title: () => {
        return <BoldText title={"Mô tả"} />;
      },
      key: "description",
      dataIndex: "description",
    },
    {
      title: () => {
        return <BoldText title={"Thao tác"} />;
      },
      key: "actions",
      width: "9%",
      fixed: "right",
      render: (record) => {
        return (
          <div className="divActs">
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
                icon={<ImgIcon />}
                style={{ backgroundColor: "#1890ff" }}
              ></Button>
            </Upload>
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
  //

  //Begin: Props for components
  const PropsTable = {
    loading: {
      indicator: <Spin />,
      spinning: loading || loadingBtn,
    },
    style: { marginTop: 20 },
    rowKey: "_id",
    bordered: true,
    size: "small",
    scroll: { x: 1500, y: 400 },
    title: () => {
      return <TitleTable title="danh sách danh mục hàng hóa" />;
    },
    footer: () =>
      "Nếu có vấn đề khi tương tác với hệ thống, xin vui lòng liên hệ số điện thoại 002233442",
  };

  const PropsForm = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    initialValues: { name: "", description: "", file: null },
    autoComplete: "off",
  };

  const PropsFormItemName = {
    label: <LabelCustomization title={"Tên danh mục"} />,
    name: "name",
    rules: [
      {
        required: true,
        message: "Vui lòng nhập tên danh mục!",
      },
      {
        max: 50,
        message: "Tên danh mục không quá 50 kí tự!",
      },
      {
        whitespace: true,
        message: "Tên danh mục không thể là khoảng trống",
      },
    ],
  };

  const PropsFormItemDescription = {
    label: <LabelCustomization title={"Mô tả danh mục"} />,
    name: "description",
    rules: [
      {
        max: 500,
        message: "Phần mô tả danh mục không quá 500 kí tự!",
      },
    ],
  };

  //End: Props for components

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
  //

  const handleUploadImage = (options, record) => {
    setLoading(true);
    const { file } = options;
    let formData = new FormData();
    let URL = URLCategory + "/categoryImage/" + record._id;
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
          setRefresh((e) => !e);
          message.success(`Cập nhật hình ảnh thành công!`);
        }
      })
      .catch((error) => {
        message.error(`Cập nhật hình ảnh thất bại.`);
        setLoading(false);
      })
      .finally(() => {});
  };

  const handleOk = () => {
    formUpdate.submit();
  };
  //

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  //
  const handleClick_EditBtn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);
    let fieldsValues = {};
    for (let key in record) {
      fieldsValues[key] = record[key];
    }
    formUpdate.setFieldsValue(fieldsValues);
  };

  const handleFinishCreate = (values) => {
    setLoadingBtn(true);
    //SUBMIT
    let newData = { ...values };

    //POST
    axiosClient
      .post(`${URLCategory}/insertOne`, newData)
      .then((response) => {
        if (response.status === 201) {
          setLoading(true);
          setIsCreate(false);
          setRefresh((e) => !e);
          formCreate.resetFields();
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
  //
  const handleFinishUpdate = (values) => {
    //The same values so don't need to update
    if (
      values.name === selectedRecord.name &&
      values.description === selectedRecord.description
    ) {
      setIsModalOpen(false);
      formUpdate.resetFields();
      setSelectedId(null);
      return;
    }
    setLoadingBtn(true);
    //POST
    axiosClient
      .patch(
        `${URLCategory}/updateOne/${selectedId}`,
        values
      )
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
          setLoading(true);
          setRefresh((e) => !e);
          formUpdate.resetFields();
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
  const handleConfirmDelete = (_id) => {
    setLoading(true);
    axiosClient
      .delete(URLCategory + "/deleteOne/" + _id)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          if (response.data?.noneExist) {
            console.log("test error");
            message.warning(response.data.noneExist);
          } else {
            message.info("Xóa thành công");
          }
        }
        setRefresh((e) => !e);
      })
      .catch((error) => {
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
        setLoading(false);
      })
      .finally(() => {});
  };

  const handleCreateBtn = () => {
    setIsCreate(true);
  };
  const handleCancelCreate = () => {
    formCreate.resetFields();
    setIsCreate(false);
  };

  const handleMouseLeaveCreate = () => {
    setIsCreate(false);
    formCreate.resetFields();
  };

  useEffect(() => {
    setLoading(true);
    axiosClient.get(`${URLCategory}`).then((response) => {
      setCategories(response.data.results);
      setLoading(false);
      setTotalDocs(response.data.results.length);
    });
  }, [refresh]);
  //

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        {!isCreate && (
          <Button type="primary" onClick={handleCreateBtn}>
            Tạo mới
          </Button>
        )}
        {isCreate && (
          <Form
            {...PropsForm}
            form={formCreate}
            name="formCreate"
            onFinish={handleFinishCreate}
            onFinishFailed={() => {
              console.error("Error at onFinishFailed at formCreate");
            }}
          >
            <Form.Item {...PropsFormItemName}>
              <Input placeholder="Tên danh mục mới" />
            </Form.Item>

            <Form.Item {...PropsFormItemDescription}>
              <TextArea rows={3} placeholder="Mô tả danh mục mới" />
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
        )}
        <Table
          {...PropsTable}
          onRow={() =>{
            return {onClick: handleMouseLeaveCreate}
          }}
          columns={columns}
          dataSource={categories}
          pagination={{
            total: totalDocs,
            showTotal: (totalDocs, range) =>
              `${range[0]}-${range[1]} of ${totalDocs} items`,
            defaultPageSize: 10,
            defaultCurrent: 1,
          }}
        />
        <Modal
          title="Chỉnh sửa thông tin danh mục"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          width={800}
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
            form={formUpdate}
            name="formUpdate"
            onFinish={handleFinishUpdate}
            onFinishFailed={() => {
              // message.info("Error at onFinishFailed at formUpdate");
              console.error("Error at onFinishFailed at formUpdate");
            }}
          >
            <Form.Item {...PropsFormItemName}>
              <Input placeholder="Tên danh mục " />
            </Form.Item>

            <Form.Item {...PropsFormItemDescription}>
              <TextArea rows={3} placeholder="Mô tả danh mục " />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}

export default Categories;
