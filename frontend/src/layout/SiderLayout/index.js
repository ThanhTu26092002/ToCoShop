import React from "react";
import { Layout, Menu, Space } from "antd";
import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./SiderLayout.module.css";
const { Sider } = Layout;

function SiderLayout() {
  return (
    <>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className={styles.logo} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["4"]}
          // items={[UserOutlined, VideoCameraOutlined, UploadOutlined, UserOutlined].map(
          //   (icon, index) => ({
          //     key: String(index + 1),
          //     icon: React.createElement(icon),
          //     label: `nav ${index + 1}`,
          //   }),
          // )}
        >
          <Menu.Item key="user">
            <Space>
              <UserOutlined />
              <span>Xin chào: </span>
            </Space>
          </Menu.Item>
          <Menu.Item key="settings">
            <Space>
              <SettingOutlined />
              Cấu hình tài khoản
            </Space>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            key="signOut"
            onClick={() => {
              // signOut();
              console.log('Sign out!')
            }}
          >
            <Space>
              <LogoutOutlined />
              Thoát
            </Space>
          </Menu.Item>
        </Menu>
      </Sider>
    </>
  );
}

export default SiderLayout;
