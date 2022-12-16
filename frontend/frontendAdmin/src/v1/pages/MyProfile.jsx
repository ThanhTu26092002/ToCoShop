import React, { useEffect, useState } from "react";
import { Image, Spin } from "antd";
import "../css/CommonStyle.css";
import axios from "axios";
import moment from "moment";
import "moment/locale/vi";
import locale from "antd/es/locale/vi_VN";
import {
  Button,
  Layout,
  Form,
  Input,
  Popconfirm,
  message,
  notification,
  Modal,
  Upload,
  DatePicker,
  Descriptions,
} from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";

import {
  URLEmployee,
  WEB_SERVER_UPLOAD_URL,
  URLQLLogin,
} from "../config/constants";
import LabelCustomization, {
  ImgIcon,
  BoldText,
  TitleTable,
} from "../components/subComponents";
import { Content } from "antd/lib/layout/layout";
import useAuth from "../hooks/useZustand";
import { beforeUpload, objCompare } from "../config/helperFuncs";
import axiosClient from "../config/axios";
import { useNavigate } from "react-router-dom";
import { PropsFormItem_Label_Name } from "../config/props";

function MyProfile() {
  const navigate = useNavigate();
  const { setEmployee, signOut, auth } = useAuth((state) => state);

  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [authId, setAuthId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenPassword, setIsModalOpenPassword] = useState(false);

  const [formUpdate] = Form.useForm();
  const [formUpdatePassord] = Form.useForm();
  const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY"];

  const disabledDate = (current) => {
    // Can not select days after 18 years ago
    return current >= moment().add(-18, "year");
  };
  //Begin: Props for components

  const PropsForm = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    initialValues: { name: "", description: "" },
    autoComplete: "off",
  };

  const PropsFormItemFirstName = {
    label: <LabelCustomization title={"Họ"} />,
    name: "firstName",
    rules: [
      {
        required: true,
        message: "Vui lòng nhập họ và tên lót( nếu có) của nhân viên!",
      },
      {
        max: 50,
        message: "Trường dữ liệu không quá 50 kí tự!",
      },
      {
        whitespace: true,
        message: "Trường dữ liệu không thể là khoảng trống",
      },
    ],
  };
  const PropsFormItemLastName = {
    label: <LabelCustomization title={"Tên"} />,
    name: "lastName",
    rules: [
      {
        required: true,
        message: "Vui lòng nhập tên nhân viên!",
      },
      {
        max: 50,
        message: "Trường dữ liệu không quá 50 kí tự!",
      },
      {
        whitespace: true,
        message: "Trường dữ liệu không thể là khoảng trống",
      },
    ],
  };

  const PropsFormItemPhoneNumber = {
    label: <LabelCustomization title={"Số điện thoại"} />,
    name: "phoneNumber",
    rules: [
      {
        pattern: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
        message: "Bạn chưa nhập đúng định dạng số điện thoại",
      },
      {
        max: 50,
        message: "Số điện thoại không quá 50 kí tự!",
      },
      {
        whitespace: true,
        message: "Số điện thoại không thể là khoảng trống",
      },
    ],
    onChange: (value) => {
      this.props.setValue(value);
    },
  };

  const PropsFormItemAddress = {
    label: <LabelCustomization title={"Địa chỉ"} />,
    name: "address",
    rules: [
      {
        required: true,
        message: "Vui lòng nhập địa chỉ của nhân viên!",
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

  const PropsFormItemBirthday = {
    label: <LabelCustomization title={"Ngày sinh"} />,
    name: "birthday",
  };

  const PropsFormItemEmail = {
    label: <LabelCustomization title={"Email"} />,
    name: "email",
    rules: [
      {
        pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        message: "Bạn nhập chưa đúng định dạng email",
      },
      {
        max: 50,
        message: "Email không quá 50 kí tự!",
      },
      {
        required: true,
        message: "Vui lòng nhập email của nhân viên",
      },
    ],
    onChange: (value) => {
      this.props.setValue(value);
    },
  };

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
    axios
      .patch(URL, checkChangedData)
      .then((response) => {
        if (response.status === 200) {
          console.log("result:", response);
          setIsModalOpen(false);
          setEmployee(response.data.result);
          setRefresh((e) => !e);
          if (file) {
            setFile(null);
          }

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
      .finally(() => {});
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
    setLoading(true);
    const id = auth.payload.uid;
    axiosClient
      .get(`${URLQLLogin}/findById/${id}`)
      .then((response) => {
        setIsModalOpenPassword(true);

        setAuthId(response.data.result._id);
      })
      .catch((err) => {
        message.error("Lỗi hệ thống");
        setLoading(false);
        return;
      });
    setLoading(false);
  };

  const handleFinishUpdatePassword = (values) => {
    console.log("get new values:", values);
    console.log("get new values:", authId);
    return
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
  const handleUploadImage = (options, record) => {
    const { file } = options;
    let formData = new FormData();
    let URL = URLEmployee + "/employeeImage/" + record._id;
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
          console.log("ok upload image", response);
          setEmployee(response.data.result);
          setRefresh((e) => !e);
          message.success(`Cập nhật hình ảnh thành công!`);
        }
      })
      .catch((error) => {
        message.error(`Cập nhật hình ảnh thất bại.`);
      })
      .finally(() => {});
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
      {(!myProfile) && <Spin size="large"></Spin>}
      {(loading) && <Spin size="large"></Spin>}
      {(myProfile ) && !loading && (
        <>
          <a>Thông Tin Cá Nhân</a>
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
          >
            Đổi mật khẩu
          </Button>
        </>
      )}
      {/* Modal update data */}
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
          <Form.Item {...PropsFormItemFirstName}>
            <Input placeholder="First name" />
          </Form.Item>

          <Form.Item {...PropsFormItemLastName}>
            <Input placeholder="Last name" />
          </Form.Item>

          <Form.Item {...PropsFormItemEmail}>
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item {...PropsFormItemPhoneNumber}>
            <Input placeholder="Số điện thoại của nhan vien" />
          </Form.Item>
          <Form.Item {...PropsFormItemBirthday} name={"currentBirthday"}>
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
