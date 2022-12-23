import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import "../../css/CommonStyle.css";
import moment from "moment";
import "moment/locale/vi";
import { Button, Layout, Form, message, notification, Modal } from "antd";
import { URLEmployee, URLQLLogin } from "../../config/constants";
import useAuth from "../../hooks/useZustand";
import { objCompare } from "../../config/helperFuncs";
import axiosClient from "../../config/axios";
import { useNavigate } from "react-router-dom";
import MyInfo from "./components/MyInfo";
import UpdateInfo from "./components/UpdateInfo";
import UpdatePassword from "./components/UpdatePassword";

function MyProfile() {
  const navigate = useNavigate();
  const { setEmployee, signOut, auth } = useAuth((state) => state);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loadingBtnPass, setLoadingBtnPass] = useState(false);
  const [loadingPasswordBtn, setLoadingPasswordBtn] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const [savedPassword, setSavedPassword] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenPassword, setIsModalOpenPassword] = useState(false);

  const [formUpdate] = Form.useForm();
  const [formUpdatePassword] = Form.useForm();

  const handleFinishUpdate = (values) => {
    const oldData = {
      ...myProfile,
      birthday: moment(myProfile.birthday).format("YYYY-MM-DD"),
    };
    const newData = {
      ...values,
      birthday: moment(values.currentBirthday).format("YYYY-MM-DD"),
    };
    delete newData.currentBirthday;
    const checkChangedData = objCompare(newData, oldData);
    //Thông tin fomUpdate không thay đổi thì checkChangedData=null ko cần làm gì cả
    if (!checkChangedData) {
      setIsModalOpen(false);
      formUpdate.resetFields();
      return;
    }
    setLoadingBtn(true);
    //Nếu email được thay đổi thì ta phải truyền thêm một oldEmail chứa email hiện tại để truyền qua api nhằm tìm và thay thế email mới bên collection Logins
    if (checkChangedData.email) {
      checkChangedData.oldEmail = myProfile.email;
    }
    //Nếu thay đổi ngày sinh thì cần chuyển format ngày sinh trước khi gửi cập nhật
    if (checkChangedData.birthday) {
      checkChangedData.birthday = moment(checkChangedData.birthday);
    }
    let URL = URLEmployee + "/updateOne/" + myProfile._id;
    //POST
    axiosClient
      .patch(URL, checkChangedData)
      .then((response) => {
        if (response.status === 200) {
          setLoadingBtn(false);
          setIsModalOpen(false);
          setEmployee(response.data.result);
          setRefresh((e) => !e);
          //Lấy uid từ hook useAuth để xóa auth nếu người cập nhật chính tài khoản login của họ
          if (checkChangedData.email) {
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

  const handleClick_EditBtn = (record) => {
    setIsModalOpen(true);
    let fieldsValues = {};
    for (let key in record) {
      fieldsValues[key] = record[key];
    }
    if (record.birthday) {
      fieldsValues.currentBirthday = moment(record.birthday);
      // fieldsValues.birthday =null
    } else {
      fieldsValues.currentBirthday = moment(record.birthday);
      fieldsValues.birthday = null;
    }

    formUpdate.setFieldsValue(fieldsValues);
  };

  const handleClick_EditPasswordBtn = () => {
    setLoadingBtnPass(true);
    const id = auth.payload.uid;
    axiosClient
      .get(`${URLQLLogin}/findById/${id}`)
      .then((response) => {
        setIsModalOpenPassword(true);
        setSavedPassword(response.data.result.password);
      })
      .catch((err) => {
        message.error("Lỗi hệ thống");
        return;
      })
      .finally(() => {
        setLoadingBtnPass(false);
      });
  };

  const handleFinishUpdatePassword = (values) => {
    setLoadingPasswordBtn(true);
    const id = auth.payload.uid;
    axiosClient
      .patch(`${URLQLLogin}/updateOne/${id}`, {
        password: values.password,
      })
      .then((response) => {
        setIsModalOpenPassword(false);
        notification.info({
          message: "Thông báo",
          description:
            "Cập nhật mật khẩu mới thành công, vui lòng đăng nhập lại",
        });
        setTimeout(() => {
          signOut();
          navigate("/login");
        }, 3000);
        return;
      })
      .catch((error) => {
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
      })
      .finally(() => {
        setLoadingPasswordBtn(false);
      });
  };

  const handleOk = () => {
    formUpdate.submit();
  };
  const handleUpdatePassworkOk = () => {
    formUpdatePassword.submit();
  };
  const handleCancel = () => {
    formUpdate.resetFields();
    setIsModalOpen(false);
  };
  const handleUpdatePassworkCancel = () => {
    setIsModalOpenPassword(false);
    formUpdatePassword.resetFields();
  };
  const handleUploadImage = (options, myProfile) => {
    setLoadingImg(true);
    const { file } = options;
    let formData = new FormData();
    let URL = URLEmployee + "/employeeImage/" + myProfile._id;
    //If containing an image <=> file !== null
    if (!myProfile.imageUrl) {
      formData.append("currentImgUrl", null);
    } else {
      formData.append("currentImgUrl", myProfile.imageUrl);
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
          console.log("ok upload image", response);
          setEmployee(response.data.result);
          setRefresh((e) => !e);
          message.success(`Cập nhật hình ảnh thành công!`);
        }
      })
      .catch((error) => {
        message.error(`Cập nhật hình ảnh thất bại.`);
      })
      .finally(() => {
        setLoadingImg(false);
      });
  };

  ///myinfo
  useEffect(() => {
    const payload = localStorage.getItem("auth-toCoShop");
    // payload là  chuỗi String, phải chuyển thành Object rồi mới lấy ra
    // convert type of payload: from STRING to OBJECT
    const convertedPayload = JSON.parse(payload);
    setMyProfile(convertedPayload.state.auth.employeeInfo);
  }, [refresh]);

  return (
    <Layout>
      {!myProfile && <Spin size="large"></Spin>}
      {myProfile && (
        <MyInfo
          loadingImg={loadingImg}
          myProfile={myProfile}
          handleUploadImage={handleUploadImage}
          handleClick_EditBtn={handleClick_EditBtn}
          handleClick_EditPasswordBtn={handleClick_EditPasswordBtn}
          loadingBtn={loadingBtn}
          loadingBtnPass={loadingBtnPass}
        />
      )}
      {/* Modal update data */}
      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        open={isModalOpen}
        width={800}
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
        <UpdateInfo
          formUpdate={formUpdate}
          handleFinishUpdate={handleFinishUpdate}
        />
      </Modal>

      {/* Modal update password */}
      <Modal
        title="Đổi mật khẩu"
        open={isModalOpenPassword}
        onOk={handleUpdatePassworkOk}
        onCancel={handleUpdatePassworkCancel}
        width={800}
        footer={[
          <Button key="back" onClick={handleUpdatePassworkCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loadingPasswordBtn}
            onClick={handleUpdatePassworkOk}
          >
            Đồng ý
          </Button>,
        ]}
      >
        <UpdatePassword
          formUpdatePassword={formUpdatePassword}
          handleFinishUpdatePassword={handleFinishUpdatePassword}
          savedPassword={savedPassword}
        />
      </Modal>
    </Layout>
  );
}

export default MyProfile;
