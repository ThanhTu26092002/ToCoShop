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

function Orders() {
  const [isCreate, setIsCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState({});

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const dateFormatList = ["DD-MM-YYYY", "DD-MM-YY"];
  const savedCreatedDate = useRef(moment(new Date()));
  const savedSendingDate = useRef(null);
  const saveReceivedDate = useRef(null);
  const savedSelectedStatus = useRef(null);
  const createdDateUseRef = useRef();
  const sendingDateUseRef = useRef();
  const receivedDateUseRef = useRef();

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
  const PropsTable = {
    loading: {
      indicator: <Spin />,
      spinning: loading || loadingBtn,
    },
    style: { marginTop: 20 },
    rowKey: "_id",
    bordered: true,
    size: "small",
    scroll: { x: 1500, y: 400 },
    title: () => {
      return <TitleTable title="danh sách đơn đặt hàng" />;
    },
    footer: () =>
      "Nếu có vấn đề khi tương tác với hệ thống, xin vui lòng liên hệ số điện thoại 002233442",
  };

  const PropsForm = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    initialValues: {
      createdDate: moment(new Date()),
      sendingDate: null,
      receivedDate: null,
    },
    autoComplete: "off",
  };

  const PropsFormItemCreatedDate = {
    label: <LabelCustomization title={"Ngày đặt hàng"} />,
    name: "createdDate",
  };

  const PropsFormItemSendingDate = {
    label: <LabelCustomization title={"Ngày chuyển hàng"} />,
    name: "sendingDate",
  };

  const PropsFormItemReceivedDate = {
    label: <LabelCustomization title={"Ngày nhận hàng"} />,
    name: "receivedDate",
  };

  const PropsFormItemStatus = {
    label: <LabelCustomization title={"Tình trạng"} />,
    name: "status",
  };

  //End: Props for components
  const disabledDate = (current) => {
    return current >= moment();
  };

  const disabledForSending = (current) => {
    return current < moment(savedCreatedDate.current);
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
  const [demo, setDemo] = useState(null);

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
          >
            <Form.Item {...PropsFormItemCreatedDate}>
              <DatePicker
              ref={createdDateUseRef}
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

            <Form.Item {...PropsFormItemStatus}>
              <Select
                defaultValue="WAITING"
                style={{ width: 150 }}
                onChange={(e) => {
                  console.log("demo change status: ", e);
                  switch (e) {
                    case "SHIPPING":
                      if (savedCreatedDate.current) {
                        createdDateUseRef.current.forcus();
                        message.error("Chưa nhập ngày đặt đơn hàng");
                      }
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

            <Form.Item {...PropsFormItemSendingDate}>
              <DatePicker
                showToday={false}
                disabledDate={disabledForSending}
                placeholder="dd-mm-yyyy"
                format={dateFormatList}
                onChange={(e) => {
                  if (e) {
                    savedSendingDate.current = e.format("YYYY-MM-DD");
                    if (savedCreatedDate.current === null) {
                      message.error("Chưa nhập ngày đặt đơn hàng");
                      formCreate.setFieldsValue({ sendingDate: null });
                    }
                  } else {
                    savedSendingDate.current = null;
                  }
                }}
              />
            </Form.Item>

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
          {...PropsTable}
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
