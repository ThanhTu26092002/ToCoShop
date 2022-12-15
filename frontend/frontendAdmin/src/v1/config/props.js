import { Spin } from "antd";

const {
  default: LabelCustomization,
  TitleTable,
} = require("../components/subComponents");

export const PropsTable = ({
  title,
  footer = "Nếu có vấn đề khi tương tác với hệ thống, xin vui lòng liên hệ số điện thoại 002233442",
  isLoading = false,
  isLoadingBtn = false,
}) => {
  const props = {
    loading: {
      indicator: <Spin />,
      spinning: isLoading || isLoadingBtn,
    },
    style: { marginTop: 20 },
    rowKey: "_id",
    locale: {
      triggerDesc: "Giảm dần",
      triggerAsc: "Tăng dần",
      cancelSort: "Hủy sắp xếp",
    },
    bordered: true,
    size: "small",
    scroll: { x: 1500, y: 400 },
    title: () => {  
      return <TitleTable title={title} />;
    },
    footer: () => footer,
  };
  return props;
};

export const PropsForm = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
  initialValues: { name: "", description: "", file: null },
  autoComplete: "off",
};

export const PropsFormItemDetailAddress = {
  label: <LabelCustomization title={"Địa chỉ"} />,
  name: "detailAddress",
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

export const PropsFormItem_Label_Name = ({ label, name }) => {
  const props = {
    label: <LabelCustomization title={label} />,
    name: name,
  };
  return props;
};

export const PropsFormItemFirstName = {
  label: <LabelCustomization title={"Họ"} />,
  name: "firstName",
  rules: [
    {
      required: true,
      message: "Trường dữ liệu không thể bỏ trống",
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
export const PropsFormItemLastName = {
  label: <LabelCustomization title={"Tên"} />,
  name: "lastName",
  rules: [
    {
      required: true,
      message: "Trường dữ liệu không thể bỏ trống",
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

export const PropsFormItemPhoneNumber = {
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

export const PropsFormItemEmail = {
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
  ],
  onChange: (value) => {
    this.props.setValue(value);
  },
};

