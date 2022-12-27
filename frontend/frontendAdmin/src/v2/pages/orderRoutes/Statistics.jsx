import React, { useEffect, useState } from "react";
import axiosClient from "../../config/axios";
import { URLOrder } from "../../config/constants";
import formattedDate from "../../utils/commonFuncs";
import CustomTableStatistic from "./components/CustomTableStatistic";

import { Form, Layout, message } from "antd";
import { Content } from "antd/lib/layout/layout";
function Statistics() {
  const [orders, setOrders] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
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
        let formattedFullName =
          e.contactInfo.firstName + " " + e.contactInfo.lastName;
        let formattedShippingAddress = "Chưa xác định";
        if (e.shippingInfo) {
          if (e.shippingInfo.address.detailAddress) {
            formattedShippingAddress = e.shippingInfo.address.detailAddress + ", ";
          }
          if (e.shippingInfo.address.city) {
            formattedShippingAddress += e.shippingInfo.address.city + ", ";
          }
          if (e.shippingInfo.address.state) {
            formattedShippingAddress += e.shippingInfo.address.state + ", ";
          }
          if (e.shippingInfo.address.country) {
            formattedShippingAddress += e.shippingInfo.address.country;
          }
        }
        newOrders.push({
          ...e,
          formattedCreatedDate,
          formattedSendingDate,
          formattedReceivedDate,
          formattedFullName,
          formattedShippingAddress,
        });
      });
      setOrders(newOrders);
      setLoading(false);
      setTotalDocs(newOrders.length);
    });
  }, [refresh]);

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
      <Form>
        
      </Form>
        <CustomTableStatistic
          handleConfirmDelete={handleConfirmDelete}
          loading={loading}
          totalDocs={totalDocs}
          orders={orders}
        />
        {/* Form update status of a Order */}
      </Content>
    </Layout>
  );
}

export default Statistics;
