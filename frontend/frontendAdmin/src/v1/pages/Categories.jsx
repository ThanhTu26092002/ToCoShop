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
} from "antd";
import { Content } from "antd/lib/layout/layout";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
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
  const [uploading, setUploading] = useState(false);
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
      sorter: (a, b) => a.name.length - b.name.length,
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
              method="POST"
              showUploadList={false}
              name="file"
              customRequest={(options) => {handleUploadImage(options, record)}}
              // action={(file) => handleUploadImage(file, record)}
              // action={
              //   "http://localhost:9000/v1/categories/categoryImage/" +
              //   record._id
              // }
              headers={{ authorization: "authorization-text" }}
              onChange={(info) => handleChange_UploadOnlyImage(info)}
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
    style: { marginTop: 20 },
    rowKey: "_id",
    locale: {
      triggerDesc: "Giảm dần",
      triggerAsc: "Tăng dần",
      cancelSort: "Hủy sắp xếp",
    },
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

  //
  const handleChange_UploadOnlyImage = (info) => {
    if (info.file.status !== "uploading") {
      setUploading(true);
      console.log("uploading");
    }
    if (info.file.status === "done") {
      console.log("done");
      setRefresh((e) => !e);
      message.success(`${info.file.name} được cập nhật thành công!`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file cập nhật thất bại.`);
    }
    setUploading(false);
  };
  //

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
  // const handleUploadImage = (file, record) => {
  //   console.log(file)
  //   setUploading(true);
  //   let formData = new FormData();
  //   let URL = URLCategory + "/categoryImage/" + record._id;
  //   //If containing an image <=> file !== null
  //   if (!record.imageUrl) {
  //     formData.append("currentImgUrl", null);
  //   } else {
  //     formData.append("currentImgUrl", record.imageUrl);
  //   }
  //   formData.append("file", file);

  //   //POST
  //   axiosClient
  //     .post(URL, formData)
  //     .then((response) => {
  //       if (response.status === 200) {
  //         setRefresh((e) => !e);
  //       }
  //     })
  //     .catch((error) => {
  //       message.error(
  //         error.response.data.error.message
  //           ? error.response.data.error.message
  //           : error
  //       );
  //     })
  //     .finally(() => {
  //       setUploading(false);
  //     });
  // };
  //


  const handleUploadImage = (options, record) => {
    const {onSuccess, onError, file} = options
    let formData = new FormData();
    let URL = URLCategory + "/categoryImage/" + record._id;
    //If containing an image <=> file !== null
    if (!record.imageUrl) {
      formData.append("currentImgUrl", null);
    } else {
      formData.append("currentImgUrl", record.imageUrl);
    }
    formData.append("file", file);

    //POST
    axiosClient
      .post(URL, formData)
      .then((response) => {
        if (response.status === 200) {
          onSuccess("Ok");
          console.log("server res: ", response);
          setRefresh((e) => !e);
        }
      })
      .catch((error) => {
        console.log("Eroor: ", error);
      const err = new Error("Some error");
      onError({ error });
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
      })
      .finally(() => {
        setUploading(false);
      });
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
    setUploading(true);
    //SUBMIT
    let newData = { ...values };

    //POST
    axiosClient
      .post("http://localhost:9000/v1/categories/insertOne", newData)
      .then((response) => {
        if (response.status === 201) {
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
        setUploading(false);
      });
  };
  //
  const handleFinishUpdate = (values) => {
    setUploading(true);
    //The same values so don't need to update
    if (
      values.name === selectedRecord.name &&
      values.description === selectedRecord.description
    ) {
      setIsModalOpen(false);
      formUpdate.resetFields();
      setSelectedId(null);
      setUploading(false);
      return;
    }
    //POST
    axiosClient
      .patch(
        `http://localhost:9000/v1/categories/updateOne/${selectedId}`,
        values
      )
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
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
        setUploading(false);
      });
  };
  const handleConfirmDelete = (_id) => {
    setUploading(true);
    axiosClient
      .delete(URLCategory + "/deleteOne/" + _id)
      .then((response) => {
        if (response.status === 200) {
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
        setRefresh((e) => !e);
        setUploading(false);
      });
  };

  useEffect(() => {
    setUploading(true);
    axiosClient.get(`${URLCategory}`).then((response) => {
      setCategories(response.data.results);
      setUploading(false);
      setTotalDocs(response.data.results.length);
    });
  }, [refresh]);
  //

  return (
    <Layout>
      {uploading ? (
        <Spin tip="Đang xử lý..." size="large"></Spin>
      ) : (
        <Content style={{ padding: 24 }}>
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
              <Button type="primary" htmlType="submit">
                Tạo mới
              </Button>
            </Form.Item>
          </Form>
          <Table
            {...PropsTable}
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
      )}
    </Layout>
  );
}

export default Categories;
