import React from "react";
import { Layout, Menu, Space } from "antd";
import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  PoweroffOutlined
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
          onClick ={({key}) => {
            if(key === "signout"){
              console.log('Sign out')
            }else{
              
            }
          }}
        >
        <Menu.Item key="/">
            <Space>
              <HomeOutlined />
              <span>Home</span>
            </Space>
          </Menu.Item>
          <Menu.Item key="/employees">
            <Space>
              <UserOutlined />
              <span>Employees</span>
            </Space>
          </Menu.Item>
          <Menu.Item key="/categories">
            <Space>
              <UnorderedListOutlined />
              Categories
            </Space>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            key="/suppliers"
            // onClick={() => {
            //   // signOut();
            //   console.log('Sign out!')
            // }}
          >
            <Space>
              <UnorderedListOutlined />
              Suppliers
            </Space>
          </Menu.Item>

          <Menu.Item key="signout">
            <Space>
              <PoweroffOutlined />
              Sign out
            </Space>
          </Menu.Item>

        </Menu>
      </Sider>
    </>
  );
}

export default SiderLayout;
