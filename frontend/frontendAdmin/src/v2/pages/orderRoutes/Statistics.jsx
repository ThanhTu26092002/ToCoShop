import React, { useEffect, useState } from "react";
import axiosClient from "../../config/axios";
import { URLOrder } from "../../config/constants";
import formattedDate from "../../utils/commonFuncs";
import CustomTableStatistic from "./components/CustomTableStatistic";
import { Content } from "antd/lib/layout/layout";
import {Button, DatePicker, Form, Layout, message, Space } from "antd";
import { PropsForm, PropsFormItem_Label_Name } from "../../config/props";
import moment from "moment";
import { formatterOrdersData } from "../../config/helperFuncs";
const { RangePicker } = DatePicker;
function Statistics() {
  const [form] = Form.useForm();

  const [orders, setOrders] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

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

  const handleFinish = (values)=>{
    setLoadingBtn(true)
    setLoading(true)
console.log('values', values.date[0])
const dateFrom = moment(values.date[0]).format("YYYY-MM-DD")
const dateTo = moment(values.date[1]).format("YYYY-MM-DD")
    axiosClient.get(`${URLOrder}/11sold?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((response) => {
      const orders = response.data.results;
      let newOrders = formatterOrdersData(orders);
      setOrders(newOrders);
      setLoading(false);
      setTotalDocs(newOrders.length);
    });
    setLoadingBtn(false)
    setLoading(false)
  }

  const handleCancel = () => {
    form.resetFields();
  };
  //
  useEffect(() => {
    setLoading(true);
    axiosClient.get(`${URLOrder}`).then((response) => {
      const orders = response.data.results;
      let newOrders = formatterOrdersData(orders);
      setOrders(newOrders);
      setLoading(false);
      setTotalDocs(newOrders.length);
    });
  }, [refresh]);

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
      <Form
      {...PropsForm}
      form={form}
      name="form"
      onFinish={handleFinish}
      onFinishFailed={() => {
        console.error("Error at onFinishFailed at formCreate");
      }}
    >

      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Chọn ngày",
          nameTitle: "date",
          require: true
        })}
      >
        <RangePicker />
      </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Space wrap>
            <Button type="primary" danger 
            onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" 
            loading={loadingBtn}
            >
              Tìm kiếm
            </Button>
          </Space>
        </Form.Item>
      
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
