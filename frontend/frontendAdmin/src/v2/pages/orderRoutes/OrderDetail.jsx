import React, { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Result,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
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
  formatterNumber,
  objCompare,
} from "../../config/helperFuncs";
import CustomFormOrder from "./components/CustomFormOrder";
const { Text } = Typography;

function OrderDetail() {
  //If params id = :id
  const navigate = useNavigate();
  const { id } = useParams();

  const paymentMethodList = ["CREDIT CARD", "COD"];
  const statusList = ["WAITING", "SHIPPING", "COMPLETED", "CANCELED"];

  // const [isCreate, setIsCreate] = useState(false);
  const [selectedPaymentCreditCard, setSelectedPaymentCreditCard] =
    useState(null);
  const [transportations, setTransportations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [order, setOrder] = useState(null);
  const [customOrder, setCustomOrder] = useState(null);
  const [countryList, setCountryList] = useState(null);
  const [statesListContactInfo, setStatesListContactInfo] = useState(null);
  const [cityListContactInfo, setCityListContactInfo] = useState(null);
  const [statesListShippingInfo, setStatesListShippingInfo] = useState(null);
  const [cityListShippingInfo, setCityListShippingInfo] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [changedStatus, setChangedStatus] = useState(null);
  const [sendingDateState, setSendingDateState] = useState(null);
  const [receivedDateState, setReceivedDateState] = useState(null);
  const [oldData, setOldData] = useState(null);
  const [handlerToString, setHandlerToString] = useState(null);
  const [isShowHistory, setIsShowHistory] = useState(false);

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
    formUpdateOrder.resetFields();
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
    //Show error the relative between status and sendingDate- receivedDate
    if (values.sendingDate === null) {
      if (values.status === "SHIPPING") {
        message.error("Bạn chưa nhập ngày chuyển đơn hàng");
        return;
      }
      if (values.status === "COMPLETED") {
        message.error("Bạn chưa nhập ngày chuyển đơn hàng");
        return;
      }
    }

    if (values.receivedDate === null) {
      if (values.status === "COMPLETED") {
        message.error("Bạn chưa nhập ngày khách hàng nhận đơn hàng");
        return;
      }
    }

    //Config orderDetails before send to backend
    // const getOrderDetails = values.orderDetails;
    // const configOrderDetails = [];
    // getOrderDetails.map((product) => {
    //   let tmpProduct = products.find((e) => (e._id = product.productId));
    //   configOrderDetails.push({
    //     productId: product.productId,
    //     size: product.size,
    //     quantity: product.quantity,
    //     price: tmpProduct.price,
    //     discount: tmpProduct.discount,
    //   });
    // });

    //Config contacInfo
    // before that, we need to config address in contactInfo
    let addressInfo = { detailAddress: values.detailAddressContactInfo };
    if (values.countryContactInfo) {
      addressInfo = { ...addressInfo, country: values.countryContactInfo };
    }
    if (values.stateContactInfo) {
      addressInfo = { ...addressInfo, state: values.stateContactInfo };
    }
    if (values.cityContactInfo) {
      addressInfo = { ...addressInfo, city: values.cityContactInfo };
    }
    //Now, let set up contactInfo
    let contactInfo = { address: addressInfo };
    if (values.email) {
      contactInfo = { ...contactInfo, email: values.emailContactInfo };
    }
    contactInfo = {
      ...contactInfo,
      phoneNumber: values.phoneNumberContactInfo,
      firstName: values.firstNameContactInfo,
      lastName: values.lastNameContactInfo,
    };

    // Now, continue to create shippingInfo
    let shippingInfo = undefined;
    //set up addressShipping
    if (values.detailAddressShippingInfo) {
      let addressShipping = {
        detailAddress: values.detailAddressShippingInfo,
      };
      if (values.countryShippingInfo) {
        addressShipping = {
          ...addressShipping,
          country: values.countryShippingInfo,
        };
      }
      if (values.stateShippingInfo) {
        addressShipping = {
          ...addressShipping,
          state: values.stateShippingInfo,
        };
      }
      if (values.cityShippingInfo) {
        addressShipping = { ...addressShipping, city: values.cityShippingInfo };
      }

      //Now set shippingInfo
      shippingInfo = {
        address: addressShipping,
        transportationId: values.transportationId,
        transportationPrice: values.transportationPrice,
      };

      if (values.emailShippingInfo) {
        shippingInfo = { ...shippingInfo, email: values.emailShippingInfo };
      }
      if (values.note) {
        shippingInfo = { ...shippingInfo, note: values.note };
      }

      shippingInfo = {
        ...shippingInfo,
        phoneNumber: values.phoneNumberShippingInfo,
        firstName: values.firstNameShippingInfo,
        lastName: values.lastNameShippingInfo,
      };
    }

    //Continue to config paymentInfo
    let paymentInfo = undefined;
    if (values.paymentMethod) {
      paymentInfo = { ...paymentInfo, paymentMethod: values.paymentMethod };
    }
    if (values.paymentMethod === "CREDIT CARD") {
      paymentInfo = {
        ...paymentInfo,
        moreInfo: {
          cardNumber: values.cardNumber,
          cardHolder: values.cardHolder,
          expDate: values.expDate,
          cvv: values.cvv,
        },
      };
    }

    //
    const customSendingDate = values.sendingDate
      ? values.sendingDate.format("YYYY-MM-DD")
      : null;
    const customReceivedDate = values.receivedDate
      ? values.receivedDate.format("YYYY-MM-DD")
      : null;
    //Add a handler -update new status
    const actionContent = `Cập nhật thông tin đơn hàng `;
    const newHandler = customCreateAHandler(actionContent);
    let handlers = order.handlers;
    handlers.push(newHandler);

    const updateDetailOrder = {
      status: values.status,
      sendingDate: customSendingDate,
      receivedDate: customReceivedDate,
      contactInfo,
      shippingInfo,
      paymentInfo,
    };
    console.log("oldValue:", order);
    console.log("newValue:", updateDetailOrder);
    const checkChangedData = objCompare(updateDetailOrder, order);
    //Thông tin fomUpdate không thay đổi thì checkChangedData=null ko cần làm gì cả
    if (!checkChangedData) {
      return;
    }
    updateDetailOrder.handlers = handlers;

    setLoadingBtn(true);
    //SUBMIT
    //POST
    axiosClient
      .patch(`${URLOrder}/updateOne/${id}`, updateDetailOrder)
      .then((response) => {
        if (response.status === 200) {
          // setIsCreate(false);
          // setRefresh((e) => !e);
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
          const detailAddressContactInfo =
            order.contactInfo.address.detailAddress;
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
        console.log(error);
        setNotFound(true);
      });

    setLoading(false);
  }, [products]);

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
              detailCreatingStatus= {true}
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
