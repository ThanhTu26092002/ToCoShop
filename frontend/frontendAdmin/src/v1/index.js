import React from "react";
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
import MyProfile from "./pages/MyProfile";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import useAuth from "./hooks/useAuth";
import styles from "./ToCoShopV1.module.css";
const { Content, Sider } = Layout;

function ToCoShopV1() {
  const navigate = useNavigate();
  const { signOut, auth } = useAuth((state) => state);
  const itemsAfterLogin = [
    {
      label: "Home",
      key: "/home",
      icon: <HomeOutlined />,
      content: <Home />,
    },
    {
      label: "Thông tin cá nhân",
      key: "/my_profile",
      icon: <UserOutlined />,
      content: <MyProfile />,
    },
    {
      label: "Nhân viên",
      key: "/employees",
      icon: <UsergroupAddOutlined />,
      content: <Employees />,
    },
    {
      label: "Danh mục sản phẩm",
      key: "/categories",
      icon: <UnorderedListOutlined />,
      content: <Categories />,
    },
    {
      label: "Nhà phân phối",
      key: "/suppliers",
      icon: <UnorderedListOutlined />,
      content: <Suppliers />,
    },
    {
      label: "Sản phẩm",
      key: "/products",
      icon: <UnorderedListOutlined />,
      content: <Products />,
    },
    {
      label: "Đơn hàng",
      key: "/orders",
      icon: <UnorderedListOutlined />,
      content: <Orders />,
    },
    {
      label: "Đăng xuất",
      key: "signOut",
      // onClick: ()=> signOut(),
      icon: <LogoutOutlined />,
    },
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
                src="./images/logo_toCoShop.png"
                alt="logo"
                style={{ height: 32, width: "100%" }}
              />
            </div>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={["/home"]}
              items={itemsAfterLogin}
              onClick={({ key }) => {
                if (key === "signOut") {
                  signOut();
                  navigate("/login");
                } else {
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
                  return (
                    <Route 
                   key={index}
                      path={i.key}
                      element={
                        auth ? i.content : <Navigate to="/login" replace />
                      }
                    ></Route>
                  );
                })}
                {/* NO MATCH ROUTE */}
                {/* <Route
                  path="*"
                  element={<Navigate to="/home" replace />}
                  // element={
                  //   <main style={{ padding: "1rem" }}>
                  //     <p>404 Page not found 😂😂😂</p>
                  //   </main>
                  // }
                /> */}
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
