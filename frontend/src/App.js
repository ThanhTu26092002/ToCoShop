import React from 'react';
import './App.css';
import { ConfigProvider, Layout } from 'antd';
import FooterLayout from './layout/FooterLayout';
import SiderLayout from './layout/SiderLayout';
import HeaderLayout from './layout/HeaderLayout';
const { Content } = Layout;
const App = () => (
  <ConfigProvider>
 <Layout >
   <SiderLayout/>
    <Layout>
      <HeaderLayout/>
      <Content
        style={{
          margin: '24px 16px 0',
        }}
      >
        <div
          className="site-layout-background"
          style={{
            padding: 24,
            minHeight: 360,
          }}
        >
          content
        </div>
      </Content>
      <FooterLayout/>
    </Layout>
  </Layout>
  </ConfigProvider>
 
);
export default App;