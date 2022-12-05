import React, { useEffect, useRef, useState } from "react";
import "../../css/CommonStyle.css";
import moment from "moment";
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
  LocaleProvider,
  Select,
  Divider,
  Typography,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";

import { URLOrder, WEB_SERVER_UPLOAD_URL } from "../../config/constants";
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
const { Title, Text } = Typography;

function Orders() {
  const [isCreate, setIsCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [countryList, setCountryList] = useState(null);
  const [statesList, setStatesList] = useState(null);
  const [cityList, setCityList] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [onChangeCountry, setOnChangeCountry] = useState(false);
  const [onchangeState, setOnChangeState] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState({});

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const dateFormatList = ["DD-MM-YYYY", "DD-MM-YY"];
  const savedCreatedDate = useRef(moment(new Date()));
  const savedSendingDate = useRef(null);
  const saveReceivedDate = useRef(null);
  const savedSelectedCountry = useRef(null);
  const savedSelectedState = useRef(null);

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
              icon={<EllipsisOutlined />}
              type="primary"
              title="Chi tiết"
              onClick={() => handleClick_DetailBtn(record)}
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

  const disabledForSending = (current) => {
    return current < moment(savedCreatedDate.current);
  };

  const disabledForReceived = (current) => {
    return current < moment(savedSendingDate.current);
  };

  const handleOk = () => {
    formUpdate.submit();
  };
  //

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  //
  const handleClick_DetailBtn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);
    let fieldsValues = {};
    for (let key in record) {
      fieldsValues[key] = record[key];
    }
    formUpdate.setFieldsValue(fieldsValues);
  };

  const handleFinishCreate = (values) => {
    setLoadingBtn(true);
    //SUBMIT
    let newData = { ...values };

    //POST
    axiosClient
      .post(`${URLOrder}/insertOne`, newData)
      .then((response) => {
        if (response.status === 201) {
          setLoading(true);
          setIsCreate(false);
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
    setIsCreate(true);
  };
  const handleCancelCreate = () => {
    formCreate.resetFields();
    setIsCreate(false);
  };

  const handleMouseLeaveCreate = () => {
    setIsCreate(false);
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
    console.log("country: ",savedSelectedCountry.current)
    setStatesList(savedSelectedCountry.current);
  }, [onChangeCountry]);

  useEffect(() => {
    console.log("state: ",savedSelectedState.current)

    setCityList(savedSelectedState.current);
  }, [onchangeState]);

  const statusList = ["WAITING", "SHIPPING", "COMPLETED", "CANCELED"];
  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        {!isCreate && (
          <Button type="primary" onClick={handleCreateBtn}>
            Tạo mới
          </Button>
        )}
        {isCreate && (
          <Form
            {...PropsForm}
            form={formCreate}
            name="formCreate"
            onFinish={handleFinishCreate}
            onFinishFailed={() => {
              console.error("Error at onFinishFailed at formCreate");
            }}
            initialValues={{
              createdDate: moment(new Date()),
              sendingDate: null,
              receivedDate: null,
              status: "WAITING",
              country: null,
              state: null,
              city: null,
            }}
          >
            <Form.Item
              {...PropsFormItem_Label_Name({
                label: "Ngày đặt hàng",
                name: "createdDate",
              })}
              rules={[
                {
                  required: true,
                  message: "Ngày đặt hàng không thể để trống!",
                },
              ]}
            >
              <DatePicker
                showToday={false}
                disabledDate={disabledDate}
                format={dateFormatList}
                onChange={(e) => {
                  if (e) {
                    savedCreatedDate.current = e.format("YYYY-MM-DD");
                    if (
                      moment(savedCreatedDate.current) >
                        moment(savedSendingDate.current) &&
                      savedCreatedDate.current !== null
                    ) {
                      message.error(
                        "Ngày đặt hàng không thể lớn hơn ngày chuyển hàng"
                      );
                      formCreate.setFieldsValue({ sendingDate: null });
                    }
                  } else {
                    savedCreatedDate.current = null;
                  }
                }}
              />
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
                  switch (e) {
                    case "SHIPPING":
                      formCreate.setFieldsValue({
                        sendingDate: moment(new Date()),
                      });
                      formCreate.setFieldsValue({ receivedDate: null });
                      break;
                    case "COMPLETED":
                      if (savedSendingDate.current === null) {
                        formCreate.setFieldsValue({
                          sendingDate: moment(new Date()),
                        });
                      }
                      formCreate.setFieldsValue({
                        receivedDate: moment(new Date()),
                      });
                      break;
                    case "CANCELED":
                      formCreate.setFieldsValue({ receivedDate: null });
                      break;
                    default:

                    // formCreate.setFieldsValue({ sendingDate: null });
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
                disabledDate={disabledForSending}
                placeholder="dd-mm-yyyy"
                format={dateFormatList}
                onChange={(e) => {
                  if (e) {
                    savedSendingDate.current = e.format("YYYY-MM-DD");
                    formCreate.setFieldsValue({ status: "SHIPPING" });

                    if (savedCreatedDate.current === null) {
                      message.error("Chưa nhập ngày đặt đơn hàng");
                      formCreate.setFieldsValue({ sendingDate: null });
                    }

                    if (
                      moment(savedSendingDate.current) >
                        moment(saveReceivedDate.current) &&
                      saveReceivedDate.current !== null
                    ) {
                      message.error(
                        "Ngày đặt hàng không thể lớn hơn ngày chuyển hàng"
                      );
                      formCreate.setFieldsValue({ receivedDate: null });
                    }
                  } else {
                    savedSendingDate.current = null;
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
                disabledDate={disabledForReceived}
                placeholder="dd-mm-yyyy"
                format={dateFormatList}
                onChange={(e) => {
                  if (e) {
                    saveReceivedDate.current = e.format("YYYY-MM-DD");
                    formCreate.setFieldsValue({ status: "COMPLETED" });

                    if (savedSendingDate.current === null) {
                      message.error("Ngày nhận hàng phải sau ngày chuyển hàng");
                      formCreate.setFieldsValue({ receivedDate: null });
                    }
                  } else {
                    saveReceivedDate.current = null;
                  }
                }}
              />
            </Form.Item>

            <Divider style={{ backgroundColor: "#e3e6f2" }} />

            <Text strong style={{ color: "blue" }}>
              Thông tin người đặt hàng
            </Text>
            <Form.Item {...PropsFormItemFirstName} name='firstNameContactInfo'>
              <Input placeholder="Họ" />
            </Form.Item>

            <Form.Item {...PropsFormItemLastName} name='lastNameContactInfo'>
              <Input placeholder="Last name" />
            </Form.Item>

            <Form.Item {...PropsFormItemEmail} name='emailContactInfo' >
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              {...PropsFormItemPhoneNumber} name="phoneNumberContactInfo"
              rules={[
                ...PropsFormItemPhoneNumber.rules,
                {
                  required: true,
                  message: "Trường dữ liệu không thể bỏ trống",
                },
              ]}
            >
              <Input placeholder="Số điện thoại của nhan vien" />
            </Form.Item>

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
                  savedSelectedCountry.current = countryList.find(
                    (e) => e.name === value
                  );
                  setOnChangeCountry(e => !e)

                }}
              >
                {countryList &&
                  countryList.map((e) => {
                    return (
                      <Select.Option key={e.id} value={e.name}>
                        {e.name}
                      </Select.Option>
                    );
                  })}
              </Select>
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
                  console.log('states: ', statesList)
                  savedSelectedState.current = statesList.states.find(
                    (e) => e.name === value
                  );
                  setOnChangeState(e => !e)
                }}
              >
                {statesList &&
                  statesList.states.map((state) => {
                    return (
                      <Select.Option key={state.id} value={state.name}>
                        {state.name}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>

            <Form.Item
              {...PropsFormItem_Label_Name({
                label: "Thành phố/ Huyện",
                name: "cityContactInfo",
              })}
            >
              <Select placeholder="Chọn..." style={{ width: 150 }}>
                {cityList &&
                  cityList?.cities?.map((city) => {
                    return (
                      <Select.Option key={city.id} value={city.name}>
                        {city.name}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>

            <Form.Item {...PropsFormItemDetailAddress} name= 'detailAddressContactInfo'>
              <Input placeholder="Địa chỉ cụ thể" />
            </Form.Item>

            <Divider style={{ backgroundColor: "#e3e6f2" }} />
            
            
            <Divider style={{ backgroundColor: "#e3e6f2" }} />

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
        )}
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

        {/* <Modal
        title="Chỉnh sửa thông tin danh mục"
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
            Sửa
          </Button>,
        ]}
      >
        <Form
          {...PropsForm}
          form={formUpdate}
          name="formUpdate"
          onFinish={handleFinishUpdate}
          onFinishFailed={() => {
            // message.info("Error at onFinishFailed at formUpdate");
            console.error("Error at onFinishFailed at formUpdate");
          }}
        >
          <Form.Item {...PropsFormItemName}>
            <Input placeholder="Tên danh mục " />
          </Form.Item>

          <Form.Item {...PropsFormItemDescription}>
            <TextArea rows={3} placeholder="Mô tả danh mục " />
          </Form.Item>
        </Form>
      </Modal> */}
      </Content>
    </Layout>
  );
}

export default Orders;
