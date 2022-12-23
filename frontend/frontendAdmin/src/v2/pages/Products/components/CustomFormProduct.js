import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Space,
  Select,
  InputNumber,
  Typography,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { PropsFormItem_Label_Name } from "../../../config/props";
import TextArea from "antd/lib/input/TextArea";
import { colorList, sizeList } from "../../../config/constants";
import { PropsForm } from "../../../config/props";
import { promotionPositionOptions } from "../../../config/constants";
function CustomFormProduct({
  form,
  handleFinish,
  handleCancel,
  loadingBtn,
  categories,
  suppliers,
}) {
  const [selectedPMItems, setSelectedPMItems] = useState([]);
  const optionspromotion = [];
  optionspromotion.push(...promotionPositionOptions);

  return (
    <Form
      {...PropsForm}
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 0 }}
      form={form}
      onFinish={handleFinish}
      initialValues={{
        productCode: "",
        name: "",
        attributes: [],
        description: "",
        categoryId: "",
        supplierId: "",
      }}
    >
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Mã sản phẩm",
          nameTitle: "productCode",
          require: true,
        })}
      >
        <Input placeholder="Mã sản phẩm" />
      </Form.Item>

      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Tên sản phẩm",
          require: true,
          nameTitle: "name",
        })}
      >
        <Input placeholder="Tên sản phẩm" />
      </Form.Item>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <Typography.Text strong>
          CHI TIẾT: Size-Màu sắc- Số lượng- Giá tiền- Giảm giá
        </Typography.Text>
      </div>
      <Form.List
        name={"attributes"}
        rules={[
          {
            validator: async (_, attributes) => {
              if (!attributes || attributes.length < 1) {
                return Promise.reject(
                  new Error("Vui lòng nhập chi tiết sản phẩm")
                );
              }
            },
          },
        ]}
      >
        {(field, { add, remove }, { errors }) => (
          <>
            {field.map((field, index) => {
              return (
                <Space
                  style={{
                    display: "flex",
                    marginBottom: 8,
                    alignItems: "center",
                  }}
                  align="baseline"
                  //  direction="horizontal"
                  key={field.key}
                >
                  <Form.Item
                    name={[field.name, "size"]}
                    label={`${index + 1}`}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        message: "Chưa chọn Size",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Size"
                      style={{
                        width: 70,
                      }}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={
                        sizeList &&
                        sizeList.map((s) => {
                          const tmp = {
                            value: s,
                            label: s,
                          };
                          return tmp;
                        })
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "color"]}
                    rules={[
                      {
                        required: true,
                        message: "Chưa chọn màu sản phẩm",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Màu"
                      style={{
                        width: 120,
                      }}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={
                        colorList &&
                        colorList.map((s) => {
                          const tmp = {
                            value: s,
                            label: s,
                          };
                          return tmp;
                        })
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "stock"]}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số lượng hàng trong kho",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Số lượng"
                      formatter={(value) =>
                        ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ width: 200 }}
                      min={0}
                      addonAfter="Sản phẩm"
                    ></InputNumber>
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "price"]}
                    rules={[
                      {
                        required: true,
                        message: "Chưa nhập giá tiền",
                      },
                    ]}
                  >
                    <InputNumber
                      defaultValue={0}
                      formatter={(value) =>
                        ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ width: 200 }}
                      min={0}
                      addonAfter="VNĐ"
                      placeholder="giá bán"
                    />
                  </Form.Item>
                  <Form.Item name={[field.name, "discount"]}>
                    <InputNumber
                      defaultValue={0}
                      style={{ width: 200 }}
                      min={0}
                      max={100}
                      placeholder="giảm giá"
                      addonAfter="%"
                    />
                  </Form.Item>
                  <MinusCircleOutlined
                    style={{ height: 40, color: "red" }}
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                </Space>
              );
            })}
            <Form.Item>
              <Button
                icon={<PlusOutlined />}
                type="dashed"
                block
                onClick={() => {
                  add();
                }}
              >
                Thêm size
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Nhóm khuyến mãi",
          nameTitle: "promotionPosition",
          require: false,
        })}
      >
        <Select
          mode="multiple"
          allowClear
          style={{
            width: "100%",
          }}
          value={selectedPMItems}
          placeholder="Chọn..."
          onChange={setSelectedPMItems}
          options={optionspromotion}
        />
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          nameTitle: "categoryId",
          labelTitle: "Loại hàng hóa",
          require: true,
        })}
      >
        <Select placeholder="Chọn tùy thuộc danh mục" loading={!categories}>
          {categories &&
            categories.map((c) => {
              return (
                <Select.Option key={c._id} value={c._id}>
                  {c.name}
                </Select.Option>
              );
            })}
        </Select>
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          nameTitle: "supplierId",
          labelTitle: "Nhà phân phối",
          require: true,
        })}
      >
        <Select placeholder="Chọn nhà phân phối" loading={!suppliers}>
          {suppliers &&
            suppliers.map((c) => {
              return (
                <Select.Option key={c._id} value={c._id}>
                  {c.name}
                </Select.Option>
              );
            })}
        </Select>
      </Form.Item>
      <Form.Item
        {...PropsFormItem_Label_Name({
          labelTitle: "Mô tả sản phẩm",
          nameTitle: "description",
          require: true,
        })}
      >
        <TextArea rows={3} placeholder="Mô tả sản phẩm mới" />
      </Form.Item>
      {handleCancel && (
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Space wrap>
            <Button type="primary" danger onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loadingBtn}>
              Tạo mới
            </Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );
}

export default CustomFormProduct;
