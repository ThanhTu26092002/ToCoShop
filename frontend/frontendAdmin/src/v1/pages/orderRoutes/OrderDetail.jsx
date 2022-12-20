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
  const [detailCreatingStatus, setDetailCreatingStatus] = useState(false);
  const [sendingDateState, setSendingDateState] = useState(null);
  const [receivedDateState, setReceivedDateState] = useState(null);
  const [oldData, setOldData] = useState(null);
  const [handlerToString, setHandlerToString] = useState(null);
  const [isShowHistory, setIsShowHistory] = useState(false);

  const [form] = Form.useForm();
  const handleCalSumCost = () => {
    const tmp = form.getFieldsValue(["orderDetails"]).orderDetails;
    let total = 0;
    tmp.map((order) => {
      if (!order) {
        message.error(`Chưa nhập mã sản phẩm`);
      } else if (!order.quantity) {
        message.error(`Chưa nhập số lượng sản phẩm ${order.productName}`);
      } else {
        total += (order.quantity * order.price * (100 - order.discount)) / 100;
        form.setFieldsValue({ totalPrice: total });
      }
    });
  };

  const handleCancelUpdate = () => {
    form.resetFields();
    setDetailCreatingStatus(false);
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
        transportationPrice: values.transportationPrice
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
console.log("oldValue:", order)
console.log("newValue:", updateDetailOrder)
    const checkChangedData = objCompare(updateDetailOrder, order);
    //Thông tin fomUpdate không thay đổi thì checkChangedData=null ko cần làm gì cả
    if (!checkChangedData) {
      return;
    }
    updateDetailOrder.handlers= handlers



    setLoadingBtn(true);
    //SUBMIT
    //POST
    axiosClient
      .patch(`${URLOrder}/updateOne/${id}`, updateDetailOrder)
      .then((response) => {
        if (response.status === 200) {
          // setIsCreate(false);
          // setRefresh((e) => !e);
          setDetailCreatingStatus(false);
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
          form.setFieldsValue(customOrder);
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
            <Fragment>
              <Form
                {...PropsForm}
                labelCol={{ span: 0 }}
                form={form}
                name="form"
                onFinish={handleFinishUpdate}
                onFinishFailed={() => {
                  console.error("Error at onFinishFailed at form");
                }}
                initialValues={{ paymentMethod: "COD" }}
              >
                <Form.Item
                  {...PropsFormItem_Label_Name({
                    name: "orderCode",
                    label: "Mã đơn hàng",
                  })}
                >
                  <Input disabled bordered={false} />
                </Form.Item>
                <Form.Item
                  {...PropsFormItem_Label_Name({
                    label: "Ngày đặt hàng",
                    name: "createdDate",
                  })}
                >
                  <Input disabled bordered={false} />
                </Form.Item>
                <Fragment>
                  <Form.Item
                    {...PropsFormItem_Label_Name({
                      label: "Tình trạng",
                      name: "status",
                    })}
                  >
                    <Select
                      style={{ width: 150 }}
                      onChange={(e) => {
                        setChangedStatus(e);
                        switch (e) {
                          case "WAITING":
                            form.setFieldsValue({
                              receivedDate: null,
                              sendingDate: null,
                            });
                            setSendingDateState(null);
                            setReceivedDateState(null);
                            break;
                          case "SHIPPING":
                            if (sendingDateState) {
                              form.setFieldsValue({
                                receivedDate: null,
                              });
                              setReceivedDateState(null);
                            } else {
                              form.setFieldsValue({
                                sendingDate: moment(new Date()),
                                receivedDate: null,
                              });
                              setSendingDateState(
                                moment(new Date()).format("YYYY-MM-DD")
                              );
                              setReceivedDateState(null);
                            }
                            break;
                          case "COMPLETED":
                            //Existing sendingDate and sendingDate < Today
                            if (
                              sendingDateState &&
                              sendingDateState <=
                                moment(new Date()).format("YYYY-MM-DD")
                            ) {
                              form.setFieldsValue({
                                receivedDate: moment(new Date()),
                              });
                              setReceivedDateState(
                                moment(new Date()).format("YYYY-MM-DD")
                              );
                            } else if (!sendingDateState) {
                              form.setFieldsValue({
                                sendingDate: moment(new Date()),
                                receivedDate: moment(new Date()),
                              });
                              setSendingDateState(
                                moment(new Date()).format("YYYY-MM-DD")
                              );
                              setReceivedDateState(
                                moment(new Date()).format("YYYY-MM-DD")
                              );
                            }
                            break;
                          case "CANCELED":
                            form.setFieldsValue({
                              receivedDate: null,
                              sendingDate: null,
                            });
                            setSendingDateState(null);
                            setReceivedDateState(null);
                            break;
                          default:
                        }
                      }}
                    >
                      {statusList.map((s, index) => {
                        return (
                          <Select.Option key={index + 1} value={s}>
                            {s}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...PropsFormItem_Label_Name({
                      label: "Ngày chuyển hàng",
                      name: "sendingDate",
                    })}
                  >
                    <DatePicker
                      showToday={false}
                      disabledDate={(current) =>
                        customDisabledDate(
                          current,
                          moment(
                            form.getFieldsValue(["createdDate"]).createdDate
                          ).format("YYYY-MM-DD")
                        )
                      }
                      placeholder="dd-mm-yyyy"
                      format={dateFormatList}
                      value={moment(sendingDateState)}
                      onChange={(e) => {
                        if (e) {
                          setSendingDateState(e.format("YYYY-MM-DD"));
                          if (
                            moment(e.format("YYYY-MM-DD")) >
                            moment(receivedDateState)
                          ) {
                            message.error(
                              "Ngày chuyển hàng không thể sau ngày nhận hàng"
                            );
                            form.setFieldsValue({ receivedDate: null });
                            setReceivedDateState(null);
                          }
                        } else {
                          form.setFieldsValue({ receivedDate: null });
                          setReceivedDateState(null);
                        }
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...PropsFormItem_Label_Name({
                      label: "Ngày nhận hàng",
                      name: "receivedDate",
                    })}
                  >
                    <DatePicker
                      showToday={false}
                      disabledDate={(current) =>
                        customDisabledDate(current, sendingDateState)
                      }
                      placeholder="dd-mm-yyyy"
                      format={dateFormatList}
                      onChange={(e) => {
                        if (e) {
                          setReceivedDateState(e.format("YYYY-MM-DD"));
                          form.setFieldsValue({ status: "COMPLETED" });
                        } else {
                          setReceivedDateState(null);
                        }
                      }}
                    />
                  </Form.Item>
                  <Divider style={{ backgroundColor: "#e3e6f2" }} />
                  <Text
                    strong
                    style={{
                      color: "blue",
                      display: "inline-block",
                      marginBottom: 20,
                    }}
                  >
                    Thông tin người đặt hàng
                  </Text>
                  <Form.Item
                    {...PropsFormItemFirstName}
                    name="firstNameContactInfo"
                  >
                    <Input placeholder="Họ" />
                  </Form.Item>

                  <Form.Item
                    {...PropsFormItemLastName}
                    name="lastNameContactInfo"
                  >
                    <Input placeholder="Last name" />
                  </Form.Item>

                  <Form.Item {...PropsFormItemEmail} name="emailContactInfo">
                    <Input placeholder="Email" />
                  </Form.Item>
                </Fragment>

                <Form.Item
                  {...PropsFormItemPhoneNumber}
                  name="phoneNumberContactInfo"
                  rules={[
                    ...PropsFormItemPhoneNumber.rules,
                    {
                      required: true,
                      message: "Trường dữ liệu không thể bỏ trống",
                    },
                  ]}
                >
                  <Input placeholder="Số điện thoại của người đặt hàng" />
                </Form.Item>

                {/* When click more detail create form */}

                <Fragment>
                  <Form.Item
                    {...PropsFormItem_Label_Name({
                      label: "Quốc gia",
                      name: "countryContactInfo",
                    })}
                  >
                    <Select
                      placeholder="Chọn..."
                      style={{ width: 150 }}
                      onChange={(value) => {
                        setStatesListContactInfo(
                          countryList.find((e) => e.name === value)
                        );
                        form.setFieldsValue({
                          stateContactInfo: null,
                          cityContactInfo: null,
                        });
                      }}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={
                        countryList &&
                        countryList.map((e) => {
                          const tmp = { value: e.name, label: e.name };
                          return tmp;
                        })
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    {...PropsFormItem_Label_Name({
                      label: "Tỉnh",
                      name: "stateContactInfo",
                    })}
                  >
                    <Select
                      style={{ width: 150 }}
                      placeholder="Chọn..."
                      onChange={(value) => {
                        setCityListContactInfo(
                          statesListContactInfo.states.find(
                            (e) => e.name === value
                          )
                        );
                        form.setFieldsValue({ cityContactInfo: null });
                      }}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={
                        statesListContactInfo &&
                        statesListContactInfo.states.map((e) => {
                          const tmp = { value: e.name, label: e.name };
                          return tmp;
                        })
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    {...PropsFormItem_Label_Name({
                      label: "Thành phố/ Huyện",
                      name: "cityContactInfo",
                    })}
                  >
                    <Select
                      placeholder="Chọn..."
                      style={{ width: 150 }}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={
                        cityListContactInfo &&
                        cityListContactInfo.cities.map((e) => {
                          const tmp = { value: e.name, label: e.name };
                          return tmp;
                        })
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    {...PropsFormItemDetailAddress}
                    name="detailAddressContactInfo"
                  >
                    <Input placeholder="Địa chỉ cụ thể" />
                  </Form.Item>

                  {/*  Shipping Information */}
                  <Fragment>
                    <Divider style={{ backgroundColor: "#e3e6f2" }} />
                    <Text
                      strong
                      style={{
                        color: "blue",
                        display: "inline-block",
                        marginBottom: 20,
                      }}
                    >
                      Thông tin nhận hàng
                    </Text>
                    <Form.Item
                      {...PropsFormItem_Label_Name({
                        label: "Phương tiện vận chuyển",
                        name: "transportationPrice",
                      })}
                      rules={[
                        {
                          required: true,
                          message: "Trường dữ liệu không thể bỏ trống",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: 400 }}
                        disabled
                        addonAfter={"VNĐ"}
                        formatter={formatterNumber}
                        addonBefore={
                          <Form.Item
                            {...PropsFormItem_Label_Name({
                              label: "Phương tiện vận chuyển",
                              name: "transportationId",
                            })}
                            rules={[
                              {
                                required: true,
                                message: "Trường dữ liệu không thể bỏ trống",
                              },
                            ]}
                            noStyle
                          >
                            <Select
                              style={{ width: 250 }}
                              loading={!transportations}
                              placeholder="Chọn"
                              onChange={(value) => {
                                const found = transportations.find(
                                  (e) => e._id === value
                                );
                                const priceText = found.price;
                                const resetTotalPrice =
                                  found.price + order.totalPrice;
                                form.setFieldsValue({
                                  transportationPrice: priceText,
                                  totalPrice: resetTotalPrice,
                                });
                              }}
                            >
                              {transportations &&
                                transportations.map((t) => {
                                  return (
                                    <Select.Option key={t._id} value={t._id}>
                                      {`${t.name}`}
                                    </Select.Option>
                                  );
                                })}
                            </Select>
                          </Form.Item>
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      {...PropsFormItemFirstName}
                      name="firstNameShippingInfo"
                    >
                      <Input placeholder="Họ" />
                    </Form.Item>

                    <Form.Item
                      {...PropsFormItemLastName}
                      name="lastNameShippingInfo"
                    >
                      <Input placeholder="Last name" />
                    </Form.Item>

                    <Form.Item {...PropsFormItemEmail} name="emailShippingInfo">
                      <Input placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                      {...PropsFormItemPhoneNumber}
                      name="phoneNumberShippingInfo"
                      rules={[
                        ...PropsFormItemPhoneNumber.rules,
                        {
                          required: true,
                          message: "Trường dữ liệu không thể bỏ trống",
                        },
                      ]}
                    >
                      <Input placeholder="Số điện thoại người nhận" />
                    </Form.Item>

                    <Form.Item
                      {...PropsFormItem_Label_Name({
                        label: "Quốc gia",
                        name: "countryShippingInfo",
                      })}
                    >
                      <Select
                        placeholder="Chọn..."
                        style={{ width: 150 }}
                        onChange={(value) => {
                          setStatesListShippingInfo(
                            countryList.find((e) => e.name === value)
                          );
                          form.setFieldsValue({
                            stateShippingInfo: null,
                            cityShippingInfo: null,
                          });
                        }}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={
                          countryList &&
                          countryList.map((e) => {
                            const tmp = { value: e.name, label: e.name };
                            return tmp;
                          })
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      {...PropsFormItem_Label_Name({
                        label: "Tỉnh",
                        name: "stateShippingInfo",
                      })}
                    >
                      <Select
                        style={{ width: 150 }}
                        placeholder="Chọn..."
                        onChange={(value) => {
                          setCityListShippingInfo(
                            statesListShippingInfo.states.find(
                              (e) => e.name === value
                            )
                          );
                          form.setFieldsValue({ cityShippingInfo: null });
                        }}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={
                          statesListShippingInfo &&
                          statesListShippingInfo.states.map((e) => {
                            const tmp = { value: e.name, label: e.name };
                            return tmp;
                          })
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      {...PropsFormItem_Label_Name({
                        label: "Thành phố/ Huyện",
                        name: "cityShippingInfo",
                      })}
                    >
                      <Select
                        placeholder="Chọn..."
                        style={{ width: 150 }}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={
                          cityListShippingInfo &&
                          cityListShippingInfo.cities.map((e) => {
                            const tmp = { value: e.name, label: e.name };
                            return tmp;
                          })
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      {...PropsFormItemDetailAddress}
                      name="detailAddressShippingInfo"
                    >
                      <Input placeholder="Địa chỉ cụ thể" />
                    </Form.Item>

                    <Form.Item
                      {...PropsFormItem_Label_Name({
                        label: "Ghi chú",
                        name: "note",
                      })}
                    >
                      <TextArea rows={3} placeholder="Thời gian nhận hàng..." />
                    </Form.Item>

                    <Divider style={{ backgroundColor: "#e3e6f2" }} />
                  </Fragment>

                  {/* Part 04 - Payment Method */}
                  <Fragment>
                    <Form.Item
                      {...PropsFormItem_Label_Name({
                        label: "Phương thức thanh toán",
                        name: "paymentMethod",
                      })}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn phương thức thanh toán",
                        },
                      ]}
                    >
                      <Select
                        disabled
                        placeholder="Chọn"
                        style={{ width: 200 }}
                        onChange={(value) => {
                          setSelectedPaymentCreditCard(value);
                        }}
                      >
                        {paymentMethodList.map((m, index) => {
                          return (
                            <Select.Option key={index + 1} value={m}>
                              {m}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>

                    {selectedPaymentCreditCard === "CREDIT CARD" && (
                      <Fragment>
                        <Form.Item
                          {...PropsFormItem_Label_Name({
                            name: "cardNumber",
                            label: "CardNumber",
                          })}
                          rules={[
                            {
                              required: true,
                              message: "Trường dữ liệu không thể bỏ trống",
                            },
                            {
                              pattern:
                                /^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
                              message:
                                "Vui lòng nhập đúng định dạng CardNumber",
                            },
                          ]}
                        >
                          <Input placeholder="CardNumber" />
                        </Form.Item>

                        <Form.Item
                          {...PropsFormItem_Label_Name({
                            name: "cardHolder",
                            label: "CardHolder",
                          })}
                          rules={[
                            {
                              required: true,
                              message: "Trường dữ liệu không thể bỏ trống",
                            },
                            {
                              max: 50,
                            },
                            { type: String },
                          ]}
                        >
                          <Input placeholder="Tên người chủ thẻ" />
                        </Form.Item>

                        <Form.Item
                          {...PropsFormItem_Label_Name({
                            name: "expDate",
                            label: "ExpDate",
                          })}
                          rules={[
                            {
                              required: true,
                              message: "Trường dữ liệu không thể bỏ trống",
                            },
                            {
                              pattern:
                                /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/,
                              message: "Vui lòng nhập đúng định dạng Exp Date",
                            },
                          ]}
                        >
                          <Input placeholder="expiration date" />
                        </Form.Item>

                        <Form.Item
                          {...PropsFormItem_Label_Name({
                            name: "cvv",
                            label: "CVV",
                          })}
                          rules={[
                            {
                              required: true,
                              message: "Trường dữ liệu không thể bỏ trống",
                            },
                            {
                              pattern: /^[0-9]{3,4}$/,
                              message:
                                "Vui lòng nhập đúng định dạng Card Verification Value",
                            },
                          ]}
                        >
                          <Input placeholder="card verification  " />
                        </Form.Item>
                      </Fragment>
                    )}
                  </Fragment>
                  <Divider style={{ backgroundColor: "#e3e6f2" }} />
                </Fragment>

                <Form.List name="orderDetails">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, index) => (
                        <Fragment key={key}>
                          <Space
                            style={{
                              display: "flex",
                              marginBottom: 8,
                            }}
                            align="baseline"
                          >
                            <div style={{ display: "flex", gap: 24 }}>
                              <div>
                                <Form.Item
                                  {...restField}
                                  label=<LabelCustomization
                                    title={`Tên sản phẩm ${name + 1}`}
                                  />
                                  name={[name, "productName"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Chưa chọn sản phẩm",
                                    },
                                  ]}
                                >
                                  <Input
                                    style={{ minWidth: 400, maxWidth: 800 }}
                                    placeholder="Tên sản phẩm"
                                    disabled
                                    addonBefore={
                                      <Form.Item
                                        name={[name, "productId"]}
                                        noStyle
                                      >
                                        <Select
                                          disabled
                                          // loading={!products}
                                          placeholder="Mã số"
                                          style={{ width: 100 }}
                                          // showSearch
                                          // optionFilterProp="children"
                                          // filterOption={(input, option) =>
                                          //   (option?.label ?? "")
                                          //     .toLowerCase()
                                          //     .includes(input.toLowerCase())
                                          // }
                                          // options={
                                          //   products &&
                                          //   products.map((e) => {
                                          //     const tmp = {
                                          //       value: e._id,
                                          //       label: e.productCode,
                                          //     };
                                          //     return tmp;
                                          //   })
                                          // }
                                          // onChange={(value) => {
                                          //   const found = products.find(
                                          //     (e) => e._id === value
                                          //   );
                                          //   let defaultSize = null;
                                          //   let defaultColor = null;
                                          //   let defaultPrice = null;
                                          //   let defaultDiscount = null;
                                          //   found.attributes.map((a) => {
                                          //     if (
                                          //       a.discount === found.maxDiscount
                                          //     ) {
                                          //       defaultColor = a.color;
                                          //       defaultSize = a.size;
                                          //       defaultPrice = a.price;
                                          //       defaultDiscount = a.discount;
                                          //     }
                                          //   });
                                          //   const fields =
                                          //     form.getFieldsValue();
                                          //   const { orderDetails } = fields;
                                          //   Object.assign(orderDetails[name], {
                                          //     productName: found.name,
                                          //     color: defaultColor,
                                          //     size: defaultSize,
                                          //     quantity: 1,
                                          //     price: defaultPrice,
                                          //     discount: defaultDiscount,
                                          //   });
                                          //   form.setFieldsValue({
                                          //     orderDetails,
                                          //   });
                                          // }}
                                        />
                                      </Form.Item>
                                    }
                                  />
                                </Form.Item>
                                <Form.Item
                                  label=<LabelCustomization title={`Size`} />
                                  name={[name, "size"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Chưa chọn Size",
                                    },
                                  ]}
                                >
                                  <Select
                                    disabled
                                    placeholder="Size"
                                    style={{
                                      width: 70,
                                    }}
                                    // showSearch
                                    // optionFilterProp="children"
                                    // filterOption={(input, option) =>
                                    //   (option?.label ?? "")
                                    //     .toLowerCase()
                                    //     .includes(input.toLowerCase())
                                    // }
                                    // options={
                                    //   sizeList &&
                                    //   sizeList.map((s) => {
                                    //     const tmp = {
                                    //       value: s,
                                    //       label: s,
                                    //     };
                                    //     return tmp;
                                    //   })
                                    // }
                                    // onChange={() => {
                                    //   const fields = form.getFieldsValue();
                                    //   const { orderDetails } = fields;
                                    //   Object.assign(orderDetails[name], {
                                    //     color: null,
                                    //   });
                                    //   form.setFieldsValue({
                                    //     orderDetails,
                                    //   });
                                    // }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  label=<LabelCustomization title={`Màu sắc`} />
                                  name={[name, "color"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Chưa chọn màu",
                                    },
                                  ]}
                                >
                                  <Select
                                    disabled
                                    placeholder="Màu sắc"
                                    style={{
                                      width: 160,
                                    }}
                                    // showSearch
                                    // optionFilterProp="children"
                                    // filterOption={(input, option) =>
                                    //   (option?.label ?? "")
                                    //     .toLowerCase()
                                    //     .includes(input.toLowerCase())
                                    // }
                                    // options={
                                    //   colorList &&
                                    //   colorList.map((s) => {
                                    //     const tmp = {
                                    //       value: s,
                                    //       label: s,
                                    //     };
                                    //     return tmp;
                                    //   })
                                    // }
                                    // onChange={() => {
                                    //   const fields = form.getFieldsValue();
                                    //   const { orderDetails } = fields;
                                    //   const tmpSize = orderDetails[name].size;
                                    //   const tmpColor = orderDetails[name].color;
                                    //   const tmpProductId =
                                    //     orderDetails[name].productId;
                                    //   const found = products.find(
                                    //     (e) => e._id === tmpProductId
                                    //   );
                                    //   let resetSize = tmpSize;
                                    //   let resetColor = tmpColor;
                                    //   let resetPrice, resetDiscount;
                                    //   let checkExisting = false;
                                    //   let listSize_Color =
                                    //     "Sản phẩm này chỉ còn các loại( Màu- Size): ";
                                    //   found.attributes.map((a) => {
                                    //     if (
                                    //       a.size === tmpSize &&
                                    //       a.color === tmpColor
                                    //     ) {
                                    //       checkExisting = true;
                                    //       Object.assign(orderDetails[name], {
                                    //         price: a.price,
                                    //         discount: a.discount,
                                    //       });
                                    //       form.setFieldsValue({
                                    //         orderDetails,
                                    //       });
                                    //       return;
                                    //     } else if (
                                    //       a.discount === found.maxDiscount
                                    //     ) {
                                    //       listSize_Color += `${a.color}- ${a.size} ; `;
                                    //       resetColor = a.color;
                                    //       resetSize = a.size;
                                    //       resetPrice = a.price;
                                    //       resetDiscount = a.discount;
                                    //     } else {
                                    //       listSize_Color += ` ${a.size} - ${a.color} ; `;
                                    //     }
                                    //   });

                                    //   if (!checkExisting) {
                                    //     Object.assign(orderDetails[name], {
                                    //       color: resetColor,
                                    //       size: resetSize,
                                    //       price: resetColor,
                                    //       quantity: null,
                                    //       discount: resetDiscount,
                                    //     });
                                    //     form.setFieldsValue({
                                    //       orderDetails,
                                    //     });
                                    //     notification.error({
                                    //       message: `Kho hàng không còn mẫu hàng với size ${tmpSize}- màu ${tmpColor} `,
                                    //       description: listSize_Color,
                                    //       duration: 0,
                                    //     });
                                    //   }
                                    // }}
                                  />
                                </Form.Item>

                                <Form.Item
                                  label=<LabelCustomization
                                    title={`Số lượng`}
                                  />
                                  {...restField}
                                  name={[name, "quantity"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Chưa nhập số lượng",
                                    },
                                  ]}
                                >
                                  <InputNumber
                                    disabled
                                    style={{ minWidth: 120, maxWidth: 360 }}
                                    min={0}
                                    addonAfter="sản phẩm"
                                    // onChange={(value) => {
                                    //   const fields = form.getFieldsValue();
                                    //   const { orderDetails } = fields;
                                    //   const tmpSize = orderDetails[name].size;
                                    //   const tmpColor = orderDetails[name].color;
                                    //   const tmpProductId =
                                    //     orderDetails[name].productId;
                                    //   if (tmpSize && tmpColor) {
                                    //     const found = products.find(
                                    //       (e) => e._id === tmpProductId
                                    //     );
                                    //     found.attributes.map((a) => {
                                    //       if (
                                    //         a.size === tmpSize &&
                                    //         a.color === tmpColor
                                    //       ) {
                                    //         if (value <= a.stock) {
                                    //           return Promise.resolve();
                                    //         }
                                    //         Object.assign(orderDetails[name], {
                                    //           quantity: null,
                                    //         });
                                    //         form.setFieldsValue({
                                    //           orderDetails,
                                    //         });
                                    //         return notification.error({
                                    //           message: `Kho hàng không còn mẫu hàng với size ${tmpSize}- màu ${tmpColor} `,
                                    //           description: `Kho hàng còn ${a.stock}`,
                                    //         });
                                    //       }
                                    //     });
                                    //   }
                                    // }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  label=<LabelCustomization
                                    title={`Giá tiền`}
                                  />
                                  {...restField}
                                  name={[name, "price"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Chưa nhập giá tiền",
                                    },
                                  ]}
                                >
                                  <InputNumber
                                    disabled
                                    defaultValue={0}
                                    formatter={(value) =>
                                      ` ${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                      )
                                    }
                                    style={{ minWidth: 120, maxWidth: 360 }}
                                    min={0}
                                    addonAfter="VNĐ"
                                  />
                                </Form.Item>
                                <Form.Item
                                  label=<LabelCustomization
                                    title={`Giảm giá`}
                                  />
                                  {...restField}
                                  name={[name, "discount"]}
                                  defaultValue={0}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Chưa nhập mức giảm giá",
                                    },
                                  ]}
                                >
                                  <InputNumber
                                    disabled
                                    style={{ minWidth: 120, maxWidth: 150 }}
                                    min={0}
                                    max={100}
                                    addonAfter="%"
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </Space>
                          <Divider style={{ backgroundColor: "#e3e6f2" }} />
                        </Fragment>
                      ))}
                    </>
                  )}
                </Form.List>
                <Form.Item
                  label=<LabelCustomization title={`Thành tiền`} />
                  name="totalPrice"
                >
                  <InputNumber
                    formatter={formatterNumber}
                    addonAfter="VNĐ"
                    disabled
                    style={{ width: 200 }}
                  />
                </Form.Item>

                <Form.Item
                  wrapperCol={{
                    offset: 8,
                    span: 16,
                  }}
                >
                  <Space wrap>
                    <Button type="primary" danger onClick={handleCancelUpdate}>
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loadingBtn}
                    >
                      Cập nhật
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
              {handlerToString && (
                <Fragment>
                  {!isShowHistory && (
                    <div>
                      <Button
                        type="dashed"
                        style={{ backgroundColor: "#0066ff", color: "white" }}
                        onClick={() => setIsShowHistory(true)}
                      >
                        {" "}
                        Xem lịch sử{" "}
                      </Button>
                    </div>
                  )}
                  {isShowHistory ? (
                    <>
                      <div>
                        <Typography.Title level={5}>
                          Lịch sử cập nhật
                        </Typography.Title>
                      </div>
                      {handlerToString.map((e, index) => {
                        return (
                          <div key={index}>
                            <Typography.Paragraph>{e}</Typography.Paragraph>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <></>
                  )}
                  {isShowHistory && (
                    <div>
                      <Button
                        type="dashed"
                        style={{ backgroundColor: "#0066ff", color: "white" }}
                        onClick={() => setIsShowHistory(false)}
                      >
                        {" "}
                        Thu gọn
                      </Button>
                    </div>
                  )}
                </Fragment>
              )}
            </Fragment>
          )}
        </Content>
      )}
    </Layout>
  );
}

export default OrderDetail;
