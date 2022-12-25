import React, { Fragment } from "react";
import moment from "moment";
import { Form, Input, DatePicker, Select } from "antd";
import { PropsForm, PropsFormItem_Label_Name } from "../../../config/props";
import { customDisabledDate } from "../../../config/helperFuncs";
import { dateFormatList, statusList } from "../../../config/constants";

function CustomFormUpdateStatus({
  formUpdate,
  createdDateState,
  sendingDateState,
  handleChangeSendingDate,
  handleChangeReceivedDate,
  handleFinishUpdate,
  handleChangeStatus,
}) {
  return (
    <Form
      {...PropsForm}
      form={formUpdate}
      name={`${formUpdate}`}
      onFinish={handleFinishUpdate}
      onFinishFailed={() => {
        console.error("Error at onFinishFailed at formUpdate");
      }}
    >
      <Fragment>
        <Form.Item
          {...PropsFormItem_Label_Name({
            nameTitle: "orderCode",
            labelTitle: "Mã đơn hàng",
          })}
        >
          <Input disabled bordered={false} />
        </Form.Item>
        <Form.Item
          {...PropsFormItem_Label_Name({
            labelTitle: "Ngày đặt hàng",
            nameTitle: "createdDate",
          })}
        >
          <Input disabled bordered={false} />
        </Form.Item>

        <Form.Item
          {...PropsFormItem_Label_Name({
            labelTitle: "Tình trạng",
            nameTitle: "status",
          })}
        >
          <Select style={{ width: 150 }} onChange={handleChangeStatus}>
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
            labelTitle: "Ngày chuyển hàng",
            nameTitle: "sendingDate",
          })}
        >
          <DatePicker
            showToday={false}
            disabledDate={(current) => {
              return customDisabledDate(current, createdDateState);
            }}
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
      </Fragment>
    </Form>
  );
}

export default CustomFormUpdateStatus;
