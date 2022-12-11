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
const { Text } = Typography;
const { Option } = Select;

function OrderDetail() {
  const paymentMethodList = ["CREDIT CARD", "COD"];
  const statusList = ["WAITING", "SHIPPING", "COMPLETED", "CANCELED"];

  // const [isCreate, setIsCreate] = useState(false);
  const [selectedPaymentCreditCard, setSelectedPaymentCreditCard] =
    useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState(null);
  const [transportationList, setTransportationList] = useState();
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

  const [formUpdate] = Form.useForm();

  const handleCancelUpdate = () => {
    formUpdate.resetFields();
    setDetailCreatingStatus(false);
  };

  const handleFinishUpdate = (values) => {
    console.log("values for update:", values);
    return;
    //The same values so don't need to update
    if (
      values.name === selectedRecord.name &&
      values.description === selectedRecord.description
    ) {
      setIsModalOpen(false);
      formUpdate.resetFields();
      setSelectedId(null);
      return;
    }
    setLoadingBtn(true);
    //POST
    axiosClient
      .patch(`${URLOrder}/updateOne/${selectedId}`, values)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
          setLoading(true);
          setRefresh((e) => !e);
          formUpdate.resetFields();
          setSelectedId(null);
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

  const { id } = useParams();
  console.log('hello:', id)
  if(id === ":id"){
handleOpenNewPage({path: "/orders", params: null})
  }
  useEffect(() => {
    setLoading(true);
    axiosClient.get(`${URLOrder}/orderDetail/${id}`).then((response) => {
      const orderDetail = response.data.results[0];
orderDetail.createdDate = formattedDate(orderDetail.createdDate);


formUpdate.setFieldsValue(orderDetail)
      console.log(orderDetail);
      setOrder(orderDetail);
    });

    setLoading(false);
  }, []);

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        {loading && <Spin size="large"></Spin>}
        {!loading && (
          <Fragment>
            <Form
              {...PropsForm}
              labelCol={{ span: 0 }}
              form={formUpdate}
              name="formUpdate"
              onFinish={handleFinishUpdate}
              onFinishFailed={() => {
                console.error("Error at onFinishFailed at formUpdate");
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
                  name: "_id",
                  label: "Mã đơn hàng",
                })}
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                {...PropsFormItem_Label_Name({
                  label: "Ngày đặt hàng",
                  name: "createdDate",
                })}
              >
                <Input disabled />
              </Form.Item>
              <Fragment>
                <Form.Item
                  {...PropsFormItem_Label_Name({
                    label: "Tình trạng",
                    name: "status",
                  })}
                >
                  <Select style={{ width: 150 }} >
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
                      formUpdate.setFieldsValue({
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
                      formUpdate.setFieldsValue({ cityContactInfo: null });
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
                      loading={!transportationList}
                      placeholder="Chọn"
                    >
                      {transportationList &&
                        transportationList.map((t) => {
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
                        formUpdate.setFieldsValue({
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
                        formUpdate.setFieldsValue({ cityShippingInfo: null });
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

              <Form.List name="orderDetails">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Space
                        key={key}
                        style={{
                          display: "flex",
                          marginBottom: 8,
                        }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          label=<LabelCustomization title={`Tên sản phẩm`} />
                          name={[name, "productName"]}
                        >
                          <Input
                            placeholder="Tên sản phẩm"
                            disabled
                            addonBefore={
                              <Form.Item
                                // label=<LabelCustomization
                                //   title={`Mã sản phẩm ${name + 1}`}
                                // />
                                // {...restField}
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
                                  loading={!products}
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
                                    products &&
                                    products.map((e) => {
                                      const tmp = {
                                        value: e._id,
                                        label: e.productCode,
                                      };
                                      return tmp;
                                    })
                                  }
                                  onChange={(value) => {
                                    let productName = products.find(
                                      (e) => e._id === value
                                    ).name;
                                    const fields = formUpdate.getFieldsValue();
                                    const { orderDetails } = fields;
                                    Object.assign(orderDetails[name], {
                                      productName: productName,
                                    });
                                    formUpdate.setFieldsValue({ orderDetails });
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
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
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
                  <Button type="primary" danger onClick={handleCancelUpdate}>
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
          </Fragment>
        )}
      </Content>
    </Layout>
  );
}

export default OrderDetail;
