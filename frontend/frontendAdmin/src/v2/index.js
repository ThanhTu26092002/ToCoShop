import React, { Fragment } from "react";
import { ConfigProvider, Layout, Menu } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import FooterLayout from "./layout/FooterLayout";
import HeaderLayout from "./layout/HeaderLayout";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import MyProfile from "./pages/MyProfile/MyProfile";
import Login from "./pages/Login";
import Employees from "./pages/Employees/Employees";
import Categories from "./pages/Categories/Categories";
import Suppliers from "./pages/Suppliers/Suppliers";
import Products from "./pages/Products/Products";
import Slides from "./pages/Sliders/Slides";
import Orders from "./pages/orderRoutes/Orders";
import OrderDetail from "./pages/orderRoutes/OrderDetail";
import Statistics from "./pages/orderRoutes/Statistics";
import useAuth from "./hooks/useZustand";
import styles from "./ToCoShopV2.module.css";
import QLLogins from "./pages/QLLogins/QLLogins";
import { ICON_NoImage } from "./config/constants";
import Transportations from "./pages/transportations/Transportations";
const { Content, Sider } = Layout;

function ToCoShopV1() {
  const navigate = useNavigate();
  const { signOut, auth } = useAuth((state) => state);
  let roles;
  let isAdmin = false;
  if (auth) {
    roles = auth.roles;
    isAdmin = roles.includes("ADMINISTRATORS");
  }
  function getItem(label, key, icon, content, children, type) {
    if (key === "signOut") {
      return {
        key,
        icon,
        children,
        label,
        type,
        content,
        danger: true,
      };
    }
    return {
      key,
      icon,
      children,
      label,
      type,
      content,
    };
  }

  const itemsAfterLogin = [
    getItem("Home", "/home", <HomeOutlined />, <Home />),
    getItem(
      "Thông tin cá nhân",
      "/my_profile",
      <UserOutlined />,
      <MyProfile />
    ),
    getItem("Sản phẩm", "/products", <UnorderedListOutlined />, <Products />),
    getItem("Đơn hàng", "/orderList", <UnorderedListOutlined />, <Orders />, [
      getItem(
        "Danh sách đơn hàng",
        "/orders",
        <UnorderedListOutlined />,
        <Orders />
      ),
      getItem(
        "Chi tiết đơn hàng",
        "/orderDetail/:id",
        <UnorderedListOutlined />,
        <OrderDetail />
      ),
      isAdmin &&
        getItem(
          "Thống kê",
          "/statistics",
          <UnorderedListOutlined />,
          <Statistics />
        ),
    ]),
    isAdmin &&
      getItem(
        "Nhân viên",
        "/employees",
        <UsergroupAddOutlined />,
        <Employees />
      ),
    isAdmin &&
      getItem(
        "Tài khoản đăng nhập",
        "/QLLogins",
        <UnorderedListOutlined />,
        <QLLogins />
      ),
    isAdmin &&
      getItem(
        "Danh mục sản phẩm",
        "/categories",
        <UnorderedListOutlined />,
        <Categories />
      ),
    isAdmin &&
      getItem(
        "Nhà phân phối",
        "/suppliers",
        <UnorderedListOutlined />,
        <Suppliers />
      ),
    isAdmin &&
      getItem("Slides", "/slides", <UnorderedListOutlined />, <Slides />),
    isAdmin &&
      getItem(
        "Phương thức vận chuyển",
        "/transportation",
        <UnorderedListOutlined />,
        <Transportations />
      ),
    getItem("Đăng xuất", "signOut", <LogoutOutlined />),
  ];
  return (
    <ConfigProvider>
      <Layout style={{ minHeight: "100vh" }}>
        {auth && (
          <Sider
            breakpoint="lg"
            collapsedWidth="0"
            onBreakpoint={(broken) => {
              // console.log(broken);
            }}
            onCollapse={(collapsed, type) => {
              // console.log(collapsed, type);
            }}
          >
            <div className={styles.logo}>
              <img
                src={ICON_NoImage}
                alt="logo"
                style={{ height: 35, width: "100%" }}
                onError={(e) => {
                  e.target.src = `../../${ICON_NoImage}`;
                }}
              />
            </div>
            <Menu
              theme="dark"
              mode="inline"
              defaultOpenKeys={
                ["/orders", "/statistics"].includes(window.location.pathname) ||
                window.location.pathname.includes("/orderDetail")
                  ? ["/orderList"]
                  : []
              }
              selectedKeys={
                window.location.pathname.includes("/orderDetail")
                  ? ["/orderDetail/:id"]
                  : [window.location.pathname]
              }
              items={itemsAfterLogin}
              onClick={({ key }) => {
                console.log("key", key);
                if (key === "signOut") {
                  signOut();
                  navigate("/login");
                } else if (key === "/orderDetail/:id") {
                  navigate("/orders");
                } else {
                  navigate(key);
                }
              }}
            ></Menu>
          </Sider>
        )}
        <Layout>
          <HeaderLayout />
          {/* <Content
            style={{
              margin: "24px 16px 0",
            }}
          > */}
          <Content
            className="site-layout-background"
            style={{
              margin: "24px 16px 0",
              padding: 24,
              // minHeight: 360,
              height: "87vh",
              overflowY: "auto",
            }}
          >
            <Routes>
              <Route
                path="/login"
                element={auth ? <Navigate to="/home" replace /> : <Login />}
              ></Route>
              {itemsAfterLogin.map((i, index) => {
                if (i.children) {
                  return (
                    <Fragment key={index}>
                      <Route
                        key={index}
                        // path={i.key}
                      ></Route>
                      {i.children.map((child, indexChild) => {
                        return (
                          <Route
                            key={indexChild}
                            path={child.key}
                            element={
                              auth ? (
                                child.content
                              ) : (
                                <Navigate to="/login" replace />
                              )
                            }
                          ></Route>
                        );
                      })}
                    </Fragment>
                  );
                } else {
                  return (
                    <Route
                      key={index}
                      path={i.key}
                      element={
                        auth ? i.content : <Navigate to="/login" replace />
                      }
                    ></Route>
                  );
                }
              })}
              {/* NO MATCH ROUTE */}
              <Route
                path="*"
                element={<Navigate to="/home" replace />}
                // element={
                //   <main style={{ padding: "1rem" }}>
                //     <p>404 Page not found 😂😂😂</p>
                //   </main>
                // }
              />
            </Routes>
          </Content>
          {/* </Content> */}
          <FooterLayout />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default ToCoShopV1;
