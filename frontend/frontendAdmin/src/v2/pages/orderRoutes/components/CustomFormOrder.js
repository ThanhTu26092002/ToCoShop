import React, {
    Fragment,
    useEffect,
    useState,
  } from "react";
  import "../../css/CommonStyle.css";
  import moment from "moment";
  import numeral from "numeral";
  
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
    Spin,
    Space,
    DatePicker,
    Select,
    Divider,
    Typography,
    InputNumber,
  } from "antd";
  import { Content } from "antd/lib/layout/layout";
  import {
    DeleteOutlined,
    EditOutlined,
    EllipsisOutlined,
    MinusCircleOutlined,
    PlusOutlined,
  } from "@ant-design/icons";
  import TextArea from "antd/lib/input/TextArea";
  
  import {
    dateFormatList,
    URLOrder,
    URLTransportation,
    URLProduct,
    sizeList,
    colorList,
  } from "../../config/constants";
  import LabelCustomization, {
    NumberFormatter,
    BoldText,
    TitleTable,
    ColorStatus,
  } from "../../components/subComponents";
  import axiosClient from "../../config/axios";
  import formattedDate from "../../utils/commonFuncs";
  import {
    PropsForm,
    PropsFormItemDetailAddress,
    PropsFormItemEmail,
    PropsFormItemFirstName,
    PropsFormItemLastName,
    PropsFormItemPhoneNumber,
    PropsFormItemStatus,
    PropsFormItem_Label_Name,
    PropsTable,
  } from "../../config/props";
  import {
    customCreateAHandler,
    customDisabledDate,
    handleOpenNewPage,
  } from "../../config/helperFuncs";
  
  const { Text } = Typography;
function CustomFormOrder() {
  return (
    <div>CustomFormOrder</div>
  )
}

export default CustomFormOrder