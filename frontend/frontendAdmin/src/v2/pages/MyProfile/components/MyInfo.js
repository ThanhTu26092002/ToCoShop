import React from "react";
import { Image, Spin } from "antd";
import moment from "moment";
import "moment/locale/vi";
import { Button, Upload, Descriptions } from "antd";
import { WEB_SERVER_UPLOAD_URL } from "../../../config/constants";
import { beforeUpload } from "../../../config/helperFuncs";

function MyInfo({
  loadingImg,
  myProfile,
  handleUploadImage,
  handleClick_EditBtn,
  handleClick_EditPasswordBtn,
  loadingBtn,
  loadingBtnPass
}) {
  return (
    <>
      <p>Thông Tin Cá Nhân</p>
      {loadingImg ? (
        <Spin size="large"></Spin>
      ) : (
        <>
          <Image
            src={`${WEB_SERVER_UPLOAD_URL}/${myProfile.imageUrl}`}
            width={100}
            height={100}
          />
          <Upload
            beforeUpload={(file) => beforeUpload(file)}
            showUploadList={false}
            name="file"
            customRequest={(options) => {
              handleUploadImage(options, myProfile);
            }}
          >
            <button
              title="Cập nhật ảnh"
              style={{
                cursor: "pointer",
                width: 100,
                backgroundColor: "#00cc99",
                border: "none",
                marginTop: "12px",
              }}
            >
              Cập nhật ảnh
            </button>
          </Upload>
        </>
      )}

      <Descriptions style={{ marginTop: 24 }}>
        <Descriptions.Item label="Họ">{myProfile.firstName}</Descriptions.Item>
        <Descriptions.Item label="Tên">{myProfile.lastName}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {myProfile.gender}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {moment(myProfile.birthday).format("DD-MM-YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{myProfile.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {myProfile.phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {myProfile.address}
        </Descriptions.Item>
      </Descriptions>
      <Button
        type="primary"
        style={{ width: 200 }}
        onClick={() => handleClick_EditBtn(myProfile)}
      >
        Cập nhật thông tin cá nhân
      </Button>
      <Button
        type="primary"
        danger
        style={{ width: 200, marginTop: 12 }}
        onClick={() => handleClick_EditPasswordBtn()}
        loading={loadingBtnPass}
      >
        Đổi mật khẩu
      </Button>
    </>
  );
}

export default MyInfo;
