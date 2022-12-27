import { message } from "antd";
import moment from "moment";
import formattedDate from "../utils/commonFuncs";

export const customDisabledDate = (current, checkingDate) => {
  return current < moment(checkingDate);
};

export const handleOpenNewPage = ({ path, params = null }) => {
  const url = `${path}/${params}`;
  window.open(url, "_blank");
};

export const customCreateAHandler = (actionContent) => {
  const payload = localStorage.getItem("auth-toCoShop");
  // payload là  chuỗi String, phải chuyển thành Object rồi mới lấy ra
  // convert type of payload: from STRING to OBJECT
  const convertedPayload = JSON.parse(payload);
  // Lấy ra từng phần nhỏ trong Object
  const employeeInfo = convertedPayload.state.auth.employeeInfo;
  const userId = employeeInfo._id;
  const userName = employeeInfo.firstName + " " + employeeInfo.lastName;
  const currentTime = moment().format("DD-MM-YYY- HH:mm");
  const action = `Thời gian: ${currentTime} : ${actionContent}`;
  const handler = { userId, userName, action };
  return handler;
};

export const beforeUpload = (file) => {
  const isImage =
    file.type === "image/jpg" ||
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/gif";
  if (!isImage) {
    message.error("Bạn chỉ có thể tải ảnh định dạng: jpg-jpeg-png-gif file!");
    return false;
  } else {
    return true;
  }
};

export const objCompare = (newValues, oldValues) => {
  // Đầu vào là 2 objects
  for (var p in newValues) {
    if (oldValues.hasOwnProperty(p)) {
      if (oldValues[p] === newValues[p]) {
        delete newValues[p];
      } else if (
        oldValues[p] instanceof Array &&
        newValues[p] instanceof Array
      ) {
        if (JSON.stringify(newValues[p]) == JSON.stringify(oldValues[p])) {
          delete newValues[p];
        }
      }
    }
  }
  if (
    newValues && // 👈 null and undefined check
    Object.keys(newValues).length === 0 &&
    Object.getPrototypeOf(newValues) === Object.prototype
  ) {
    newValues = null;
    // return false
  }
  return newValues;
};

export const formatterNumber = (val) => {
  if (!val) return 0;
  return `${val}`.replace(new RegExp(/\B(?=(\d{3})+(?!\d))/g), ',')
  //  val.toLocaleString()

  // return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(?=\d{0,2}$)/g, ",");
             
}

export const formatterOrdersData = (orders)=>{
  let newOrders = [];
  orders.map((e) => {
    // Formatting dates before showing
    let formattedCreatedDate = formattedDate(e.createdDate);
    let formattedSendingDate = e.sendingDate
      ? formattedDate(e.sendingDate)
      : "Chưa xác định";
    let formattedReceivedDate = e.receivedDate
      ? formattedDate(e.receivedDate)
      : "Chưa xác định";
    let formattedFullName =
      e.contactInfo.firstName + " " + e.contactInfo.lastName;
    let formattedShippingAddress = "Chưa xác định";
    if (e.shippingInfo) {
      if (e.shippingInfo.address.detailAddress) {
        formattedShippingAddress = e.shippingInfo.address.detailAddress + ", ";
      }
      if (e.shippingInfo.address.city) {
        formattedShippingAddress += e.shippingInfo.address.city + ", ";
      }
      if (e.shippingInfo.address.state) {
        formattedShippingAddress += e.shippingInfo.address.state + ", ";
      }
      if (e.shippingInfo.address.country) {
        formattedShippingAddress += e.shippingInfo.address.country;
      }
    }
    newOrders.push({
      ...e,
      formattedCreatedDate,
      formattedSendingDate,
      formattedReceivedDate,
      formattedFullName,
      formattedShippingAddress,
    });
  });
  return  newOrders
}