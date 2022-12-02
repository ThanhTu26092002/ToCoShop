import React from "react";
import numeral from "numeral";

const urlIcon = "./imageIcons/icon03.png";

function ColorStatus({ status }) {
  let color = '#182747';
  if(status === 'SHIPPING'){
    color ='#332FD0'
  }else if( status === 'COMPLETED'){
    color ='#38E54D'
  }
  else if( status === 'CANCELED'){
    color ='#FF1E1E'
  }
  return <div style={{ fontWeight: 600, color }}>{status}</div>;
}


function LabelCustomization({ title }) {
  return <div style={{ fontWeight: 600 }}>{title}</div>;
}

function BoldText({ title, position= 'left' }) {
  return (
    <div
      style={{
        fontWeight: 600,
        textTransform: "capitalize",
        textAlign: position
      }}
    >
      {title}
    </div>
  );
}
//
function NumberFormatter({ text, symbol }) {
  return (
    <div style={{ textAlign: "right" }}> {numeral(text).format("0,0")}{symbol? symbol: ''}</div>
  );
}
//

function ImgIcon() {
  return (
    <img
      src={urlIcon}
      width="32px"
      height="32px"
      alt="test"
      background-color="green"
    />
  );
}
//
function TitleTable({ text }) {
  return (
    <div
      style={{
        textAlign: "center",
        fontWeight: 600,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
}

export default LabelCustomization;
export { BoldText, ImgIcon, TitleTable, NumberFormatter , ColorStatus};
