import { Button, Form, Input, Space } from 'antd';
import React, { Fragment, useEffect, useState } from 'react'
import { URLProduct } from '../../../config/constants';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

function ChosenProducts() {
    const [products, setProducts] = useState(null);

//     useEffect(()=>{
// fetch(URLProduct)
//     ,[]})
  return (
    <Fragment>
       <Form.List name="products">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{
                  display: 'flex',
                  marginBottom: 8,
                }}
                align="baseline"
              >
                <Form.Item
                  {...restField}
                  name={[name, 'first']}
                  rules={[
                    {
                      required: true,
                      message: 'Missing first name',
                    },
                  ]}
                >
                  <Input placeholder="First Name" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'last']}
                  rules={[
                    {
                      required: true,
                      message: 'Missing last name',
                    },
                  ]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add field
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Fragment>
  )
}

export default ChosenProducts