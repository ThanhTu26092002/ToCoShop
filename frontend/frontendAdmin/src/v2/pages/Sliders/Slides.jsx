import React, { useState } from "react";
import { Button, Form, Layout, Modal, notification, message } from "antd";
import { URLSlides } from "../../config/constants";
import axiosClient from "../../config/axios";
import { Content } from "antd/lib/layout/layout";
import { objCompare } from "../../config/helperFuncs";
import CustomFormSlider from "./components/CustomFormSlider";
import CustomTable from "./components/CustomTable";

function Slides() {
  const [slides, setSlides] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBtnCreate, setLoadingBtnCreate] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();

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
    // if (record.status === "INACTIVE") {
    //   setCheck(true);
    // } else {
    //   setCheck(false);
    // }
    let fieldsValues = {};
    for (let key in record) {
      fieldsValues[key] = record[key];
    }
    formEdit.setFieldsValue(fieldsValues);
  };

  const handleFinishCreate = (values) => {
    setLoadingBtnCreate(true);
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
        setLoadingBtnCreate(false);
      });
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
  React.useEffect(() => {
    setLoading(true)
    axiosClient.get("http://localhost:9000/v1/slides/all").then((response) => {
      setSlides(response.data);
    setLoading(false)
    });
  }, [refresh]);

  return (
    <div>
      <Layout>
        <Content>
          <CustomFormSlider
          form={form}
            handleFinish={handleFinishCreate}
            handleCancel={handleCancelCreate}
            loadingBtn={loadingBtnCreate}
            list={list}
          />

          <CustomTable
            loading={loading}
            slides={slides}
            handleUploadImage={handleUploadImage}
            handleClick_EditBtn={handleClick_EditBtn}
            handleConfirmDelete={handleConfirmDelete}
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
            <CustomFormSlider
            form={formEdit}
            handleFinish={handleFinishUpdate}
            loadingBtn={loadingBtn}
            list={list}
          />
          </Modal>
        </Content>
      </Layout>
    </div>
  );
}
export default Slides;
