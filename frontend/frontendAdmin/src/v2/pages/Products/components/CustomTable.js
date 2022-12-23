import React from "react";
import { Button, Space, Table, Popconfirm, Upload } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { WEB_SERVER_UPLOAD_URL } from "../../../config/constants";
import { beforeUpload } from "../../../config/helperFuncs";
import { PropsTable } from "../../../config/props";

function CustomTable({
  handleUploadImage,
  products,
  handleMouseLeaveCreate,
  totalDocs,
  handleClick_EditBtn,
  handleConfirmDelete,
  loading
}) {
  const columns = [
    {
      title: "Hình ảnh",
      key: "coverImage",
      dataIndex: "coverImage",
      width: "100px",
      render: (text) => {
        return (
          <div className="loadImg">
            <img
              src={
                text && text !== "null"
                  ? `${WEB_SERVER_UPLOAD_URL}/${text}`
                  : "./images/noImage.jpg"
              }
              style={{ width: "100%", height: "100%" }}
              alt=""
            ></img>
          </div>
        );
      },
    },
    {
      title: "Mã sản phẩm ",
      key: "productCode",
      dataIndex: "productCode",

    //   sorter: (a, b) => a.name.length - b.name.length,
      render: (Text) => {
        return <span style={{ fontWeight: "600" }}>{Text}</span>;
      },
    },
    {
      title: "Tên sản phẩm ",
      key: "name",
      dataIndex: "name",

      // defaultSortOrder: 'ascend',
    //   sorter: (a, b) => a.name.length - b.name.length,
      render: (Text) => {
        return <span style={{ fontWeight: "600" }}>{Text}</span>;
      },
    },

    {
      title: "Nhóm sản phẩm",
      key: "categoryName",
      dataIndex: "categoryName",
      render: (text) => {
        return (
          <div style={{ textAlign: "left" }}>
            {" "}
            {text ? (
              text
            ) : (
              <span style={{ color: "red" }}>Không tìm thấy</span>
            )}
          </div>
        );
      },
    },
    {
      title: "NCC",
      key: "supplierName",
      dataIndex: "supplierName",
      render: (text) => {
        return (
          <div style={{ textAlign: "left" }}>
            {" "}
            {text ? (
              text
            ) : (
              <span style={{ color: "red" }}>Không tìm thấy</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Mô tả",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "10%",
      fixed: "right",
      render: (record) => {
        return (
          <Space>
            <Upload
              beforeUpload={(file) => beforeUpload(file)}
              showUploadList={false}
              name="file"
              customRequest={(options) => {
                handleUploadImage(options, record);
              }}
            >
              <Button
                title="Cập nhật ảnh"
                icon={<UploadOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              ></Button>
            </Upload>
            <Button
              type="dashed"
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
    {...PropsTable({ isLoading: loading, title:"Danh mục sản phẩm" })}
      rowKey="_id"
      columns={columns}
      dataSource={products}
      onRow={() => {
        return { onClick: handleMouseLeaveCreate };
      }}
      pagination={{
        total: totalDocs,
        showTotal: (totalDocs, range) =>
          `${range[0]}-${range[1]} of ${totalDocs} items`,
        defaultPageSize: 20,
        defaultCurrent: 1,
      }}
    />
  );
}

export default CustomTable;
