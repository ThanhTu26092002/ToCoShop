import { Button, Popconfirm, Space, Table, Upload } from "antd";
import React from "react";
import { ColorStatus } from "../../../components/subComponents";
import { WEB_SERVER_UPLOAD_URL } from "../../../config/constants";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { PropsTable } from "../../../config/props";
import { beforeUpload } from "../../../config/helperFuncs";
function CustomTable({
  loading,
  slides,
  handleUploadImage,
  handleClick_EditBtn,
  handleConfirmDelete,
}) {
  const columns = [
    {
      title: "Hình ảnh",
      key: "imageUrl",
      dataIndex: "imageUrl",
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
      title: "Tiêu đề ",
      key: "title",
      dataIndex: "title",
      render: (Text) => {
        return <span style={{ fontWeight: "600" }}>{Text}</span>;
      },
    },
    {
      title: () => {
        return "Thứ tự";
      },
      width: "10%",
      key: "sortOrder",
      dataIndex: "sortOrder",
    },
    {
      title: () => {
        return "Trạng thái";
      },
      width: "10%",
      key: "status",
      dataIndex: "status",
      render: (text) => {
        return <ColorStatus status={text} />;
      },
    },
    {
      title: "Mô tả",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "Thao tác",
      fixed: "right",
      key: "actions",
      width: "10%",
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
      {...PropsTable({ isLoading: loading, title:"Danh sách ảnh trang chủ" })}
      rowKey="_id"
      columns={columns}
      dataSource={slides}
      pagination={false}
    />
  );
}

export default CustomTable;
