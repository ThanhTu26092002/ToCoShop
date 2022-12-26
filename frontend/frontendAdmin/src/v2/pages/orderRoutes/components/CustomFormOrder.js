import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import numeral from "numeral";
import {
  Button,
  Form,
  Input,
  notification,
  Space,
  Select,
  Divider,
  Typography,
  InputNumber,
  DatePicker,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import {
  sizeList,
  colorList,
  statusList,
  paymentMethodList,
  dateFormatList,
} from "../../../config/constants";
import LabelCustomization from "../../../components/subComponents";
import {
  PropsForm,
  PropsFormItemDetailAddress,
  PropsFormItemEmail,
  PropsFormItemFirstName,
  PropsFormItemLastName,
  PropsFormItemPhoneNumber,
  PropsFormItem_Label_Name,
} from "../../../config/props";
import {
  customDisabledDate,
  formatterNumber,
} from "../../../config/helperFuncs";
const { Text } = Typography;
function CustomFormOrder({
  isFormUpdate,
  form,
  products,
  transportations,
  handleCancel,
  handleCanceledDetailCreating,
  loadingBtn,
  handleFinish,
  detailCreatingStatus,
  handleChangeStatus,
  sendingDateState,
  handleChangeReceivedDate,
  handleChangeSendingDate,
  handlerToString,
}) {
  const [isShowHistory, setIsShowHistory] = useState(false);
  const [countryList, setCountryList] = useState(null);
  const [isChangeProduct, setIsChangeProduct] = useState(true);
  const [statesListContactInfo, setStatesListContactInfo] = useState(null);
  const [cityListContactInfo, setCityListContactInfo] = useState(null);
  const [statesListShippingInfo, setStatesListShippingInfo] = useState(null);
  const [cityListShippingInfo, setCityListShippingInfo] = useState(null);
  const [selectedPaymentCreditCard, setSelectedPaymentCreditCard] =
    useState(null);
  //
  useEffect(() => {
    fetch("http://localhost:3000/data/countries+states+cities.json")
      .then((response) => response.json())
      .then((data) => setCountryList(data))
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);
  return (
    <>
      <Form
        {...PropsForm}
        labelCol={{ span: 0 }}
        form={form}
        name={`${form}`}
        onFinish={handleFinish}
        onFinishFailed={() => {
          console.error("Error at onFinishFailed at this Form");
        }}
        initialValues={isFormUpdate? {}:{
          createdDate: moment(new Date()).format("DD-MM-YYYY"),
          sendingDate: null,
          receivedDate: null,
          status: "WAITING",
          country: null,
          state: null,
          city: null,
          paymentMethod: "COD",
          cardNumber: "5105105105105100",
          orderDetails: [{ quantity: 1 }],
        }}
      >
        {isFormUpdate && (
          <>
            <Form.Item
              {...PropsFormItem_Label_Name({
                nameTitle: "orderCode",
                labelTitle: "Mã đơn hàng",
              })}
            >
              <Input disabled bordered={false} />
            </Form.Item>
          </>
        )}
        <Form.Item
          {...PropsFormItem_Label_Name({
            labelTitle: "Ngày đặt hàng",
            nameTitle: "createdDate",
          })}
        >
          <Input bordered={false} disabled style={{ fontWeight: 700 }} />
        </Form.Item>
        {/* When click more detail create form */}
        {detailCreatingStatus && (
          <Fragment>
            <Form.Item
              {...PropsFormItem_Label_Name({
                labelTitle: "Tình trạng",
                nameTitle: "status",
              })}
            >
              <Select
                style={{ width: 150 }}
                disabled={!isChangeProduct}
                onChange={isChangeProduct ? handleChangeStatus : {}}
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
            { isChangeProduct &&
              <>
                <Form.Item
                  {...PropsFormItem_Label_Name({
                    labelTitle: "Ngày chuyển hàng",
                    nameTitle: "sendingDate",
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
                    onChange={handleChangeSendingDate}
                  />
                </Form.Item>

                <Form.Item
                  {...PropsFormItem_Label_Name({
                    labelTitle: "Ngày nhận hàng",
                    nameTitle: "receivedDate",
                  })}
                >
                  <DatePicker
                    showToday={false}
                    disabledDate={(current) =>
                      customDisabledDate(current, sendingDateState)
                    }
                    placeholder="dd-mm-yyyy"
                    format={dateFormatList}
                    onChange={handleChangeReceivedDate}
                  />
                </Form.Item>
              </>
            }
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
            <Form.Item {...PropsFormItemFirstName} name="firstNameContactInfo">
              <Input placeholder="Họ" />
            </Form.Item>
            <Form.Item {...PropsFormItemLastName} name="lastNameContactInfo">
              <Input placeholder="Last name" />
            </Form.Item>
            <Form.Item
              {...PropsFormItemEmail({ nameTitle: "emailContactInfo" })}
            >
              <Input placeholder="Email" />
            </Form.Item>
          </Fragment>
        )}
        <Form.Item
          {...PropsFormItemPhoneNumber({
            nameTitle: "phoneNumberContactInfo",
            require: true,
          })}
        >
          <Input placeholder="Số điện thoại của người đặt hàng" />
        </Form.Item>
        {/* When click more detail create form */}
        {detailCreatingStatus && (
          <Fragment>
            <Form.Item
              {...PropsFormItem_Label_Name({
                labelTitle: "Quốc gia",
                nameTitle: "countryContactInfo",
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
                labelTitle: "Tỉnh",
                nameTitle: "stateContactInfo",
              })}
            >
              <Select
                style={{ width: 150 }}
                placeholder="Chọn..."
                onChange={(value) => {
                  setCityListContactInfo(
                    statesListContactInfo.states.find((e) => e.name === value)
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
                labelTitle: "Thành phố/ Huyện",
                nameTitle: "cityContactInfo",
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
              {...PropsFormItemDetailAddress({
                nameTitle: "detailAddressContactInfo",
              })}
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
                  labelTitle: "Phương tiện vận chuyển",
                  nameTitle: "transportationPrice",
                  require: true,
                })}
              >
                <Input
                  style={{ width: 400 }}
                  disabled
                  addonAfter={"VNĐ"}
                  addonBefore={
                    <Form.Item
                      {...PropsFormItem_Label_Name({
                        labelTitle: "Phương tiện vận chuyển",
                        nameTitle: "transportationId",
                      })}
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
                          const priceText = numeral(found.price).format("0,0");
                          form.setFieldsValue({
                            transportationPrice: priceText,
                          });
                        }}
                      >
                        {transportations &&
                          transportations.map((t) => {
                            const customPrice = numeral(t.price).format("0,0");
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
              {...PropsFormItemLastName} name="lastNameShippingInfo">
                <Input placeholder="Last name" />
              </Form.Item>

              <Form.Item
                {...PropsFormItemEmail({ nameTitle: "emailShippingInfo" })}
              >
                <Input placeholder="Email" />
              </Form.Item>

              <Form.Item
                {...PropsFormItemPhoneNumber({
                  require: true,
                  nameTitle: "phoneNumberShippingInfo",
                })}
              >
                <Input placeholder="Số điện thoại người nhận" />
              </Form.Item>

              <Form.Item
                {...PropsFormItem_Label_Name({
                  labelTitle: "Quốc gia",
                  nameTitle: "countryShippingInfo",
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
                  labelTitle: "Tỉnh",
                  nameTitle: "stateShippingInfo",
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
                  labelTitle: "Thành phố/ Huyện",
                  nameTitle: "cityShippingInfo",
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
                {...PropsFormItemDetailAddress({
                  nameTitle: "detailAddressShippingInfo",
                })}
              >
                <Input placeholder="Địa chỉ cụ thể" />
              </Form.Item>

              <Form.Item
                {...PropsFormItem_Label_Name({
                  labelTitle: "Ghi chú",
                  nameTitle: "note",
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
                  labelTitle: "Phương thức thanh toán",
                  nameTitle: "paymentMethod",
                  require: true,
                })}
              >
                <Select
                  placeholder="Chọn"
                  disabled
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
                    label={<LabelCustomization title={"CardNumber"} />}
                    name="cardNumber"
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
                    label={<LabelCustomization title={"CardHolder"} />}
                    name="cardHolder"
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
                    label={<LabelCustomization title={"ExpDate"} />}
                    name="expDate"
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
                    label={<LabelCustomization title={"CVV"} />}
                    name="cvv"
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
                              <Form.Item name={[name, "productId"]} noStyle>
                                <Select
                                  loading={!products}
                                  placeholder="Mã số"
                                  style={{ width: 100 }}
                                  showSearch
                                  disabled={isFormUpdate}
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
                                    setIsChangeProduct(false);
                                    const found = products.find(
                                      (e) => e._id === value
                                    );
                                    let defaultSize = null;
                                    let defaultColor = null;
                                    let defaultPrice = null;
                                    let defaultDiscount = null;
                                    found.attributes.map((a) => {
                                      if (a.discount === found.maxDiscount) {
                                        defaultColor = a.color;
                                        defaultSize = a.size;
                                        defaultPrice = a.price;
                                        defaultDiscount = a.discount;
                                      }
                                    });
                                    const fields = form.getFieldsValue();
                                    const { orderDetails } = fields;
                                    Object.assign(orderDetails[name], {
                                      productName: found.name,
                                      color: defaultColor,
                                      size: defaultSize,
                                      quantity: 1,
                                      price: defaultPrice,
                                      discount: defaultDiscount,
                                    });
                                    form.setFieldsValue({
                                      orderDetails,
                                    });
                                  }}
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
                            placeholder="Size"
                            disabled={isChangeProduct || isFormUpdate}
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
                            onChange={() => {
                              const fields = form.getFieldsValue();
                              const { orderDetails } = fields;
                              Object.assign(orderDetails[name], {
                                color: null,
                              });
                              form.setFieldsValue({
                                orderDetails,
                              });
                            }}
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
                            disabled={isChangeProduct || isFormUpdate}
                            placeholder="Màu sắc"
                            style={{
                              width: 160,
                            }}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={
                              colorList &&
                              colorList.map((s) => {
                                const tmp = {
                                  value: s,
                                  label: s,
                                };
                                return tmp;
                              })
                            }
                            onChange={() => {
                              const fields = form.getFieldsValue();
                              const { orderDetails } = fields;
                              const tmpSize = orderDetails[name].size;
                              const tmpColor = orderDetails[name].color;
                              const tmpProductId = orderDetails[name].productId;
                              const found = products.find(
                                (e) => e._id === tmpProductId
                              );
                              let resetSize = tmpSize;
                              let resetColor = tmpColor;
                              let resetPrice, resetDiscount;
                              let checkExisting = false;
                              let listSize_Color =
                                "Sản phẩm này chỉ còn các loại( Màu- Size): ";
                              found.attributes.map((a) => {
                                if (
                                  a.size === tmpSize &&
                                  a.color === tmpColor
                                ) {
                                  checkExisting = true;
                                  Object.assign(orderDetails[name], {
                                    price: a.price,
                                    discount: a.discount,
                                  });
                                  form.setFieldsValue({
                                    orderDetails,
                                  });
                                  return;
                                } else if (a.discount === found.maxDiscount) {
                                  listSize_Color += `${a.color}- ${a.size} ; `;
                                  resetColor = a.color;
                                  resetSize = a.size;
                                  resetPrice = a.price;
                                  resetDiscount = a.discount;
                                } else {
                                  listSize_Color += ` ${a.size} - ${a.color} ; `;
                                }
                              });

                              if (!checkExisting) {
                                Object.assign(orderDetails[name], {
                                  color: resetColor,
                                  size: resetSize,
                                  price: resetColor,
                                  quantity: null,
                                  discount: resetDiscount,
                                });
                                form.setFieldsValue({
                                  orderDetails,
                                });
                                notification.error({
                                  message: `Kho hàng không còn mẫu hàng với size ${tmpSize}- màu ${tmpColor} `,
                                  description: listSize_Color,
                                  duration: 10,
                                });
                              }
                            }}
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
                            disabled={isChangeProduct || isFormUpdate}
                            style={{ minWidth: 120, maxWidth: 360 }}
                            min={1}
                            formatter={formatterNumber}
                            addonAfter="sản phẩm"
                            onChange={(value) => {
                              const fields = form.getFieldsValue();
                              const { orderDetails } = fields;
                              const tmpSize = orderDetails[name].size;
                              const tmpColor = orderDetails[name].color;
                              const tmpProductId = orderDetails[name].productId;
                              if (tmpSize && tmpColor) {
                                const found = products.find(
                                  (e) => e._id === tmpProductId
                                );
                                found.attributes.map((a) => {
                                  if (
                                    a.size === tmpSize &&
                                    a.color === tmpColor
                                  ) {
                                    if (value <= a.stock) {
                                      return Promise.resolve();
                                    }
                                    Object.assign(orderDetails[name], {
                                      quantity: null,
                                    });
                                    form.setFieldsValue({
                                      orderDetails,
                                    });
                                    return notification.error({
                                      message: `Kho hàng không còn mẫu hàng với size ${tmpSize}- màu ${tmpColor} `,
                                      description: `Kho hàng còn ${a.stock}`,
                                    });
                                  }
                                });
                              }
                            }}
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
                            disabled={isChangeProduct || isFormUpdate}
                            defaultValue={0}
                            formatter={(value) =>
                              ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                            disabled={isChangeProduct}
                            style={{ minWidth: 120, maxWidth: 150 }}
                            min={0}
                            max={100}
                            addonAfter="%"
                          />
                        </Form.Item>
                      </div>
                      {!isFormUpdate && (
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
                      )}
                    </div>
                  </Space>
                  <Divider style={{ backgroundColor: "#e3e6f2" }} />
                </Fragment>
              ))}
              {!isFormUpdate && (
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
              )}
            </>
          )}
        </Form.List>
        {isFormUpdate && (
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
        )}
        <Form.Item
          wrapperCol={{
            offset: isFormUpdate ? 8 : 4,
            span: 16,
          }}
        >
          <Space wrap>
            <Button type="primary" danger onClick={handleCancel}>
              Hủy
            </Button>
            {!isFormUpdate && (
              <Button
                type="primary"
                style={{ backgroundColor: "#33cc33" }}
                onClick={handleCanceledDetailCreating}
              >
                {detailCreatingStatus ? `Thu gọn` : `Chi tiết`}
              </Button>
            )}

            <Button type="primary" htmlType="submit" loading={loadingBtn}>
              {isFormUpdate ? "Cập nhật" : "Tạo mới"}
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
                <Typography.Title level={5}>Lịch sử cập nhật</Typography.Title>
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
    </>
  );
}

export default CustomFormOrder;
