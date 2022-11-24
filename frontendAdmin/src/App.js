import React from "react";
import "./App.css";
import { ConfigProvider, Layout, Menu, Space } from "antd";
import {
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import FooterLayout from "./layout/FooterLayout";
import HeaderLayout from "./layout/HeaderLayout";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
const { Content, Sider } = Layout;
function App() {
  const navigate = useNavigate();
  return (
    <ConfigProvider>
      <Layout>
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
          <div className="logo" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["4"]}
            onClick={({ key }) => {
              if (key === "signout") {
                console.log("Sign out");
              } else {
                navigate(key)
              }
            }}
          >
            <Menu.Item key="/">
              <Space>
                <HomeOutlined />
                <span>Home</span>
              </Space>
            </Menu.Item>
            
            <Menu.Item key="/login">
              <Space>
                <LoginOutlined />
                <span>Login</span>
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
            >
              <Space>
                <UnorderedListOutlined />
                Suppliers
              </Space>
            </Menu.Item>

            <Menu.Item
              key="/products"
            >
              <Space>
                <UnorderedListOutlined />
                Products
              </Space>
            </Menu.Item>

            <Menu.Item
              key="/orders"
            >
              <Space>
                <UnorderedListOutlined />
                Orders
              </Space>
            </Menu.Item>

            <Menu.Item key="signout">
              <Space>
                <LogoutOutlined />
                Sign out
              </Space>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <HeaderLayout />
          <Content
            style={{
              margin: "24px 16px 0",
            }}
          >
            <div
              className="site-layout-background"
              style={{
                padding: 24,
                minHeight: 360,
              }}
            >
              <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/employees" element={<Employees />}></Route>
                <Route path="/categories" element={<Categories />}></Route>
                <Route path="/suppliers" element={<Suppliers />}></Route>
                <Route path="/products" element={<Products />}></Route>
                <Route path="/orders" element={<Orders />}></Route>
              </Routes>
            </div>
          </Content>
          <FooterLayout />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
