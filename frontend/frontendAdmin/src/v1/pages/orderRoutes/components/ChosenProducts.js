import { Form, Input } from 'antd';
import React, { Fragment, useEffect, useState } from 'react'
import { URLProduct } from '../../../config/constants';

function ChosenProducts() {
    const [products, setProducts] = useState(null);

//     useEffect(()=>{
// fetch(URLProduct)
//     ,[]})
  return (
    <Fragment>
        {/* <Fo */}
        <Form.Item>
            <Input placeholder='demo something' />
        </Form.Item>
    </Fragment>
  )
}

export default ChosenProducts