import { Form, Input } from "antd";
import React, { useState, useEffect } from "react";

function Countrystatecity() {
  fetch('http://localhost:3000/data/countries+states+cities.json')
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => {
    console.error('Error:', error);
  });
  return (
    <Form>

    <Form.Item
      label="Username"
      name="username"
      rules={[
        {
          required: true,
          message: "Please input your username!",
        },
      ]}
    >
      <Input />
    </Form.Item>
    </Form>

  );
}
export default Countrystatecity;
