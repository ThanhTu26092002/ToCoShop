import React, { Fragment, useEffect } from "react";
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
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import MyProfile from "./pages/MyProfile";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Slides from "./pages/Slides";
import Orders from "./pages/orderRoutes/Orders";
import OrderDetail from "./pages/orderRoutes/OrderDetail";
import Statistics from "./pages/orderRoutes/Statistics";
import useAuth, { useCurrentPage } from "./hooks/useZustand";
import styles from "./ToCoShopV1.module.css";
import { ICON_NoImage } from "./config/constants";
const { Content, Sider } = Layout;

function ToCoShopV1() {
  const navigate = useNavigate();
  const { signOut, auth } = useAuth((state) => state);

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
    getItem("Nhân viên", "/employees", <UsergroupAddOutlined />, <Employees />),
    getItem(
      "Danh mục sản phẩm",
      "/categories",
      <UnorderedListOutlined />,
      <Categories />
    ),
    getItem(
      "Nhà phân phối",
      "/suppliers",
      <UnorderedListOutlined />,
      <Suppliers />
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
        "/orderDetail",
        <UnorderedListOutlined />,
        <OrderDetail />
      ),
      getItem(
        "Thống kê",
        "/statistics",
        <UnorderedListOutlined />,
        <Statistics />
      ),
    ]),
    getItem("Slides", "/slides", <UnorderedListOutlined />, <Slides />),
    getItem("Đăng xuất", "signOut", <LogoutOutlined />),
  ];

  return (
    <ConfigProvider>
      <Layout>
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
                style={{ height: 32, width: "100%" }}
              />
            </div>
            <Menu
              theme="dark"
              mode="inline"
              // defaultOpenKeys={["/orderList"]}
              defaultOpenKeys={
                ["/orders", "/orderDetail", "/statistics"].includes(
                  window.location.pathname
                )
                  ? ["/orderList"]
                  : []
              }
              defaultSelectedKeys={[window.location.pathname]}
              // selectedKeys={[currentPage]}
              items={itemsAfterLogin}
              onClick={({ key }) => {
                if (key === "signOut") {
                  signOut();
                  navigate("/login");
                } else {
                  console.log("key:", key);
                  navigate(key);
                }
              }}
            ></Menu>
          </Sider>
        )}
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
            </div>
          </Content>
          <FooterLayout />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default ToCoShopV1;
