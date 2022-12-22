import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Space,
  Layout,
  Modal,
  Table,
  notification,
  message,
  Popconfirm,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Content } from "antd/lib/layout/layout";
import { PropsForm, PropsTable } from "../../config/props";
import { URLTransportation } from "../../config/constants";
import axiosClient from "../../config/axios";
import { objCompare } from "../../config/helperFuncs";
import { BoldText, NumberFormatter } from "../../components/subComponents";
import CustomFormTransportation from "./components/CustomFormTransportation";
import CustomTable from "./components/CustomTable";
function Transportations() {
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
    //POST
    axiosClient
      .post(`${URLTransportation}/insertOne`, newData)
      .then((response) => {
        if (response.status === 201) {
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
    setLoading(true);
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
        setLoading(false);
      });
  };
  useEffect(() => {
    axiosClient.get(`${URLTransportation}`).then((response) => {
      let tmp = response.data.results;
      setTotalDocs(tmp.length);
      setTransportations(tmp);
    });
  }, [refresh]);

  return (
    <div>
      <Layout>
        <Content>
          <CustomFormTransportation
            form={form}
            loadingBtn={loadingBtn}
            handleFinish={handleFinishCreate}
            handleCancel={handleCancelCreate}
          />
          <CustomTable
            loading={loading}
            loadingBtn={loadingBtn}
            transportations={transportations}
            totalDocs={totalDocs}
            handleClick_EditBtn={handleClick_EditBtn}
            handleConfirmDelete={handleConfirmDelete}
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
            <CustomFormTransportation
              form={formEdit}
              loadingBtn={loadingBtn}
              handleFinish={handleFinishUpdate}
            />
          </Modal>
        </Content>
      </Layout>
    </div>
  );
}
export default Transportations;
