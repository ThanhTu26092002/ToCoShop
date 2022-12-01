import React from "react";
import "./App.css";
import ToCoShopV1 from "./v1";
import "moment/locale/vi";
import locale from "antd/es/locale/vi_VN";
import { ConfigProvider } from "antd";
import {BrowserRouter} from 'react-router-dom';

function App() {
  return (

    <ConfigProvider locale={locale}>
    <BrowserRouter>
      <ToCoShopV1 />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
