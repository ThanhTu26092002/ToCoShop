import React, { useEffect, useState } from "react";
import "../../css/CommonStyle.css";
import {
  Button,
  Layout,
  Table,
  Form,
  Popconfirm,
  message,
  notification,
  Modal,
  Upload,
  Space,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { URLSupplier, WEB_SERVER_UPLOAD_URL } from "../../config/constants";
import { ImgIcon, BoldText } from "../../components/subComponents";
import axiosClient from "../../config/axios";
import {
  PropsForm, PropsTable,
} from "../../config/props";
import { beforeUpload } from "../../config/helperFuncs";
import CustomFormSupplier from "./components/CustomFormSupplier";

function Suppliers() {
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
        return <BoldText title={"Nhà phân phối "} />;
      },
      key: "name",
      dataIndex: "name",
      width: "10%",
      fixed: "left",
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
        return <BoldText title={"Email"} />;
      },
      key: "email",
      dataIndex: "email",
      width: "20%",
    },
    {
      title: () => {
        return <BoldText title={"Số điện thoại"} />;
      },
      key: "phoneNumber",
      dataIndex: "phoneNumber",
      width: "10%",
    },
    {
      title: () => {
        return <BoldText title={"Địa chỉ"} />;
      },
      key: "address",
      dataIndex: "address",
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

  const handleUploadImage = (options, record) => {
    setLoading(true);
    const { file } = options;
    let formData = new FormData();
    let URL = URLSupplier + "/supplierImage/" + record._id;
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
    formUpdate.resetFields();
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
    console.log(newData);
    //POST
    axiosClient
      .post(`${URLSupplier}/insertOne`, newData)
      .then((response) => {
        if (response.status === 201) {
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
      values.email === selectedRecord.email &&
      values.phoneNumber === selectedRecord.phoneNumber &&
      values.address === selectedRecord.address
    ) {
      setIsModalOpen(false);
      formUpdate.resetFields();
      setSelectedId(null);
      return;
    }
    setLoadingBtn(true);
    //POST
    axiosClient
      .patch(`${URLSupplier}/updateOne/${selectedId}`, values)
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
      .delete(URLSupplier + "/deleteOne/" + _id)
      .then((response) => {
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
    axiosClient.get(`${URLSupplier}`).then((response) => {
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
            <CustomFormSupplier />
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
          {...PropsTable({isLoading: loading, isLoadingBtn: loadingBtn, title: "Danh sách nhà phân phối"})}
          onRow={() => {
            return { onClick: handleMouseLeaveCreate };
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
            <CustomFormSupplier />
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}

export default Suppliers;
