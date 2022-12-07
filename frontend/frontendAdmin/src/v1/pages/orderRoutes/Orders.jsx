import React, { Fragment, useEffect, useRef, useState } from "react";
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
import ChosenProducts from "./components/ChosenProducts";
import { customDisabledDate } from "../../config/helperFuncs";
const { Title, Text } = Typography;

function Orders() {
  const paymentMethodList = ["CREDIT CARD", "COD"];
  const statusList = ["WAITING", "SHIPPING", "COMPLETED", "CANCELED"];

  // const [isCreate, setIsCreate] = useState(false);
  const [selectedPaymentCreditCard, setSelectedPaymentCreditCard] =
    useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState(null);
  const [transportationList, setTransportationList] = useState();
  const [totalDocs, setTotalDocs] = useState(0);
  const [countryList, setCountryList] = useState(null);
  const [statesListContactInfo, setStatesListContactInfo] = useState(null);
  const [cityListContactInfo, setCityListContactInfo] = useState(null);
  const [statesListShippingInfo, setStatesListShippingInfo] = useState(null);
  const [cityListShippingInfo, setCityListShippingInfo] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [createdDateState, setCreatedDateState] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [sendingDateState, setSendingDateState] = useState(null);
  const [receivedDateState, setReceivedDateState] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [selectedTransportationPrice, setSelectedTransportationPrice] =
    useState(null);

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const columns = [
    {
      title: () => {
        return <BoldText title={"Mã đơn hàng "} />;
      },
      key: "_id",
      dataIndex: "_id",
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
      width: "3%",
      fixed: "right",
      render: (record) => {
        return (
          <div className="divActs">
            <Button
              icon={<EditOutlined />}
              type="primary"
              title="Đổi trạng thái"
              onClick={() => handleClick_EditBtn(record)}
            ></Button>
            <Button
              icon={<EllipsisOutlined />}
              type="primary"
              title="Chi tiết"
              // onClick={() => handleClick_DetailBtn(record)}
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

  //Begin: Props for components

  //End: Props for components
  const disabledDate = (current) => {
    return current >= moment();
  };

  const handleOk = () => {
    formUpdate.submit();
  };
  //

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  //
  const handleClick_EditBtn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);
    let fieldsValues = {};

    fieldsValues._id = record._id;
    fieldsValues.createdDate = moment(record.createdDate);
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
    console.log("values create:", values);
    return;
    setLoadingBtn(true);
    //SUBMIT
    let newData = { ...values };

    //POST
    axiosClient
      .post(`${URLOrder}/insertOne`, newData)
      .then((response) => {
        if (response.status === 201) {
          setLoading(true);
          // setIsCreate(false);
          setRefresh((e) => !e);
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

  const handleCreateBtn = () => {
    // setIsCreate(true);
  };
  const handleCancelCreate = () => {
    formCreate.resetFields();
    // setIsCreate(false);
  };

  const handleMouseLeaveCreate = () => {
    // setIsCreate(false);
    formCreate.resetFields();
  };
  useEffect(() => {
    setLoading(true);
    axiosClient.get(`${URLOrder}`).then((response) => {
      const orders = response.data.results;
      let newOrders = [];
      orders.map((e) => {
        // Formatting dates before showing
        let formattedCreatedDate = null;
        let formattedSendingDate = null;
        let formattedReceivedDate = null;

        if (e.createdDate) {
          formattedCreatedDate = formattedDate(e.createdDate);
        }

        if (e.sendingDate) {
          formattedSendingDate = formattedDate(e.sendingDate);
        }

        if (e.receivedDate) {
          formattedReceivedDate = formattedDate(e.receivedDate);
        }

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
      setTransportationList(response.data.results);
    });
  }, []);

  useEffect(() => {
    axiosClient.get(`${URLProduct}`).then((response) => {
      setProducts(response.data);
     console.log('demo:',  response.data)
    });
  }, []);

  const prefixSelectorProduct = (name) =>{
    return (
      <Form.Item name="productCode" noStyle style={{minWidth: 150}}>
        <Select
          loading={!products}
          placeholder="Mã số"
          style={{ width: 100 }}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={
            products &&
            products.map((e) => {
              const tmp = { value: e._id, label: e.productCode };
              return tmp;
            })
          }
      //     onChange={(value)=>{
      //       // console.log(products.find((e) => e._id === value).name)
      //       // formCreate.setFieldsValue({products: 'demo'})
      //       const fields = formCreate.getFieldsValue()
      //       console.log(fields)
      //       console.log(key)
      //       console.log(value)
      // const { products } = fields
      // Object.assign(products[key], { chosenProductName: 'after' })
      // formCreate.setFieldsValue({ products })
      //     }}
        />
      </Form.Item>
    );
  }
  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        <Form
          {...PropsForm}
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
          }}
        >
          {/* <ChosenProducts /> */}
          <Fragment>
            <Form.Item
              {...PropsFormItem_Label_Name({
                label: "Ngày đặt hàng",
                name: "createdDate",
              })}
            >
              <Text strong>{moment(new Date()).format("DD-MM-YYYY")}</Text>
            </Form.Item>
            <Form.Item {...PropsFormItemEmail} name="emailContactInfo">
              <Input placeholder="Email"/>
            </Form.Item>

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
            <Form.List name="products"
                 
           
             >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Form.Item
                     {...restField}
                      key={key}
                      name={[name, 'chosenProductName']}
                      label={`Sản phẩm ${index}`}
                    >
                      <Input
                        addonBefore={prefixSelectorProduct(name)}
                        placeholder="Số lượng"
                        style={{
                          width: "100%",
                        }}
                        addonAfter={
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            style={{ color: "#ff4d4f" }}
                          />
                        }
                      />
                    </Form.Item>
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
          </Fragment>
          {/* Part 1 - date&&status*/}
          {/* <Text strong style={{ color: "blue" }}>
              Trạng thái đơn hàng
            </Text> */}
          <Fragment>
            {/* <Form.Item
                {...PropsFormItem_Label_Name({
                  label: "Tình trạng",
                  name: "status",
                })}
              >
                <Select
                  style={{ width: 150 }}
                  onChange={(e) => {
                    switch (e) {
                      case "WAITING":
                        formCreate.setFieldsValue({
                          receivedDate: null,
                          sendingDate: null,
                        });
                        setSendingDateState(null);
                        setReceivedDateState(null);
                        break;
                      case "SHIPPING":
                        if (sendingDateState) {
                          formCreate.setFieldsValue({
                            receivedDate: null,
                          });
                          setReceivedDateState(null);
                        } else {
                          formCreate.setFieldsValue({
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
                        if (sendingDateState) {
                          formCreate.setFieldsValue({
                            receivedDate: moment(new Date()),
                          });
                          setReceivedDateState(
                            moment(new Date()).format("YYYY-MM-DD")
                          );
                        } else {
                          formCreate.setFieldsValue({
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
                        formCreate.setFieldsValue({
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
                  disabledDate={(current) => customDisabledDate(current, createdDateState)}
                  placeholder="dd-mm-yyyy"
                  format={dateFormatList}
                  value={moment(sendingDateState)}
                  onChange={(e) => {
                    console.log("receivedDate:", receivedDateState);
                    if (e) {
                      setSendingDateState(e.format("YYYY-MM-DD"));
                      if (
                        moment(e.format("YYYY-MM-DD")) >
                        moment(receivedDateState)
                      ) {
                        message.error(
                          "Ngày chuyển hàng không thể lớn hơn ngày nhận hàng"
                        );
                        formCreate.setFieldsValue({ receivedDate: null });
                        setReceivedDateState(null);
                      }
                    } else {
                      formCreate.setFieldsValue({ receivedDate: null });
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
                  disabledDate={(current) => customDisabledDate(current, sendingDateState)}
                  placeholder="dd-mm-yyyy"
                  format={dateFormatList}
                  onChange={(e) => {
                    if (e) {
                      setReceivedDateState(e.format("YYYY-MM-DD"));
                      formCreate.setFieldsValue({ status: "COMPLETED" });
                    } else {
                      setReceivedDateState(null);
                    }
                  }}
                />
              </Form.Item> */}
          </Fragment>

          {/* Part 05- Adding a note for description of employee's action */}
          {/* <Fragment>
              <Form.Item
                {...PropsFormItem_Label_Name({
                  label: "Mô tả thao tác",
                  name: "handlerAction",
                })}
              >
                <TextArea rows={3} placeholder="Mô tả thao tác của bạn" />
              </Form.Item>
            </Fragment> */}
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
              <Button type="primary" htmlType="submit" loading={loadingBtn}>
                Tạo mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
        {/* )} */}
      </Content>
    </Layout>
  );
}

export default Orders;
