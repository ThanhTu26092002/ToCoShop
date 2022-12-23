import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Table, Upload } from "antd";
import React from "react";
import { BoldText, ImgIcon } from "../../../components/subComponents";
import { WEB_SERVER_UPLOAD_URL } from "../../../config/constants";
import { beforeUpload } from "../../../config/helperFuncs";
import { PropsTable } from "../../../config/props";
function CustomTable({
  loading,
  loadingBtn,
  totalDocs,
  categories,
  handleMouseLeaveCreate,
  handleConfirmDelete,
  handleClick_EditBtn,
  handleUploadImage,
}) {
  const columns = [
    {
      title: () => {
        return <BoldText title={"Nhà phân phối "} />;
      },
      key: "name",
      dataIndex: "name",
      width: "10%",
      fixed: "left",
      render: (text) => {
        return <BoldText title={text} />;
      },
    },
    {
      title: () => {
        return <BoldText title={"Hình ảnh"} />;
      },
      key: "imageUrl",
      dataIndex: "imageUrl",
      width: "100px",
      render: (text) => {
        return (
          <div className="loadImg">
            <img
              src={
                text && text !== "null"
                  ? `${WEB_SERVER_UPLOAD_URL}${text}`
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
      title: () => {
        return <BoldText title={"Email"} />;
      },
      key: "email",
      dataIndex: "email",
      width: "20%",
    },
    {
      title: () => {
        return <BoldText title={"Số điện thoại"} />;
      },
      key: "phoneNumber",
      dataIndex: "phoneNumber",
      width: "10%",
    },
    {
      title: () => {
        return <BoldText title={"Địa chỉ"} />;
      },
      key: "address",
      dataIndex: "address",
    },
    {
      title: () => {
        return <BoldText title={"Thao tác"} />;
      },
      key: "actions",
      width: "9%",
      fixed: "right",
      render: (record) => {
        return (
          <div className="divActs">
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
                icon={<ImgIcon />}
                style={{ backgroundColor: "#1890ff" }}
              ></Button>
            </Upload>
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
        isLoadingBtn: loadingBtn,
        title: "Danh sách nhà phân phối",
      })}
      onRow={() => {
        return { onClick: handleMouseLeaveCreate };
      }}
      columns={columns}
      dataSource={categories}
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
