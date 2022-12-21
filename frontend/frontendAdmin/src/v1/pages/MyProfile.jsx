import React, { useEffect, useState } from "react";
import { Image, Spin } from "antd";
import "../css/CommonStyle.css";
import moment from "moment";
import "moment/locale/vi";
import locale from "antd/es/locale/vi_VN";
import {
  Button,
  Layout,
  Form,
  Input,
  message,
  notification,
  Modal,
  Upload,
  DatePicker,
  Descriptions,
} from "antd";
import TextArea from "antd/lib/input/TextArea";

import {
  URLEmployee,
  WEB_SERVER_UPLOAD_URL,
  URLQLLogin,
  dateFormatList,
} from "../config/constants";
import useAuth from "../hooks/useZustand";
import { beforeUpload, objCompare } from "../config/helperFuncs";
import axiosClient from "../config/axios";
import { useNavigate } from "react-router-dom";
import {
  PropsForm,
  PropsFormItemEmail,
  PropsFormItemFirstName,
  PropsFormItemLastName,
  PropsFormItemPhoneNumber,
  PropsFormItem_Label_Name,
} from "../config/props";
import LabelCustomization from "../components/subComponents";

function MyProfile() {
  const navigate = useNavigate();
  const { setEmployee, signOut, auth } = useAuth((state) => state);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loadingPasswordBtn, setLoadingPasswordBtn] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const [savedPassword, setSavedPassword] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenPassword, setIsModalOpenPassword] = useState(false);

  const [formUpdate] = Form.useForm();
  const [formUpdatePassord] = Form.useForm();

  const PropsFormItemAddress = {
    label: <LabelCustomization title={"Địa chỉ"} />,
    name: "address",
    rules: [
      {
        required: true,
        message: "Vui lòng nhập địa chỉ!",
      },
      {
        max: 500,
        message: "Địa chỉ không quá 500 kí tự!",
      },
      {
        whitespace: true,
        message: "Địa chỉ không thể là khoảng trống",
      },
    ],
  };
  const disabledDate = (current) => {
    // Can not select days after 18 years ago
    return current >= moment().add(-18, "year");
  };
  //Begin: Props for components

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
    setLoadingBtn(true);
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
        setLoadingBtn(false);
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
    formUpdatePassord.submit();
  };
  const handleCancel = () => {
    formUpdate.resetFields();
    setIsModalOpen(false);
  };
  const handleUpdatePassworkCancel = () => {
    setIsModalOpenPassword(false);
  };
  //handleUpdatePassworkOk

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
        <>
          <a>Thông Tin Cá Nhân</a>
          {loadingImg ? (
            <Spin size="large"></Spin>
          ) : (
            <>
              <Image
                src={`${WEB_SERVER_UPLOAD_URL}/${myProfile.imageUrl}`}
                width={100}
                height={100}
              />
              <Upload
                beforeUpload={(file) => beforeUpload(file)}
                showUploadList={false}
                name="file"
                customRequest={(options) => {
                  handleUploadImage(options, myProfile);
                }}
              >
                <button
                  title="Cập nhật ảnh"
                  style={{
                    cursor: "pointer",
                    width: 100,
                    backgroundColor: "#00cc99",
                    border: "none",
                    marginTop: "12px",
                  }}
                >
                  Cập nhật ảnh
                </button>
              </Upload>
            </>
          )}

          <Descriptions style={{ marginTop: 24 }}>
            <Descriptions.Item label="Họ">
              {myProfile.firstName}
            </Descriptions.Item>
            <Descriptions.Item label="Tên">
              {myProfile.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {myProfile.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {moment(myProfile.birthday).format("DD-MM-YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {myProfile.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {myProfile.phoneNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {myProfile.address}
            </Descriptions.Item>
          </Descriptions>
          <Button
            type="primary"
            style={{ width: 200 }}
            onClick={() => handleClick_EditBtn(myProfile)}
          >
            Cập nhật thông tin cá nhân
          </Button>
          <Button
            type="primary"
            danger
            style={{ width: 200, marginTop: 12 }}
            onClick={() => handleClick_EditPasswordBtn()}
            loading={loadingBtn}
          >
            Đổi mật khẩu
          </Button>
        </>
      )}
      {/* Modal update data */}
      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        open={isModalOpen}
        width={800}
        onOk={handleUpdatePassworkOk}
        onCancel={handleUpdatePassworkCancel}
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
          <Form.Item {...PropsFormItemFirstName}>
            <Input placeholder="First name" />
          </Form.Item>

          <Form.Item {...PropsFormItemLastName}>
            <Input placeholder="Last name" />
          </Form.Item>

          <Form.Item
            {...PropsFormItemEmail}
            rules={[
              ...PropsFormItemEmail.rules,
              {
                required: true,
                message: "Vui lòng nhập email",
              },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item {...PropsFormItemPhoneNumber}>
            <Input placeholder="Số điện thoại của nhân viên" />
          </Form.Item>
          <Form.Item
            {...PropsFormItem_Label_Name({
              label: "Ngày sinh",
              name: "currentBirthday",
            })}
          >
            <DatePicker
              allowClear={false}
              showToday={false}
              disabledDate={disabledDate}
              placeholder="dd/mm/yyyy"
              format={dateFormatList}
              locale={locale}
              renderExtraFooter={() => "Nhân viên đủ 18 tuổi trở lên"}
            />
          </Form.Item>
          <Form.Item {...PropsFormItemAddress}>
            <TextArea rows={3} placeholder="Dia chi nhan vien" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal update password */}
      <Modal
        title="Đổi mật khẩu"
        open={isModalOpenPassword}
        onOk={handleUpdatePassworkOk}
        onCancel={handleUpdatePassworkCancel}
        width={800}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loadingPasswordBtn}
            onClick={handleOk}
          >
            Đồng ý
          </Button>,
        ]}
      >
        <Form
          {...PropsForm}
          form={formUpdatePassord}
          name="formUpdatePassord"
          onFinish={handleFinishUpdatePassword}
          onFinishFailed={() => {
            // message.info("Error at onFinishFailed at formUpdate");
            console.error("Error at onFinishFailed at formUpdatePassord");
          }}
        >
          <Form.Item
            {...PropsFormItem_Label_Name({
              label: "Mật khẩu cũ",
              name: "oldPassword",
            })}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu hiện tại!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || savedPassword === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu cũ không đúng!"));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            {...PropsFormItem_Label_Name({
              label: "Mật khẩu mới",
              name: "password",
            })}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu mới!",
              },
              {
                pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
                message:
                  "Mật khẩu có ít nhất 8 kí tự bao gồm ít nhất một chữ thường, một chữ in hoa và một chữ số",
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            {...PropsFormItem_Label_Name({
              label: "Xác nhận mật khẩu mới",
              name: "confirm",
            })}
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu mới!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Không khớp hai mật khẩu!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default MyProfile;
