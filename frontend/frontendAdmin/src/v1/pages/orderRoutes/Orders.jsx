import React, {
  Fragment,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useNavigate } from "react-router-dom";
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
import {
  useTransportations,
  useProducts,
  useOrderDetail,
} from "../../hooks/useZustand";

const { Text } = Typography;
const { Option } = Select;

function Orders() {
  const { hookSetOrderDetail, hookOrderDetailData } = useOrderDetail(
    (state) => state
  );
  const { hookSetTransportation, hookTransportationData } = useTransportations(
    (state) => state
  );
  const { hookSetProduct, hookProductData } = useProducts((state) => state);
  const paymentMethodList = ["CREDIT CARD", "COD"];
  const statusList = ["WAITING", "SHIPPING", "COMPLETED", "CANCELED"];

  // const [isCreate, setIsCreate] = useState(false);
  const [selectedPaymentCreditCard, setSelectedPaymentCreditCard] =
    useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [orders, setOrders] = useState(null);
  const [changedStatus, setChangedStatus] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [countryList, setCountryList] = useState(null);
  const [statesListContactInfo, setStatesListContactInfo] = useState(null);
  const [cityListContactInfo, setCityListContactInfo] = useState(null);
  const [statesListShippingInfo, setStatesListShippingInfo] = useState(null);
  const [cityListShippingInfo, setCityListShippingInfo] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [detailCreatingStatus, setDetailCreatingStatus] = useState(false);
  const [sendingDateState, setSendingDateState] = useState(null);
  const [receivedDateState, setReceivedDateState] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState({});

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const columns = [
    {
      title: () => {
        return <BoldText title={"Mã đơn hàng "} />;
      },
      key: "_id",
      dataIndex: "orderCode",
      width: "9%",
      fixed: "left",
      render: (text) => {
        return <BoldText title={text} />;
      },
    },

    {
      title: () => {
        return <BoldText title={"Ngày đặt hàng"} />;
      },
      width: "8%",
      key: "formattedCreatedDate",
      dataIndex: "formattedCreatedDate",
    },

    {
      title: () => {
        return <BoldText title={"Trạng thái"} />;
      },
      width: "7%",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        return <ColorStatus status={status} />;
      },
    },

    {
      title: () => {
        return <BoldText title={"Ngày gửi hàng"} />;
      },
      width: "8%",
      key: "formattedSendingDate",
      dataIndex: "formattedSendingDate",
    },

    {
      title: () => {
        return <BoldText title={"Tổng tiền"} />;
      },
      key: "totalPrice",
      dataIndex: "totalPrice",
      width: "6%",
      render: (text) => {
        return <NumberFormatter text={text} />;
      },
    },

    {
      title: () => {
        return <BoldText title={"Ngày nhận hàng"} />;
      },
      width: "8%",
      key: "formattedReceivedDate",
      dataIndex: "formattedReceivedDate",
    },

    {
      title: () => {
        return <BoldText title={"Thao tác"} />;
      },
      key: "actions",
      width: "5%",
      fixed: "right",
      render: (record) => {
        return (
          <div className="divActs">
            <Button
              icon={<EditOutlined />}
              type="primary"
              title="Đổi trạng thái"
              onClick={() => handleClick_EditStatus(record)}
            ></Button>
            <Button
              icon={<EllipsisOutlined />}
              type="primary"
              title="Chi tiết"
              onClick={() => {
                hookSetOrderDetail(record);
                handleOpenNewPage({ path: "/orderDetail", params: record._id });
              }}
            ></Button>
            <Popconfirm
              overlayInnerStyle={{ width: 300 }}
              title="Bạn muốn xóa không ?"
              okText="Đồng ý"
              cancelText="Đóng"
              onConfirm={() => handleConfirmDelete(record._id)}
            >
              <Button
                icon={<DeleteOutlined />}
                type="primary"
                danger
                style={{ fontWeight: 600 }}
                onClick={() => {}}
                title="Xóa"
              ></Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  //
  //Func redicrect page to orderDetail
  // const  handleClick_DetailBtn = (id)=>{
  //   // let path = `/orderDetail/${id}`;
  //   navigate("/home")
  // }
  const handleOk = () => {
    formUpdate.submit();
  };
  //

  const handleCancel = () => {
    setIsModalOpen(false);
    setSendingDateState(null);
    setReceivedDateState(null);
  };
  //
  const handleClick_EditStatus = (record) => {
    // console.log("show record:", record);
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);
    setSendingDateState(
      record.sendingDate
        ? moment(record.sendingDate).format("YYYY-MM-DD")
        : null
    );
    setReceivedDateState(
      record.receivedDate
        ? moment(record.receivedDate).format("YYYY-MM-DD")
        : null
    );
    let fieldsValues = {};
    fieldsValues.orderCode = record.orderCode;
    fieldsValues.createdDate = record.formattedCreatedDate;
    fieldsValues.status = record.status;
    fieldsValues.sendingDate = record.sendingDate
      ? moment(record.sendingDate)
      : null;
    fieldsValues.receivedDate = record.receivedDate
      ? moment(record.receivedDate)
      : null;
    formUpdate.setFieldsValue(fieldsValues);
  };

  const handleFinishCreate = (values) => {
    console.log("values:", values);
    //Config orderDetails before send to backend
    const getOrderDetails = values.orderDetails;
    const configOrderDetails = [];
    getOrderDetails.map((product) => {
      let tmpProduct = hookProductData.find((e) => (e._id = product.productId));
      configOrderDetails.push({
        productId: product.productId,
        size: product.size,
        quantity: product.quantity,
        price: tmpProduct.price,
        discount: tmpProduct.discount,
      });
    });
    //Add new handler
    const actionContent = "Tạo nhanh đơn hàng mới";
    const newHandler = customCreateAHandler(actionContent);
    const handlers = [newHandler];
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

    const newData = {
      contactInfo,
      shippingInfo,
      paymentInfo,
      orderDetails: configOrderDetails,
      handlers,
    };
    setLoadingBtn(true);
    //SUBMIT
    //POST
    axiosClient
      .post(`${URLOrder}/insertOne`, newData)
      .then((response) => {
        if (response.status === 201) {
          setLoading(true);
          // setIsCreate(false);
          setRefresh((e) => !e);
          setDetailCreatingStatus(false);
          formCreate.resetFields();
          notification.info({
            message: "Thông báo",
            description: "Thêm mới thành công",
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
  //
  const handleFinishUpdate = (values) => {
    console.log(values);
    //if not change values
    const tmp1 = {
      status: selectedRecord.status,
      sendingDate: selectedRecord.sendingDate,
      receivedDate: selectedRecord.receivedDate,
    };
    const tmp2 = {
      status: values.status,
      sendingDate: values.sendingDate,
      receivedDate: values.receivedDate,
    };
    if (JSON.stringify(tmp1) === JSON.stringify(tmp2)) {
      setIsModalOpen(false);
      formUpdate.resetFields();
      setSelectedId(null);
      return;
    }
    //
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
    //
    const customSendingDate = values.sendingDate
      ? values.sendingDate.format("YYYY-MM-DD")
      : null;
    const customReceivedDate = values.receivedDate
      ? values.receivedDate.format("YYYY-MM-DD")
      : null;

    let updateData = {
      status: values.status,
      sendingDate: customSendingDate,
      receivedDate: customReceivedDate,
    };
    //Add a handler -update new status
    if (changedStatus) {
      const actionContent = `Cập nhật trạng thái đơn hàng - ${changedStatus}`;
      const newHandler = customCreateAHandler(actionContent);
      // const handlers = [newHandler];
      let newHandlers = selectedRecord.handlers;
      newHandlers.push(newHandler);
      updateData = { ...updateData, handlers: newHandlers };
    }

    setLoadingBtn(true);
    //POST
    axiosClient
      .patch(`${URLOrder}/updateOne/${selectedId}`, updateData)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
          setLoading(true);
          setRefresh((e) => !e);
          formUpdate.resetFields();
          setSelectedId(null);
          setSendingDateState(null);
          setReceivedDateState(null);
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
  const handleConfirmDelete = (_id) => {
    setLoading(true);
    axiosClient
      .delete(URLOrder + "/deleteOne/" + _id)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          if (response.data?.noneExist) {
            console.log("test error");
            message.warning(response.data.noneExist);
          } else {
            message.info("Xóa thành công");
          }
        }
        setRefresh((e) => !e);
      })
      .catch((error) => {
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
        setLoading(false);
      })
      .finally(() => {});
  };

  const handleCancelCreate = () => {
    formCreate.resetFields();
    setDetailCreatingStatus(false);
  };

  const handleMouseLeaveCreate = () => {
    setDetailCreatingStatus(false);
    formCreate.resetFields();
  };
  useEffect(() => {
    setLoading(true);
    axiosClient.get(`${URLOrder}`).then((response) => {
      const orders = response.data.results;
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

        newOrders.push({
          ...e,
          formattedCreatedDate,
          formattedSendingDate,
          formattedReceivedDate,
        });
      });
      setOrders(newOrders);
      setLoading(false);
      setTotalDocs(newOrders.length);
    });
  }, [refresh]);
  //
  useEffect(() => {
    fetch("http://localhost:3000/data/countries+states+cities.json")
      .then((response) => response.json())
      .then((data) => setCountryList(data))
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    axiosClient.get(`${URLTransportation}`).then((response) => {
      hookSetTransportation(response.data.results);
    });
  }, []);

  useEffect(() => {
    axiosClient.get(`${URLProduct}`).then((response) => {
      hookSetProduct(response.data);
    });
  }, []);
  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        {/* Form create a new Order */}
        <Form
          {...PropsForm}
          labelCol={{ span: 0 }}
          form={formCreate}
          name="formCreate"
          onFinish={handleFinishCreate}
          onFinishFailed={() => {
            console.error("Error at onFinishFailed at formCreate");
          }}
          initialValues={{
            sendingDate: null,
            receivedDate: null,
            status: "WAITING",
            country: null,
            state: null,
            city: null,
            cardNumber: "5105105105105100",
            orderDetails: [{ quantity: 1 }],
          }}
        >
          <Form.Item
            {...PropsFormItem_Label_Name({
              label: "Ngày đặt hàng",
              name: "createdDate",
            })}
          >
            <Text strong>{moment(new Date()).format("DD-MM-YYYY")}</Text>
          </Form.Item>

          {/* When click more detail create form */}

          {detailCreatingStatus && (
            <Fragment>
              <Form.Item
                {...PropsFormItem_Label_Name({
                  label: "Tình trạng",
                  name: "status",
                })}
              >
                <Select style={{ width: 150 }} disabled>
                  {statusList.map((s, index) => {
                    return (
                      <Select.Option key={index + 1} value={s}>
                        {s}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <Divider style={{ backgroundColor: "#e3e6f2" }} />
              {/* Part 2- Contact Information */}
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

              <Form.Item {...PropsFormItemLastName} name="lastNameContactInfo">
                <Input placeholder="Last name" />
              </Form.Item>

              <Form.Item {...PropsFormItemEmail} name="emailContactInfo">
                <Input placeholder="Email" />
              </Form.Item>
            </Fragment>
          )}

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

          {detailCreatingStatus && (
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
                    formCreate.setFieldsValue({
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
                      statesListContactInfo.states.find((e) => e.name === value)
                    );
                    formCreate.setFieldsValue({ cityContactInfo: null });
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
                    name: "transportationId",
                  })}
                  rules={[
                    {
                      required: true,
                      message: "Trường dữ liệu không thể bỏ trống",
                    },
                  ]}
                >
                  <Select
                    style={{ width: 450 }}
                    loading={!hookTransportationData}
                    placeholder="Chọn"
                  >
                    {hookTransportationData &&
                      hookTransportationData.map((t) => {
                        const customPrice = numeral(t.price).format("0,0");
                        return (
                          <Select.Option key={t._id} value={t._id}>
                            {`${t.name}- giá: ${customPrice} VNĐ `}
                          </Select.Option>
                        );
                      })}
                  </Select>
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
                      formCreate.setFieldsValue({
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
                      formCreate.setFieldsValue({ cityShippingInfo: null });
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
                          message: "Vui lòng nhập đúng định dạng CardNumber",
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
                          pattern: /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/,
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
          )}

          <Form.List name="orderDetails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Fragment key={key}>
                    <Space
                      // key={key}
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
                          >
                            <Input
                              placeholder="Tên sản phẩm"
                              disabled
                              addonBefore={
                                <Form.Item
                                  name={[name, "productId"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Chưa chọn mã sản phẩm",
                                    },
                                  ]}
                                  noStyle
                                >
                                  <Select
                                    loading={!hookProductData}
                                    placeholder="Mã số"
                                    style={{ width: 100 }}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                    options={
                                      hookProductData &&
                                      hookProductData.map((e) => {
                                        const tmp = {
                                          value: e._id,
                                          label: e.productCode,
                                        };
                                        return tmp;
                                      })
                                    }
                                    onChange={(value) => {
                                      const found = hookProductData.find(
                                        (e) => e._id === value
                                      );
                                      const fields =
                                        formCreate.getFieldsValue();
                                      const { orderDetails } = fields;
                                      Object.assign(orderDetails[name], {
                                        productName: found.name,
                                        price: found.price,
                                        discount: found.discount,
                                      });
                                      formCreate.setFieldsValue({
                                        orderDetails,
                                      });
                                    }}
                                  />
                                </Form.Item>
                              }
                            />
                          </Form.Item>
                          <Form.Item
                            label=<LabelCustomization title={`Số lượng`} />
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
                              addonBefore={
                                <Form.Item
                                  name={[name, "size"]}
                                  noStyle
                                  rules={[
                                    {
                                      required: true,
                                      message: "Chưa chọn Size",
                                    },
                                  ]}
                                >
                                  <Select
                                    placeholder="Size"
                                    style={{
                                      width: 70,
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                    options={
                                      sizeList &&
                                      sizeList.map((s) => {
                                        const tmp = {
                                          value: s,
                                          label: s,
                                        };
                                        return tmp;
                                      })
                                    }
                                  />
                                </Form.Item>
                              }
                              style={{ minWidth: 120, maxWidth: 360 }}
                              min={0}
                              addonAfter="sản phẩm"
                            />
                          </Form.Item>
                          <Form.Item
                            label=<LabelCustomization title={`Giá tiền`} />
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
                            label=<LabelCustomization title={`Giảm giá`} />
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
                              style={{ minWidth: 120, maxWidth: 150 }}
                              min={0}
                              max={100}
                              addonAfter="%"
                            />
                          </Form.Item>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <MinusCircleOutlined
                            style={{ fontSize: 24, color: "red" }}
                            onClick={() => remove(name)}
                          />
                        </div>
                      </div>
                    </Space>
                    <Divider style={{ backgroundColor: "#e3e6f2" }} />
                  </Fragment>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm sản phẩm
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Space wrap>
              <Button type="primary" danger onClick={handleCancelCreate}>
                Hủy
              </Button>
              <Button
                type="primary"
                style={{ backgroundColor: "#33cc33" }}
                onClick={() => setDetailCreatingStatus((e) => !e)}
              >
                {detailCreatingStatus ? `Thu gọn` : `Chi tiết`}
              </Button>
              <Button type="primary" htmlType="submit" loading={loadingBtn}>
                Tạo mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
        {/*  */}
        <Table
          {...PropsTable({
            title: "danh sách đơn đặt hàng",
            isLoading: loading,
            isLoadingBtn: loadingBtn,
          })}
          onRow={() => {
            return { onClick: handleMouseLeaveCreate };
          }}
          columns={columns}
          dataSource={orders}
          pagination={{
            total: totalDocs,
            showTotal: (totalDocs, range) =>
              `${range[0]}-${range[1]} of ${totalDocs} items`,
            defaultPageSize: 10,
            defaultCurrent: 1,
          }}
        />
        {/* Form update status of a Order */}
        <Modal
          title="Cập nhật trạng thái đơn hàng"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          width={800}
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
              Cập nhật
            </Button>,
          ]}
        >
          <Form
            {...PropsForm}
            form={formUpdate}
            name="formUpdate"
            onFinish={handleFinishUpdate}
            onFinishFailed={() => {
              console.error("Error at onFinishFailed at formUpdate");
            }}
          >
            <Fragment>
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
                        formUpdate.setFieldsValue({
                          receivedDate: null,
                          sendingDate: null,
                        });
                        setSendingDateState(null);
                        setReceivedDateState(null);
                        break;
                      case "SHIPPING":
                        if (sendingDateState) {
                          formUpdate.setFieldsValue({
                            receivedDate: null,
                          });
                          setReceivedDateState(null);
                        } else {
                          formUpdate.setFieldsValue({
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
                          formUpdate.setFieldsValue({
                            receivedDate: moment(new Date()),
                          });
                          setReceivedDateState(
                            moment(new Date()).format("YYYY-MM-DD")
                          );
                        } else if (!sendingDateState) {
                          formUpdate.setFieldsValue({
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
                        formUpdate.setFieldsValue({
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
                        formUpdate.getFieldsValue(["createdDate"]).createdDate
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
                        formUpdate.setFieldsValue({ receivedDate: null });
                        setReceivedDateState(null);
                      }
                    } else {
                      formUpdate.setFieldsValue({ receivedDate: null });
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
                      formUpdate.setFieldsValue({ status: "COMPLETED" });
                    } else {
                      setReceivedDateState(null);
                    }
                  }}
                />
              </Form.Item>
            </Fragment>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}

export default Orders;
