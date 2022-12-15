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

import { URLEmployee, WEB_SERVER_UPLOAD_URL } from "../config/constants";
import LabelCustomization, {
  ImgIcon,
  BoldText,
  TitleTable,
} from "../components/subComponents";
import { Content } from "antd/lib/layout/layout";
import useAuth from "../hooks/useZustand";
import { beforeUpload } from "../config/helperFuncs";
import axiosClient from "../config/axios";

function MyProfile() {
  const [myProfile, setMyProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isChangedImage, setIsChangedImage] = useState(false);
  const [isChangeValueUpload, setIsChangeValueUpload] = useState(false);

  const [formUpdate] = Form.useForm();
  const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY"];

  const { setEmployee } = useAuth((state) => state);

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
    values.birthday = values.currentBirthday;
    delete values.currentBirthday;
    const tmp1 = {
      firstName: myProfile.firstName,
      lastName: myProfile.lastName,
      email: myProfile.email,
      phoneNumber: myProfile.phoneNumber,
      address: myProfile.address,
      birthday: moment(myProfile.birthday),
    };
    const tmp2 = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      address: values.address,
      birthday: values.birthday,
    };
    console.log("myProfile", myProfile);
    delete values.currentBirthday;

    if (JSON.stringify(tmp2) === JSON.stringify(tmp1)) {
      console.log("the same");
      setIsModalOpen(false);
      formUpdate.resetFields();
      setSelectedId(null);
      return;
    }
    if (values.email === myProfile.email) {
      delete values.email;
    }

    let URL = URLEmployee + "/updateOne/" + myProfile._id;
    //POST
    axios
      .patch(URL, values)
      .then((response) => {
        if (response.status === 200) {
          console.log("result:", response);
          setIsModalOpen(false);
          setEmployee(response.data.result);
          setRefresh((e) => !e);
          setSelectedId(null);
          setIsChangedImage(false);
          setIsChangeValueUpload(false);
          if (file) {
            setFile(null);
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
    setIsChangeValueUpload(false);
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
  const handleOk = () => {
    formUpdate.submit();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setFile(null);
  };
  //
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
      {!myProfile && <Spin size="large"></Spin>}
      {myProfile && (
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
            icon={<EditOutlined />}
            type="primary"
            title="Chỉnh sửa"
            onClick={() => handleClick_EditBtn(myProfile)}
          ></Button>
        </>
      )}

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
    </Layout>
  );
}

export default MyProfile;
