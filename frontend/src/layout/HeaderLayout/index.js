import React from 'react'
import { Layout } from 'antd';
const {  Header } = Layout;

function HeaderLayout() {
  return (
    <>
        <Header
        className="site-layout-sub-header-background"
        style={{
          padding: 0,
          backgroundColor:'#7ec7fc'
        }}
      >
      </Header>
    </>
  )
}

export default HeaderLayout