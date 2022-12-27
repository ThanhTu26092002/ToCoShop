import React, { useEffect, useState } from "react";
import { Button, Form, Layout, Modal, notification, message } from "antd";
import { Content } from "antd/lib/layout/layout";
import { URLQLLogin } from "../../config/constants";
import axiosClient from "../../config/axios";
import useAuth from "../../hooks/useZustand";
import { useNavigate } from "react-router-dom";
import { objCompare } from "../../config/helperFuncs";
import CustomTable from "./components/CustomTable";
import CustomFormLogin from "./components/CustomFormLogin";
function QLLogins() {
  const navigate = useNavigate();
  const { auth, signOut } = useAuth((state) => state);

  const [totalDocs, setTotalDocs] = useState(0);
  const [login, setLogin] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [loadingBtnCreate, setLoadingBtnCreate] = useState(false);
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
  const handleClick_EditBtn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);

    let fieldsValues = {};
    for (let key in record) {
      fieldsValues[key] = record[key];
    }
    fieldsValues.confirm = record.password;
    formEdit.setFieldsValue(fieldsValues);
  };
  const handleFinishUpdate = (values) => {
    //Kiểm tra trùng dữ liệu cũ thì ko làm gì cả
    const tmp = {
      email: values.email,
      password: values.password,
      roles: values.roles,
      status: values.status,
    };
    const checkChangedData = objCompare(tmp, selectedRecord);

    //Thông tin fomUpdate không thay đổi thì checkChangedData=null ko cần làm gì cả
    if (!checkChangedData) {
      setIsModalOpen(false);
      form.resetFields();
      setSelectedId(null);
      return;
    }
    //Nếu email được thay đổi thì ta phải truyền thêm một oldEmail chứa email hiện tại để truyền qua api nhằm tìm và thay thế email mới bên collection Logins
    if (checkChangedData.email) {
      checkChangedData.oldEmail = selectedRecord.email;
    }
    setLoadingBtn(true);
    axiosClient
      .patch(`${URLQLLogin}/updateOne/${selectedId}`, checkChangedData)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
          setLoadingBtn(false);
          setRefresh((e) => !e);
          formEdit.resetFields();
          setSelectedId(null);

          if (checkChangedData.email) {
            //Lấy uid từ hook useAuth để xóa auth nếu người cập nhật chính tài khoản login của họ
            const uidCheck = auth.payload.uid;
            if (uidCheck === selectedId) {
              notification.info({
                message: "Thông báo",
                description: "Cập nhật thành công, vui lòng đăng nhập lại",
              });
              setTimeout(() => {
                signOut();
                navigate("/login");
              }, 3000);
              return;
            }
          }

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
      .delete(`${URLQLLogin}/deleteOne/` + _id)
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

  const handleFinishCreate = (values) => {
    setLoadingBtnCreate(true);
    if (values.confirm) {
      delete values.confirm;
    }
    axiosClient
      .post(`${URLQLLogin}/insertOne`, values)
      .then((response) => {
        if (response.status === 201) {
          setRefresh((f) => f + 1);
          form.resetFields();
          notification.info({
            message: "Thông báo",
            description: "Thêm mới thành công",
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
        setLoadingBtnCreate(false);
      });
  };

  useEffect(() => {
    console.log("ok");
    setLoading(true);
    axiosClient.get(`${URLQLLogin}/all`).then((response) => {
      let tmp = response.data.results;
      tmp.map((e) => {
        let formattedRoles = "";
        if (e.roles) {
          e.roles.map((role) => {
            formattedRoles += role + " , ";
          });
          e.formattedRoles = formattedRoles;
        }
      });
      console.log("okkkkkkk");
      setTotalDocs(tmp.length);
      setLogin(tmp);
      setLoading(false);
    });
  }, [refresh]);

  return (
    <div>
      <Layout>
        <Content>
          <CustomFormLogin
            form={form}
            handleFinish={handleFinishCreate}
            handleCancel={handleCancelCreate}
            loadingBtn={loadingBtnCreate}
          />
          <CustomTable
            handleClick_EditBtn={handleClick_EditBtn}
            handleConfirmDelete={handleConfirmDelete}
            loading={loading}
            totalDocs={totalDocs}
            login={login}
          />
          <Modal
            title="Chỉnh sửa thông tin Slieds"
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
            <CustomFormLogin
              form={formEdit}
              handleFinish={handleFinishUpdate}
              loadingBtn={loadingBtn}
            />
          </Modal>
        </Content>
      </Layout>
    </div>
  );
}
export default QLLogins;
