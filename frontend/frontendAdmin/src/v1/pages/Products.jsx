import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Space,
  Select,
  Layout,
  InputNumber,
  Modal,
  Table,
  notification,
  message,
  Popconfirm,
  Upload,
  Typography,
} from "antd";
import Operation from "antd/lib/transfer/operation";
import {
  MinusCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  PropsForm,
  PropsFormItemDetailAddress,
  PropsFormItemEmail,
  PropsFormItemFirstName,
  PropsFormItemLastName,
  PropsFormItemPhoneNumber,
  PropsFormItemStatus,
  PropsFormItem_Label_Name,
  PropsTable,
} from "../config/props";
import { Content } from "antd/lib/layout/layout";
import TextArea from "antd/lib/input/TextArea";
import axios from "axios";
import {
  colorList,
  sizeList,
  URLProduct,
  WEB_SERVER_UPLOAD_URL,
} from "../config/constants";
import axiosClient from "../config/axios";
import { beforeUpload } from "../config/helperFuncs";
function Products() {
  const [isCreate, setIsCreate] = useState(false);
  const [categories, setCategories] = useState(null);
  const [suppliers, setSuppliers] = useState(null);
  const [products, setProducts] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [compare, setCompare] = useState({});
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();

  const columns = [
    {
      title: "hình ảnh",
      key: "coverImage",
      dataIndex: "coverImage",
      width: "100px",
      render: (text) => {
        return (
          <div className="loadImg">
            <img
              src={
                text && text !== "null"
                  ? `${WEB_SERVER_UPLOAD_URL}/${text}`
                  : "./images/noImage.jpg"
              }
              style={{ width: "100%", height: "100%" }}
              alt=""
            ></img>
          </div>
        );
      },
    },
    {
      title: "Mã sản phẩm ",
      key: "productCode",
      dataIndex: "productCode",

      sorter: (a, b) => a.name.length - b.name.length,
      render: (Text) => {
        return <span style={{ fontWeight: "600" }}>{Text}</span>;
      },
    },
    {
      title: "Tên sản phẩm ",
      key: "name",
      dataIndex: "name",

      // defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.length - b.name.length,
      render: (Text) => {
        return <span style={{ fontWeight: "600" }}>{Text}</span>;
      },
    },

    {
      title: "Nhóm sản phẩm",
      key: "categoryName",
      dataIndex: "categoryName",
      render: (text) => {
        return (
          <div style={{ textAlign: "left" }}>
            {" "}
            {text ? (
              text.name
            ) : (
              <span style={{ color: "red" }}>Không tìm thấy</span>
            )}
          </div>
        );
      },
    },
    {
      title: "NCC",
      key: "supplierName",
      dataIndex: "supplierName",
      render: (text) => {
        return (
          <div style={{ textAlign: "left" }}>
            {" "}
            {text ? (
              text.name
            ) : (
              <span style={{ color: "red" }}>Không tìm thấy</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Mô tả",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "10%",
      render: (record) => {
        return (
          <Space>
            <Upload
              beforeUpload={(file) => beforeUpload(file)}
              showUploadList={false}
              name="file"
              customRequest={(options) => {
                handleUploadImage(options, record);
              }}
            >
              <Button
                title="Cập nhật ảnh"
                icon={<UploadOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              ></Button>
            </Upload>
            <Button
              type="dashed"
              icon={<EditOutlined />}
              style={{ fontWeight: "600" }}
              onClick={() => {
                setVisible(true);
                setSelectedRow(record);
                handleClick_EditBtn(record);
                // NGHIA
                // formEdit.setFieldValue("categoryId", record.categoryId._id);
                // formEdit.setFieldValue("supplierId", record.supplierId._id);
              }}
            ></Button>
            <Popconfirm
              overlayInnerStyle={{ width: 300 }}
              title="Bạn muốn xóa không ?"
              okText="Đồng ý"
              cancelText="Đóng"
              onConfirm={() => handleConfirmDelete(record._id)}
            >
              <Button
                icon={<DeleteOutlined />}
                type="danger"
                style={{ fontWeight: 600 }}
                onClick={() => {}}
                title="Xóa"
              ></Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const optionspromotion = [];
  optionspromotion.push(
    {
      label: "Mẫu hot nhất năm 2022",
      value: "hot2022",
    },
    {
      label: "Outfit Mùa Hè",
      value: "muahe",
    },
    {
      label: "Outfit Mùa thu",
      value: "muathu",
    },
    {
      label: "Outfit Mùa xuân",
      value: "muaxuan",
    },
    {
      label: "Outfit Mùa đông",
      value: "muadong",
    },
    {
      label: "Couple",
      value: "couple",
    }
  );

  const handleUploadImage = (options, record) => {
    setLoading(true);
    const { file } = options;
    let formData = new FormData();
    let URL = URLProduct + "/productImage/" + record._id;
    //If containing an image <=> file !== null
    if (!record.coverImage) {
      console.log(record.coverImage);
      formData.append("currentImgUrl", null);
    } else {
      formData.append("currentImgUrl", record.coverImage);
    }
    formData.append("file", file);

    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    //POST
    axiosClient
      .post(URL, formData, config)
      .then((response) => {
        if (response.status === 200) {
          console.log("ok upload image");
          setRefresh((f) => f + 1);
          message.success(`Cập nhật hình ảnh thành công!`);
        }
      })
      .catch((error) => {
        message.error(`Cập nhật hình ảnh thất bại.`);
        setLoading(false);
      })
      .finally(() => {});
  };

  const handleClick_EditBtn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);

    let fieldsValues = {};
    for (let key in record) {
      fieldsValues[key] = record[key];
    }
    formEdit.setFieldsValue(fieldsValues);
  };
  const handleFinishUpdate = (values) => {
    // chưa hoàng thiện
    // const tmp = {
    //   productCode: selectedRecord.productCode, description: selectedRecord.description, name: selectedRecord.name, categoryId: selectedRecord.categoryId._id, supplierId: selectedRecord.supplierId._id, promotionPosition: selectedRecord.promotionPosition, sizes: selectedRecord.sizes
    // }
    // // console.log('show tmp:', tmp);
    // // console.log('show values:', values);

    // if (

    //   // values.productCode === selectedRecord.productCode &&
    //   // values.description === selectedRecord.description &&
    //   // values.name === selectedRecord.name &&
    //   // values.sizes === selectedRecord.sizes &&
    //   // values.categoryId === selectedRecord.categoryId &&
    //   // values.supplierId === selectedRecord.supplierId &&
    //   // values.promotionPosition === selectedRecord.promotionPosition
    //   JSON.stringify(values) === JSON.stringify(tmp)
    // ) {
    //   setIsModalOpen(false);
    //   formEdit.resetFields();
    //   setSelectedId(null);
    //   console.log("test")
    //   return;
    // }

    setLoadingBtn(true);
    axiosClient
      .patch(`${URLProduct}/${selectedId}`, values)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
          setLoading(true);
          setRefresh((e) => !e);
          formEdit.resetFields();
          setSelectedId(null);
          notification.info({
            message: "Thông báo",
            description: "Cập nhật thành công",
          });
        }
      })
      .catch((error) => {
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  const handleOk = () => {
    formEdit.submit();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleConfirmDelete = (_id) => {
    axiosClient
      .delete(URLProduct + "/deleteOne/" + _id)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          if (response.data?.noneExist) {
            console.log("test error");
            message.warning(response.data.noneExist);
          } else {
            message.info("Xóa thành công");
          }
        }
        setRefresh((f) => f + 1);
      })
      .catch((error) => {
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
        setLoading(false);
      })
      .finally(() => {});
  };

  const handleFinishCreate = (values) => {
    setLoadingBtn(true);
    axiosClient
      .post(`${URLProduct}/insertOne`, values)
      .then((response) => {
        if (response.status === 201) {
          setLoading(true);
          setIsCreate(false);
          setRefresh((f) => f + 1);
          form.resetFields();
          notification.info({
            message: "Thông báo",
            description: "thêm mới thành công",
          });
        }
      })
      .catch((error) => {
        message.error(
          error.response?.data?.error?.message
            ? error.response.data.error.message
            : error
        );
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  useEffect(() => {
    axiosClient.get(`${URLProduct}`).then((response) => {
      setProducts(response.data.results);
    });
  }, [refresh]);

  useEffect(() => {
    axiosClient.get("http://localhost:9000/v1/categories").then((response) => {
      setCategories(response.data.results);
    });
  }, []);
  useEffect(() => {
    axiosClient.get("http://localhost:9000/v1/suppliers").then((response) => {
      setSuppliers(response.data.results);
    });
  }, []);

  return (
    <div>
      <Layout>
        <Content>
          <Form
            {...PropsForm}
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 0 }}
            form={form}
            onFinish={handleFinishCreate}
          >
            <Form.Item
              {...PropsFormItem_Label_Name({
                label: "Mã sản phẩm",
                name: "productCode",
              })}
              rules={[
                {
                  required: true,
                  message: "Nhập mã sản phẩm",
                },
              ]}
            >
              <Input placeholder="Mã sản phẩm" />
            </Form.Item>

            <Form.Item
              {...PropsFormItem_Label_Name({
                label: "Tên sản phẩm",
                name: "name",
              })}
              rules={[
                {
                  required: true,
                  message: "Nhập tên sản phẩm",
                },
              ]}
            >
              <Input placeholder="Tên sản phẩm" />
            </Form.Item>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <Typography.Text strong>
                CHI TIẾT: Size-Màu sắc- Số lượng- Giá tiền- Giảm giá
              </Typography.Text>
            </div>
            <Form.List name={"attributes"}>
              {(field, { add, remove }) => (
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
                              width: 100,
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
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item name={"promotionPosition"} label="Nhóm siêu giảm">
              <Select
                mode="multiple"
                allowClear
                style={{
                  width: "100%",
                }}
                placeholder="Please select"
                onChange={handleChange}
                options={optionspromotion}
              />
            </Form.Item>
            <Form.Item
              {...PropsFormItem_Label_Name({
                name: "categoryId",
                label: "Loại hàng hóa",
              })}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn danh hàng hóa!",
                },
              ]}
            >
              <Select
                placeholder="Chọn tùy thuộc danh mục"
                loading={!categories}
              >
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
                name: "supplierId",
                label: "Nhà phân phối",
              })}
              name={"supplierId"}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nhà phân phối!",
                },
              ]}
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
            <Form.Item name={"description"} label="Mô tả sản phẩm">
              <TextArea rows={3} placeholder="Mô tả sản phẩm mới" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu thông tin
            </Button>
          </Form>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={products}
            pagination={false}
          />
          <Modal
            title="chinh sua thon tin danh muc"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
              <Button key="back" onClick={handleCancel}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={loadingBtn}
                onClick={handleOk}
              >
                Sửa
              </Button>,
            ]}
          >
            <Form
              style={{}}
              form={formEdit}
              initialValues={{
                productCode: "",
                name: "",
                price: "",
                discount: "",
                description: "",
                categoryId: "",
                supplierId: "",
                promotionPosition: "",
              }}
              onFinish={handleFinishUpdate}
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "nhập mã sản phẩm",
                  },
                ]}
                name={"productCode"}
                label="mã sản phẩm"
              >
                <Input placeholder="product code" />
              </Form.Item>

              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "nhập tên sản phẩm",
                  },
                ]}
                name={"name"}
                label="tên sản phẩm"
              >
                <Input placeholder="name product" />
              </Form.Item>
              <Form.List name={"sizes"}>
                {(field, { add, remove }) => (
                  <>
                    {field.map((field, index) => {
                      return (
                        <Space direction="horizontal" key={field.key}>
                          <Form.Item
                            name={[field.name, "stock"]}
                            label={`${index + 1}-Size`}
                            rules={[
                              { required: true, message: "size required." },
                            ]}
                          >
                            <InputNumber
                              placeholder="số lượng"
                              addonBefore={
                                <Form.Item
                                  name={[field.name, "size"]}
                                  noStyle
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
                              }
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
                                ` ${value}`.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ","
                                )
                              }
                              style={{ minWidth: 120, maxWidth: 360 }}
                              min={0}
                              addonAfter="VNĐ"
                              placeholder="giá bán"
                            />
                          </Form.Item>
                          <Form.Item name={[field.name, "discount"]}>
                            <InputNumber
                              defaultValue={0}
                              style={{ minWidth: 120, maxWidth: 150 }}
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
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item name={"promotionPosition"} label="promotionPosition">
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: "100%",
                  }}
                  placeholder="Please select"
                  onChange={handleChange}
                  options={optionspromotion}
                />
              </Form.Item>
              <Form.Item
                name={"categoryId"}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại hàng hóa!",
                  },
                ]}
                label="loại hàng hóa    "
              >
                <Select
                  placeholder="Chọn tùy thuộc danh mục"
                  loading={!categories}
                >
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
                name={"supplierId"}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn nhà phân phối!",
                  },
                ]}
                label="nhà phân phối"
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
              <Form.Item name={"description"} label="Mô tả sản phẩm">
                <TextArea rows={3} placeholder="Mô tả sản phẩm mới" />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </div>
  );
}

export default Products;
