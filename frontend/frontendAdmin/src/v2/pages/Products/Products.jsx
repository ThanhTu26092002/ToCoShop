import React, { useEffect, useState } from "react";
import { Button, Form, Layout, Modal, notification, message } from "antd";
import { Content } from "antd/lib/layout/layout";
import { URLProduct } from "../../config/constants";
import axiosClient from "../../config/axios";
import CustomTable from "./components/CustomTable";
import CustomFormProduct from "./components/CustomFormProduct";
function Products() {
  const [categories, setCategories] = useState(null);
  const [suppliers, setSuppliers] = useState(null);
  const [isCreate, setIsCreate] = useState(false);
  const [products, setProducts] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [totalDocs, setTotalDocs] = useState(0);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();

  const handleUploadImage = (options, record) => {
    setLoading(true);
    const { file } = options;
    let formData = new FormData();
    let URL = URLProduct + "/productImage/" + record._id;
    //If containing an image <=> file !== null
    if (!record.coverImage) {
      formData.append("currentImgUrl", null);
    } else {
      console.log(record.coverImage);
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
          setRefresh((f) => f + 1);
          message.success(`Cập nhật hình ảnh thành công!`);
        }
      })
      .catch((error) => {
        message.error(`Cập nhật hình ảnh thất bại.`);
      })
      .finally(() => {
        setLoading(false);
      });
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
      .patch(`${URLProduct}/updateOne/${selectedId}`, values)
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
  const handleOk = () => {
    formEdit.submit();
  };
  const handleCancel = () => {
    formEdit.resetFields();
    setIsModalOpen(false);
  };

  const handleConfirmDelete = (_id) => {
    setLoading(true);
    axiosClient
      .delete(URLProduct + "/deleteOne/" + _id)
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
        setRefresh((f) => f + 1);
      })
      .catch((error) => {
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFinishCreate = (values) => {
    setLoadingBtn(true);
    axiosClient
      .post(`${URLProduct}/insertOne`, values)
      .then((response) => {
        if (response.status === 201) {
          setIsCreate(false);
          setRefresh((f) => f + 1);
          form.resetFields();
          notification.info({
            message: "Thông báo",
            description: "thêm mới thành công",
          });
        }
      })
      .catch((error) => {
        message.error(
          error.response?.data?.error?.message
            ? error.response.data.error.message
            : error
        );
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  const handleCancelCreate = () => {
    setIsCreate(false);
    form.resetFields();
  };
  const handleCreateBtn = () => {
    setIsCreate(true);
  };
  const handleMouseLeaveCreate = () => {
    setIsCreate(false);
    form.resetFields();
  };

  useEffect(() => {
    setLoading(true);
    axiosClient.get(`${URLProduct}`).then((response) => {
      setProducts(response.data.results);
      setTotalDocs(response.data.results.length);
      setLoading(false);
    });
  }, [refresh]);

  useEffect(() => {
    axiosClient.get("http://localhost:9000/v1/categories").then((response) => {
      setCategories(response.data.results);
    });
  }, []);
  useEffect(() => {
    axiosClient.get("http://localhost:9000/v1/suppliers").then((response) => {
      setSuppliers(response.data.results);
    });
  }, []);
  return (
    <div>
      <Layout>
        <Content>
          {!isCreate && (
            <Button
              type="primary"
              onClick={handleCreateBtn}
              style={{ marginBottom: 24 }}
            >
              Tạo mới
            </Button>
          )}
          {isCreate && (
            <CustomFormProduct
              form={form}
              handleFinish={handleFinishCreate}
              handleCancel={handleCancelCreate}
              loadingBtn={loadingBtn}
              categories={categories}
              suppliers={suppliers}
            />
          )}

          <CustomTable
            handleUploadImage={handleUploadImage}
            products={products}
            categories={categories}
            suppliers={suppliers}
            handleMouseLeaveCreate={handleMouseLeaveCreate}
            totalDocs={totalDocs}
            handleClick_EditBtn={handleClick_EditBtn}
            handleConfirmDelete={handleConfirmDelete}
            loading={loading}
          />
          <Modal
            title="Chỉnh sửa thông tin sản phẩm"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width="900px"
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
            <CustomFormProduct
              form={formEdit}
              handleFinish={handleFinishUpdate}
              loadingBtn={loadingBtn}
              categories={categories}
              suppliers={suppliers}
            />
          </Modal>
        </Content>
      </Layout>
    </div>
  );
}

export default Products;
