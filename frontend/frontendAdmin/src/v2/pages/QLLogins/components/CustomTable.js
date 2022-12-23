import React from "react";
import { Button, Space, Table, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { PropsTable } from "../../../config/props";
import { ColorStatus } from "../../../components/subComponents";
function CustomTable({
  handleClick_EditBtn,
  handleConfirmDelete,
  loading,
  totalDocs,
  login,
}) {
  const columns = [
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      render: (Text) => {
        return <span style={{ fontWeight: "600" }}>{Text}</span>;
      },
    },
    {
      title: "Quyền",
      key: "formattedRoles",
      dataIndex: "formattedRoles",
      render: (Text) => {
        return <span>{Text}</span>;
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        return <ColorStatus status={status} />;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "7%",
      fixed: "right",
      render: (record) => {
        return (
          <Space>
            <Button
              title="Chỉnh sửa"
              type="primary"
              icon={<EditOutlined />}
              style={{ fontWeight: "600" }}
              onClick={() => {
                handleClick_EditBtn(record);
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
                type="danger"
                style={{ fontWeight: 600 }}
                onClick={() => {}}
                title="Xóa"
              ></Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <Table
      rowKey="_id"
      {...PropsTable({ isLoading: loading, title: "Danh sách tài khoản đăng nhập" })}
      columns={columns}
      dataSource={login}
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
