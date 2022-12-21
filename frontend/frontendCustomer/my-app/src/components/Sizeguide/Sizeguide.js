import React from "react";
import "./Sizeguide.css";
function Sizeguide({ closeSizeguide }) {
  return (
    <div className="guideBackground">
      <div className="sizeguideContainer">
        <div className="closeSizeguidebtn">
          <button
            onClick={() => {
              closeSizeguide(false);
            }}
          >
            X
          </button>
        </div>
        <div className="titleSizeguide">
          <p>Hướng dẩn chọn size</p>
        </div>
        <div className="bodySizeguide">
            <table>
                <tr>
                    <th></th>
                    <th>S</th>
                    <th>M</th>
                    <th>L</th>
                </tr>
                <tr>
                    <td>Cân nặng</td>
                    <td>40-42</td>
                    <td>43-46</td>
                    <td>46-50</td>
                </tr>
                <tr>
                    <td>Chiều cao</td>
                    <td>143-145</td>
                    <td>146-149</td>
                    <td>149-155</td>
                </tr>
            </table>
        </div>
      </div>
    </div>
  );
}

export default Sizeguide;
