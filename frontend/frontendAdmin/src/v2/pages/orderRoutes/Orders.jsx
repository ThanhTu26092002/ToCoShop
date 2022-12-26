import React, { useEffect, useState } from "react";
import "../../css/CommonStyle.css";
import moment from "moment";
import numeral from "numeral";

import {
  Button,
  Layout,
  Form,
  message,
  notification,
  Modal,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import {
  URLOrder,
  URLTransportation,
  URLProduct,
} from "../../config/constants";
import axiosClient from "../../config/axios";
import formattedDate from "../../utils/commonFuncs";
import { customCreateAHandler } from "../../config/helperFuncs";
import CustomTable from "./components/CustomTable";
import CustomFormOrder from "./components/CustomFormOrder";
import CustomFormUpdateStatus from "./components/CustomFormUpdateStatus";

function Orders() {
  const [transportations, setTransportations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loadingBtnStatus, setLoadingBtnStatus] = useState(false);
  const [orders, setOrders] = useState(null);
  const [changedStatus, setChangedStatus] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [detailCreatingStatus, setDetailCreatingStatus] = useState(false);
  const [createdDateState, setCreatedDateState] = useState(null);
  const [sendingDateState, setSendingDateState] = useState(null);
  const [receivedDateState, setReceivedDateState] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState({});

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const handleChangeStatus = (e) => {
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
          formUpdate.setFieldsValue({
            receivedDate: moment(new Date()),
          });
          setReceivedDateState(moment(new Date()).format("YYYY-MM-DD"));
        } else if (!sendingDateState) {
          formUpdate.setFieldsValue({
            sendingDate: moment(new Date()),
            receivedDate: moment(new Date()),
          });
          setSendingDateState(moment(new Date()).format("YYYY-MM-DD"));
          setReceivedDateState(moment(new Date()).format("YYYY-MM-DD"));
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
  };

  const handleChangeSendingDate = (e) => {
    if (e) {
      setSendingDateState(e.format("YYYY-MM-DD"));
      if (moment(e.format("YYYY-MM-DD")) > moment(receivedDateState)) {
        message.error("Ngày chuyển hàng không thể sau ngày nhận hàng");
        formUpdate.setFieldsValue({
          receivedDate: null,
          status: "SHIPPING",
        });
        setReceivedDateState(null);
      }
    } else {
      formUpdate.setFieldsValue({ receivedDate: null });
      setReceivedDateState(null);
    }
  };

  const handleChangeReceivedDate = (e) => {
    if (e) {
      setReceivedDateState(e.format("YYYY-MM-DD"));
      formUpdate.setFieldsValue({ status: "COMPLETED" });
    } else {
      setReceivedDateState(null);
    }
  };

  const handleCanceledDetailCreating = () => setDetailCreatingStatus((e) => !e);
  const handleOk = () => {
    formUpdate.submit();
  };
  //

  const handleCancel = () => {
    setIsModalOpen(false);
    formUpdate.resetFields();
    setSendingDateState(null);
    setReceivedDateState(null);
  };
  //
  const handleClick_EditStatus = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);
    setCreatedDateState(moment(record.createdDate).format("YYYY-MM-DD"));
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
    //Config orderDetails before send to backend
    const getOrderDetails = values.orderDetails;
    const configOrderDetails = [];
    getOrderDetails.map((product) => {
      let tmpProduct = products.find((e) => e._id === product.productId);
      for (let i = 0; i < tmpProduct.attributes.length; i++) {
        if (
          tmpProduct.attributes[i].color === product.color &&
          tmpProduct.attributes[i].size === product.size
        ) {
          configOrderDetails.push({
            productAttributeId: tmpProduct.attributes[i]._id,
            quantity: product.quantity,
            price: product.price,
            size: product.size,
            color: product.color,
            discount: product.discount,
            productName: product.productName,
          });
          break;
        }
      }
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
        transportationPrice: numeral(values.transportationPrice).value(),
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
    }else{
      //Bởi vì chưa làm thanh toán CREDIT CARD, nên sẽ truyền mặc định paymentMethod:COD
      paymentInfo = { ...paymentInfo, paymentMethod: "COD"};
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
    setLoadingBtnStatus(true);
    //POST
    axiosClient
      .patch(`${URLOrder}/updateOne/${selectedId}`, updateData)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
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
        setLoadingBtnStatus(false);
      });
  };
  const handleConfirmDelete = (_id) => {
    setLoading(true);
    axiosClient
      .delete(URLOrder + "/deleteOne/" + _id)
      .then((response) => {
        if (response.status === 200) {
          if (response.data?.noneExist) {
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
      })
      .finally(() => {
        setLoading(false);
      });
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
        let formattedFullName = e.contactInfo.firstName + " " + e.contactInfo.lastName
        newOrders.push({
          ...e,
          formattedCreatedDate,
          formattedSendingDate,
          formattedReceivedDate,
          formattedFullName
        });
      });
      setOrders(newOrders);
      setLoading(false);
      setTotalDocs(newOrders.length);
    });
  }, [refresh]);

  useEffect(() => {
    axiosClient.get(`${URLTransportation}`).then((response) => {
      setTransportations(response.data.results);
    });
  }, []);
  useEffect(() => {
    axiosClient.get(`${URLProduct}/10GetAllBestDiscount`).then((response) => {
      setProducts(response.data.results);
    });
  }, []);

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        {/* Form create a new Order */}
        <CustomFormOrder
          form={formCreate}
          products={products}
          transportations={transportations}
          loadingBtn={loadingBtn}
          handleCancel={handleCancelCreate}
          handleCanceledDetailCreating={handleCanceledDetailCreating}
          handleFinish={handleFinishCreate}
          detailCreatingStatus={detailCreatingStatus}
        />
        {/*  */}
        <CustomTable
          handleClick_EditStatus={handleClick_EditStatus}
          handleConfirmDelete={handleConfirmDelete}
          loading={loading}
          handleMouseLeaveCreate={handleMouseLeaveCreate}
          totalDocs={totalDocs}
          orders={orders}
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
              loading={loadingBtnStatus}
              onClick={handleOk}
            >
              Cập nhật
            </Button>,
          ]}
        >
          <CustomFormUpdateStatus
            formUpdate={formUpdate}
            createdDateState={createdDateState}
            sendingDateState={sendingDateState}
            handleChangeSendingDate={handleChangeSendingDate}
            handleChangeReceivedDate={handleChangeReceivedDate}
            handleFinishUpdate={handleFinishUpdate}
            handleChangeStatus={handleChangeStatus}
          />
        </Modal>
      </Content>
    </Layout>
  );
}

export default Orders;
