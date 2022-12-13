import React, { useEffect, useState } from "react";
import { Typography } from 'antd';
import "../css/CommonStyle.css";
import axios from "axios";
import moment from "moment";
import "moment/locale/vi";
import locale from "antd/es/locale/vi_VN";
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
  DatePicker,
  Descriptions,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";

import { URLEmployee, WEB_SERVER_URL } from "../config/constants";
import LabelCustomization, {
  ImgIcon,
  BoldText,
  TitleTable,
} from "../components/subComponents";
import ConfigProvider from "antd/es/config-provider";

function Employees() {

  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isChangedImage, setIsChangedImage] = useState(false);
  const [isChangeValueUpload, setIsChangeValueUpload] = useState(false);
  

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY"];

  const payload = localStorage.getItem('auth-toCoShop'); 
  // payload là  chuỗi String, phải chuyển thành Object rồi mới lấy ra
  // convert type of payload: from STRING to OBJECT
  const convertedPayload = JSON.parse(payload)
  //console.log("ok true",myprofile);
  console.log("get type of employee:",typeof(convertedPayload));
  // Lấy ra từng phần nhỏ trong Object
  console.log('get',convertedPayload.state.auth.employeeInfo)
  let fieldsValues = {};
    for (let key in convertedPayload.state.auth.employeeInfo) {
      fieldsValues[key] = convertedPayload.state.auth.employeeInfo[key];
    }
    formUpdate.setFieldsValue(fieldsValues);
    

    const firstName = convertedPayload.state.auth.employeeInfo.firstName;
    const lastName = convertedPayload.state.auth.employeeInfo.lastName;
    const email = convertedPayload.state.auth.employeeInfo.email;
    const phoneNumber = convertedPayload.state.auth.employeeInfo.phoneNumber;
    const address = convertedPayload.state.auth.employeeInfo.address;
 
  

 

  const disabledDate = (current) => {
    // Can not select days after 18 years ago
    return current >= moment().add(-18, "year");
  };
  //Begin: Props for components
  
  
  const PropsForm = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    initialValues: { name: "", description: "", file: null },
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
    console.log('values', values)
    //SUBMIT

    let URL = URLEmployee + "/updateOne/" + selectedId;
    //POST
    axios
      .patch(URL, values)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
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
      .finally(() => {
        setUploading(false);
      });
  };



///myinfo
  return (
    <Layout>    
      <Descriptions title="Thông Tin Cá Nhân">
    <Descriptions.Item label="Họ">{firstName}</Descriptions.Item>
    <Descriptions.Item label="Tên">{lastName}</Descriptions.Item>
    <Descriptions.Item label="Email">{email}</Descriptions.Item>
    <Descriptions.Item label="Số điện thoại">{phoneNumber}</Descriptions.Item>
    <Descriptions.Item label="Địa chỉ">{address}</Descriptions.Item>
      </Descriptions>       
    </Layout>
  );
}

export default Employees;
