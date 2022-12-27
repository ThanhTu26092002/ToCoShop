import React from "react";
import { Button, Table, Popconfirm } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import {
  NumberFormatter,
  BoldText,
  ColorStatus,
} from "../../../components/subComponents";
import { PropsTable } from "../../../config/props";
import { handleOpenNewPage } from "../../../config/helperFuncs";

function CustomTableStatistic({
  handleClick_EditStatus,
  handleConfirmDelete,
  loading,
  handleMouseLeaveCreate,
  totalDocs,
  orders,
}) {
  const columns = [
    {
      title: "Mã đơn hàng ",
      key: "_id",
      dataIndex: "orderCode",
      width: "9%",
      fixed: "left",
      render: (text) => {
        return <BoldText title={text} />;
      },
    },

    {
      title: "Ngày đặt hàng",
      width: "5%",
      key: "formattedCreatedDate",
      dataIndex: "formattedCreatedDate",
    },
    {
      title: "Người đặt hàng",
      width: "8%",
      key: "formattedFullName",
      dataIndex: "formattedFullName",
    },
    {
      title: "Trạng thái",
      width: "7%",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        return <ColorStatus status={status} />;
      },
    },

    {
      title: "Ngày gửi hàng",
      width: "5%",
      key: "formattedSendingDate",
      dataIndex: "formattedSendingDate",
    },

    {
      title: "Tổng tiền",
      key: "totalPrice",
      dataIndex: "totalPrice",
      width: "6%",
      render: (text) => {
        return <NumberFormatter text={text} />;
      },
    },

    {
      title: "Ngày nhận hàng",
      width: "5%",
      key: "formattedReceivedDate",
      dataIndex: "formattedReceivedDate",
    },

    {
      title: "Thao tác",
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
  return (
    <Table
      {...PropsTable({
        title: "danh sách đơn đặt hàng",
        isLoading: loading,
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
  );
}

export default CustomTableStatistic;
