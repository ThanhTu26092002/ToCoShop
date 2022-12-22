import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Table } from "antd";
import React from "react";
import { BoldText, NumberFormatter } from "../../../components/subComponents";
import { PropsTable } from "../../../config/props";

function CustomTable({
  loading,
  loadingBtn,
  transportations,
  totalDocs,
  handleClick_EditBtn,
  handleConfirmDelete,
}) {
  const columns = [
    {
      title: "Tên",
      key: "name ",
      dataIndex: "name",
      render: (text) => {
        return <BoldText title={text} />;
      },
    },
    {
      title: "Giá vận chuyển",
      key: "price",
      dataIndex: "price",
      render: (text) => {
        return <NumberFormatter text={text} />;
      },
    },
    {
      title: "Tên công ty",
      key: "companyName",
      dataIndex: "companyName",
    },
    {
      title: "Số điện thoại công ty",
      key: "companyPhoneNumber",
      dataIndex: "companyPhoneNumber",
    },
    {
      title: "Email công ty",
      key: "companyEmail",
      dataIndex: "companyEmail",
    },
    {
      title: "Ghi chú",
      key: "note",
      dataIndex: "note",
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
              title="Chỉnh sửa"
              onClick={() => handleClick_EditBtn(record)}
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
                loading={loadingBtn}
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
        isLoading: loading,
        title: "Danh sách các thức vận chuyển hàng",
        isLoadingBtn: loadingBtn,
      })}
      columns={columns}
      dataSource={transportations}
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

export default CustomTable;
