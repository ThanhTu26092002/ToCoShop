import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Space,
  Select,
  Layout,
  Modal,
  Table,
  notification,
  message,
  Popconfirm,
  Radio,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Content } from "antd/lib/layout/layout";
import {
  PropsForm,
  PropsFormItemEmail,
  PropsFormItem_Label_Name,
  PropsTable,
} from "../config/props";
import { URLQLLogin } from "../config/constants";
import axiosClient from "../config/axios";
import useAuth from "../hooks/useZustand";
import { useNavigate } from "react-router-dom";
import { objCompare } from "../config/helperFuncs";
import { ColorStatus } from "../components/subComponents";
function AdminManagers() {
  const navigate = useNavigate();
  const { auth, signOut } = useAuth((state) => state);

  const [totalDocs, setTotalDocs] = useState(0);
  const [login, setLogin] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const optionspromotion = [];
  optionspromotion.push(
    {
      label: "ADMINISTRATORS",
      value: "ADMINISTRATORS",
    },
    {
      label: " MANAGERS",
      value: "MANAGERS",
    }
  );
  const columns = [
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      render: (Text) => {
        return <span style={{ fontWeight: "600" }}>{Text}</span>;
      },
    },
    {
      title: "Quyền",
      key: "formattedRoles",
      dataIndex: "formattedRoles",
      render: (Text) => {
        return <span>{Text}</span>;
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        return <ColorStatus status={status} />;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "10%",
      render: (record) => {
        return (
          <Space>
            <Button
              title="Chỉnh sửa"
              type="primary"
              icon={<EditOutlined />}
              style={{ fontWeight: "600" }}
              onClick={() => {
                handleClick_EditBtn(record);
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
  const handleOk = () => {
    formEdit.submit();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    formEdit.resetFields();
  };
  const handleClick_EditBtn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
    setSelectedId(record._id);

    let fieldsValues = {};
    for (let key in record) {
      fieldsValues[key] = record[key];
    }
    fieldsValues.confirm = record.password;
    formEdit.setFieldsValue(fieldsValues);
  };
  const handleFinishUpdate = (values) => {
    //Kiểm tra trùng dữ liệu cũ thì ko làm gì cả
    const tmp = {
      email: values.email,
      password: values.password,
      roles: values.roles,
      status: values.status,
    };
    const checkChangedData = objCompare(tmp, selectedRecord);

    //Thông tin fomUpdate không thay đổi thì checkChangedData=null ko cần làm gì cả
    if (!checkChangedData) {
      setIsModalOpen(false);
      form.resetFields();
      setSelectedId(null);
      return;
    }
    setLoadingBtn(true);
    setLoading(true);
    //Nếu email được thay đổi thì ta phải truyền thêm một oldEmail chứa email hiện tại để truyền qua api nhằm tìm và thay thế email mới bên collection Logins
    if (checkChangedData.email) {
      checkChangedData.oldEmail = selectedRecord.email;
    }
    //Thêm trường uid chứa id người đăng nhập nhằm xác định quyền chỉnh sửa tài khoản đăng nhập chính mình
    checkChangedData.uid = auth.payload.uid;
    setLoadingBtn(true);
    axiosClient
      .patch(`${URLQLLogin}/updateOne/${selectedId}`, checkChangedData)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
          setLoading(false);
          setLoadingBtn(false);
          setRefresh((e) => !e);
          formEdit.resetFields();
          setSelectedId(null);

          //Lấy uid từ hook useAuth để xóa auth nếu người cập nhật chính tài khoản login của họ
          if (checkChangedData.email) {
            notification.info({
              message: "Thông báo",
              description: "Cập nhật thành công, vui lòng đăng nhập lại",
            });
            const uidCheck = auth.payload.uid;
            if (uidCheck === selectedId) {
              setTimeout(() => {
                signOut();
                navigate("/login");
              }, 3000);
              return;
            }
          }
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
        setLoading(false);
        setLoadingBtn(false);
      });
  };

  const handleCancelCreate = () => {
    form.resetFields();
  };
  const handleConfirmDelete = (_id) => {
    setLoadingBtn(true);
    axiosClient
      .delete(`${URLQLLogin}/deleteOne/` + _id)
      .then((response) => {
        if (response.status === 200) {
          setRefresh((f) => f + 1);
          message.info("Xóa thành công");
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

  const handleFinishCreate = (values) => {
    setLoadingBtn(true);
    if (values.confirm) {
      delete values.confirm;
    }
    axiosClient
      .post(`${URLQLLogin}/insertOne`, values)
      .then((response) => {
        if (response.status === 201) {
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
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  useEffect(() => {
    axiosClient.get(`${URLQLLogin}/all`).then((response) => {
      let tmp = response.data.results;
      tmp.map((e) => {
        let formattedRoles = "";
        if (e.roles) {
          e.roles.map((role) => {
            formattedRoles += role + " , ";
          });
          e.formattedRoles = formattedRoles;
        }
      });
      setTotalDocs(tmp.length);
      setLogin(tmp);
    });
  }, [refresh]);

  return (
    <div>
      <Layout>
        <Content>
          <Form
            {...PropsForm}
            form={form}
            initialValues={{ status: "ACTIVE", roles: "MANAGERS" }}
            onFinish={handleFinishCreate}
          >
            <Form.Item {...PropsFormItemEmail({ require: true })} hasFeedback>
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item
              {...PropsFormItem_Label_Name({
                label: "Mật khẩu",
                name: "password",
              })}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
                {
                  pattern:
                    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
                  message:
                    "Mật khẩu có ít nhất 8 kí tự bao gồm ít nhất một chữ thường, một chữ in hoa và một chữ số",
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              {...PropsFormItem_Label_Name({
                label: "Xác nhận mật khẩu",
                name: "confirm",
              })}
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Không khớp hai mật khẩu!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              hasFeedback
              {...PropsFormItem_Label_Name({
                label: "Quyền thao tác",
                name: "roles",
              })}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn quyền",
                },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                style={{
                  width: "100%",
                }}
                placeholder="Please select"
                options={optionspromotion}
              />
            </Form.Item>
            <Form.Item
              {...PropsFormItem_Label_Name({
                label: "Trạng thái",
                name: "status",
              })}
            >
              <Radio.Group>
                <Radio value={"ACTIVE"}>Kích hoạt</Radio>
                <Radio value={"INACTIVE"}>Khóa</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Space wrap>
                <Button type="primary" danger onClick={handleCancelCreate}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loadingBtn}>
                  Tạo mới
                </Button>
              </Space>
            </Form.Item>
          </Form>
          <Table
            rowKey="_id"
            {...PropsTable({ isLoading: loading })}
            columns={columns}
            dataSource={login}
            pagination={{
              total: totalDocs,
              showTotal: (totalDocs, range) =>
                `${range[0]}-${range[1]} of ${totalDocs} items`,
              defaultPageSize: 10,
              defaultCurrent: 1,
            }}
          />
          <Modal
            title="Chỉnh sửa thông tin Slieds"
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
            <Form {...PropsForm} form={formEdit} onFinish={handleFinishUpdate}>
              <Form.Item {...PropsFormItemEmail({ require: true })} hasFeedback>
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                {...PropsFormItem_Label_Name({
                  label: "Mật khẩu",
                  name: "password",
                })}
                rules={[
                  {
                    required: true,
                    message: "Vui òng nhập mật khẩu!",
                  },
                  {
                    pattern:
                      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
                    message:
                      "Mật khẩu có ít nhất 8 kí tự bao gồm ít nhất một chữ cái in hoa và một chữ số",
                  },
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                {...PropsFormItem_Label_Name({
                  label: "Xác nhận mật khẩu",
                  name: "confirm",
                })}
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Vui lòng xác nhận mật khẩu!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Không khớp hai mật khẩu!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                hasFeedback
                {...PropsFormItem_Label_Name({
                  label: "Quyền thao tác",
                  name: "roles",
                })}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn quyền",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: "100%",
                  }}
                  placeholder="Please select"
                  options={optionspromotion}
                />
              </Form.Item>
              <Form.Item
                {...PropsFormItem_Label_Name({
                  label: "Trạng thái",
                  name: "status",
                })}
              >
                <Radio.Group>
                  <Radio value={"ACTIVE"}>Kích hoạt</Radio>
                  <Radio value={"INACTIVE"}>Khóa</Radio>
                </Radio.Group>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </div>
  );
}
export default AdminManagers;
