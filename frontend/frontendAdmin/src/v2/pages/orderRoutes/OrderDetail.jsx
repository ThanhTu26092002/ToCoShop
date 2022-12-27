import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../css/CommonStyle.css";
import moment from "moment";

import {
  Button,
  Layout,
  Form,
  message,
  notification,
  Spin,
  Result,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import {
  URLOrder,
  URLTransportation,
  URLProduct,
} from "../../config/constants";
import axiosClient from "../../config/axios";
import formattedDate from "../../utils/commonFuncs";
import { customCreateAHandler, objCompare } from "../../config/helperFuncs";
import CustomFormOrder from "./components/CustomFormOrder";
import numeral from "numeral";

function OrderDetail() {
  //If params id = :id
  const navigate = useNavigate();
  const { id } = useParams();
  // const [isCreate, setIsCreate] = useState(false);
  const [transportations, setTransportations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [order, setOrder] = useState(null);
  const [customOrder, setCustomOrder] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [changedStatus, setChangedStatus] = useState(null);
  const [sendingDateState, setSendingDateState] = useState(null);
  const [receivedDateState, setReceivedDateState] = useState(null);
  const [handlerToString, setHandlerToString] = useState(null);

  const [formUpdateOrder] = Form.useForm();
  const handleCalSumCost = () => {
    const tmp = formUpdateOrder.getFieldsValue(["orderDetails"]).orderDetails;
    let total = 0;
    tmp.map((order) => {
      if (!order) {
        message.error(`Chưa nhập mã sản phẩm`);
      } else if (!order.quantity) {
        message.error(`Chưa nhập số lượng sản phẩm ${order.productName}`);
      } else {
        total += (order.quantity * order.price * (100 - order.discount)) / 100;
        formUpdateOrder.setFieldsValue({ totalPrice: total });
      }
    });
  };

  const handleCancelUpdate = () => {
    formUpdateOrder.setFieldsValue(customOrder);
  };

  const handleChangeStatus = (e) => {
    setChangedStatus(e);
    switch (e) {
      case "WAITING":
        formUpdateOrder.setFieldsValue({
          receivedDate: null,
          sendingDate: null,
        });
        setSendingDateState(null);
        setReceivedDateState(null);
        break;
      case "SHIPPING":
        if (sendingDateState) {
          formUpdateOrder.setFieldsValue({
            receivedDate: null,
          });
          setReceivedDateState(null);
        } else {
          formUpdateOrder.setFieldsValue({
            sendingDate: moment(new Date()),
            receivedDate: null,
          });
          setSendingDateState(moment(new Date()).format("YYYY-MM-DD"));
          setReceivedDateState(null);
        }
        break;
      case "COMPLETED":
        //Existing sendingDate and sendingDate < Today
        if (
          sendingDateState &&
          sendingDateState <= moment(new Date()).format("YYYY-MM-DD")
        ) {
          formUpdateOrder.setFieldsValue({
            receivedDate: moment(new Date()),
          });
          setReceivedDateState(moment(new Date()).format("YYYY-MM-DD"));
        } else if (!sendingDateState) {
          formUpdateOrder.setFieldsValue({
            sendingDate: moment(new Date()),
            receivedDate: moment(new Date()),
          });
          setSendingDateState(moment(new Date()).format("YYYY-MM-DD"));
          setReceivedDateState(moment(new Date()).format("YYYY-MM-DD"));
        }
        break;
      case "CANCELED":
        formUpdateOrder.setFieldsValue({
          receivedDate: null,
          sendingDate: null,
        });
        setSendingDateState(null);
        setReceivedDateState(null);
        break;
      default:
    }
  };

  const handleChangeSendingDate = (e) => {
    if (e) {
      setSendingDateState(e.format("YYYY-MM-DD"));
      if (moment(e.format("YYYY-MM-DD")) > moment(receivedDateState)) {
        message.error("Ngày chuyển hàng không thể sau ngày nhận hàng");
        formUpdateOrder.setFieldsValue({ receivedDate: null });
        setReceivedDateState(null);
      }
    } else {
      formUpdateOrder.setFieldsValue({ receivedDate: null });
      setReceivedDateState(null);
    }
  };

  const handleChangeReceivedDate = (e) => {
    if (e) {
      setReceivedDateState(e.format("YYYY-MM-DD"));
      formUpdateOrder.setFieldsValue({ status: "COMPLETED" });
    } else {
      setReceivedDateState(null);
    }
  };
  const handleFinishUpdate = (values) => {
    console.log("values", values);
    const checkChangedData = objCompare(values, customOrder);
    //Thông tin fomUpdate không thay đổi thì checkChangedData=null ko cần làm gì cả
    if (!checkChangedData) {
      message.warning("Không có sự thay đổi dữ liệu");
      return;
    }
    //Show error the relative between status and sendingDate- receivedDate
    if (!values.sendingDate) {
      if (values.status === "SHIPPING") {
        message.error("Bạn chưa nhập ngày chuyển đơn hàng");
        return;
      }
      if (values.status === "COMPLETED") {
        message.error("Bạn chưa nhập ngày chuyển đơn hàng");
        return;
      }
    }

    if (!values.receivedDate) {
      if (values.status === "COMPLETED") {
        message.error("Bạn chưa nhập ngày khách hàng nhận đơn hàng");
        return;
      }
    }
    let newData = { ...order };
    if (values.detailAddressContactInfo) {
      newData.contactInfo.address.detailAddress =
        values.detailAddressContactInfo;
    }
    if (values.countryContactInfo) {
      newData.contactInfo.address.country = values.countryContactInfo;
    }
    if (values.stateContactInfo) {
      newData.contactInfo.address.state = values.stateContactInfo;
    }
    if (values.cityContactInfo) {
      newData.contactInfo.address.city = values.cityContactInfo;
    }
    if (values.email) {
      newData.contactInfo.email = values.emailContactInfo;
    }
    if (values.phoneNumberContactInfo) {
      newData.contactInfo.phoneNumber = values.phoneNumberContactInfo;
    }
    if (values.firstNameContactInfo) {
      newData.contactInfo.firstName = values.firstNameContactInfo;
    }
    if (values.lastNameContactInfo) {
      newData.contactInfo.lastName = values.lastNameContactInfo;
    }
    //SHIPPING INFO
    if (values.detailAddressShippingInfo) {
      newData.shippingInfo.address.detailAddress =
        values.detailAddressShippingInfo;
    }

    if (values.countryShippingInfo) {
      newData.shippingInfo.address.country = values.countryShippingInfo;
    }
    if (values.stateShippingInfo) {
      newData.shippingInfo.address.state = values.stateShippingInfo;
    }
    if (values.cityShippingInfo) {
      newData.shippingInfo.address.city = values.cityShippingInfo;
    }
    if (values.transportationId) {
      newData.shippingInfo.transportationId = values.transportationId;
      newData.shippingInfo.transportationPrice = numeral(
        values.transportationPrice
      ).value();
    }
    if (values.emailShippingInfo) {
      newData.shippingInfo.email = values.emailShippingInfo;
    }
    if (values.note) {
      newData.shippingInfo.note = values.note;
    }
    if (values.phoneNumberShippingInfo) {
      newData.shippingInfo.phoneNumber = values.phoneNumberShippingInfo;
    }
    if (values.firstNameShippingInfo) {
      newData.shippingInfo.firstName = values.firstNameShippingInfo;
    }
    if (values.lastNameShippingInfo) {
      newData.shippingInfo.lastName = values.lastNameShippingInfo;
    }
    if (values.paymentMethod) {
      newData.paymentInfo.paymentMethod = values.paymentMethod;
    }
    //
      newData.sendingDate =  values.sendingDate? values.sendingDate.format("YYYY-MM-DD"): null;
      newData.receivedDate =values.receivedDate? values.receivedDate.format("YYYY-MM-DD"): null;
    if(values.status){
      newData.status = values.status;
    }
    //Add a handler -update new status
    const actionContent = `Cập nhật thông tin đơn hàng `;
    const newHandler = customCreateAHandler(actionContent);
    let handlers = order.handlers;
    handlers.push(newHandler);
    newData.handlers = handlers;
    delete newData.totalPrice;
    delete newData._id;
    delete newData.orderDetails;
    delete newData.orderCode;
    delete newData.createdDate;
    setLoadingBtn(true);
    //SUBMIT
    //POST
    axiosClient
      .patch(`${URLOrder}/updateOne/${id}`, newData)
      .then((response) => {
        if (response.status === 200) {
          setRefresh((e) => !e);
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
  useEffect(() => {
    axiosClient.get(`${URLTransportation}`).then((response) => {
      setTransportations(response.data.results);
    });
  }, []);
  useEffect(() => {
    axiosClient.get(`${URLProduct}/getAll`).then((response) => {
      setProducts(response.data.results);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    // Is not existing OrderDetail or orderDetail._id # id in params?
    axiosClient
      .get(`${URLOrder}/orderDetail/${id}`)
      .then((response) => {
        if (response.data.results.length === 0) {
          setNotFound(true);
        } else {
          const order = response.data.results[0];
          setOrder(response.data.results[0]);
          //Custom values before setFieldsValues for form Update
          setSendingDateState(
            order.sendingDate
              ? moment(order.sendingDate).format("YYYY-MM-DD")
              : null
          );
          setReceivedDateState(
            order.receivedDate
              ? moment(order.receivedDate).format("YYYY-MM-DD")
              : null
          );
          // Fields: orderCode-createdDate-sendingDate-receivedDate-status
          const createdDate = formattedDate(order.createdDate);
          const sendingDate = order.sendingDate
            ? moment(order.sendingDate)
            : null;
          const receivedDate = order.receivedDate
            ? moment(order.receivedDate)
            : null;

          const orderCode = order.orderCode;
          const status = order.status;
          //Fields about ContactInfo
          const detailAddressContactInfo = order.contactInfo.address
            .detailAddress
            ? order.contactInfo.address.detailAddress
            : null;
          const countryContactInfo = order.contactInfo.address.country
            ? order.contactInfo.address.country
            : null;
          const stateContactInfo = order.contactInfo.address.state
            ? order.contactInfo.address.state
            : null;
          const cityContactInfo = order.contactInfo.address.city
            ? order.contactInfo.address.city
            : null;

          const phoneNumberContactInfo = order.contactInfo.phoneNumber;
          const firstNameContactInfo = order.contactInfo.firstName;
          const lastNameContactInfo = order.contactInfo.lastName;
          const emailContactInfo = order.contactInfo.email
            ? order.contactInfo.email
            : null;
          //Fields about shippingInfo
          const detailAddressShippingInfo = order.shippingInfo?.address
            ?.detailAddress
            ? order.shippingInfo?.address?.detailAddress
            : null;
          const countryShippingInfo = order.shippingInfo?.address?.country
            ? order.shippingInfo?.address.country
            : null;
          const stateShippingInfo = order.shippingInfo?.address?.state
            ? order.shippingInfo?.address.state
            : null;
          const cityShippingInfo = order.shippingInfo?.address?.city
            ? order.shippingInfo.address.city
            : null;
          const transportationId = order.shippingInfo?.transportationId;
          const transportationPrice = order.shippingInfo?.transportationPrice;
          const note = order.shippingInfo?.note;

          const phoneNumberShippingInfo = order.shippingInfo?.phoneNumber;
          const firstNameShippingInfo = order.shippingInfo?.firstName;
          const lastNameShippingInfo = order.shippingInfo?.lastName;
          const emailShippingInfo = order.shippingInfo?.email
            ? order.shippingInfo?.email
            : null;
          //Custom orderDetails
          const orderDetailsRaw = order.orderDetails;
          let orderDetails = [];
          orderDetailsRaw.map((o) => {
            orderDetails.push({
              discount: o.discount,
              price: o.price,
              quantity: o.quantity,
              productId: o.productInfo?.productCode,
              productName: o.productInfo?.name,
              size: o.productInfo?.attributes.size,
              color: o.productInfo?.attributes.color,
            });
          });
          let customOrder = {
            orderDetails: orderDetails,
            totalPrice: order.totalPrice,
            orderCode,
            createdDate,
            sendingDate,
            receivedDate,
            status,
            phoneNumberContactInfo,
            firstNameContactInfo,
            lastNameContactInfo,
            detailAddressContactInfo,
            countryContactInfo,
            stateContactInfo,
            cityContactInfo,
            emailContactInfo,
            phoneNumberShippingInfo,
            firstNameShippingInfo,
            lastNameShippingInfo,
            detailAddressShippingInfo,
            countryShippingInfo,
            stateShippingInfo,
            cityShippingInfo,
            emailShippingInfo,
            transportationId,
            transportationPrice,
            note,
          };
          if (order.paymentInfo) {
            customOrder = {
              ...customOrder,
              paymentMethod: order.paymentInfo.paymentMethod,
            };
          }
          setCustomOrder({
            ...customOrder,
            handlers: order.handlers,
          });
          let customHandlersToString = [];
          order.handlers.map((handler) => {
            customHandlersToString.push(
              `- ${handler.action} --- ${handler.userName}---${handler.userId} `
            );
          });
          setHandlerToString(customHandlersToString);
          formUpdateOrder.setFieldsValue(customOrder);
        }
      })
      .catch((error) => {
        if(error.response?.request?.status === 404){
          setNotFound(true)
          return;
        }
      });

    setLoading(false);
  }, [products, refresh]);

  return (
    <Layout>
      {notFound ? (
        <Result
          status="404"
          title="404"
          subTitle="Xin lỗi, Trang bạn viếng thăm không tồn tại!"
          extra={
            <Button type="primary" onClick={() => navigate("/home")}>
              Trang Chủ
            </Button>
          }
        />
      ) : (
        <Content style={{ padding: 24 }}>
          {loading && <Spin size="large"></Spin>}
          {!loading && (
            <CustomFormOrder
              isFormUpdate={true}
              form={formUpdateOrder}
              detailCreatingStatus={true}
              products={products}
              transportations={transportations}
              handleCancel={handleCancelUpdate}
              loadingBtn={loadingBtn}
              handleFinish={handleFinishUpdate}
              handleChangeStatus={handleChangeStatus}
              sendingDateState={sendingDateState}
              handleChangeReceivedDate={handleChangeReceivedDate}
              handleChangeSendingDate={handleChangeSendingDate}
              handlerToString={handlerToString}
            />
          )}
        </Content>
      )}
    </Layout>
  );
}

export default OrderDetail;
