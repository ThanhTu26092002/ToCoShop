import React, { useEffect, useState } from "react";
import "../../css/CommonStyle.css";
import moment from "moment";
import "moment/locale/vi";
import axiosClient from "../../config/axios";
import { URLEmployee } from "../../config/constants";
import { Layout, Form, message, notification, Modal, Button } from "antd";
import { Content } from "antd/lib/layout/layout";
import { objCompare } from "../../config/helperFuncs";
import CustomTable from "./components/CustomTable";
import CustomFormEmployee from "./components/CustomFormEmployee";
import useAuth from "../../hooks/useZustand";
import { useNavigate } from "react-router-dom";

function Employees() {
  const navigate = useNavigate();
  const { auth, signOut } = useAuth((state) => state);

  const [file, setFile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loadingBtnUpdate, setLoadingBtnUpdate] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const handleUploadImage = (options, record) => {
    setLoading(true);
    const { file } = options;
    let formData = new FormData();
    let URL = URLEmployee + "/employeeImage/" + record._id;
    //If containing an image <=> file !== null
    if (!record.imageUrl) {
      formData.append("currentImgUrl", null);
    } else {
      formData.append("currentImgUrl", record.imageUrl);
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
          setRefresh((e) => !e);
          message.success(`C????p nh????t hi??nh a??nh tha??nh c??ng!`);
        }
      })
      .catch((error) => {
        message.error(`C????p nh????t hi??nh a??nh th????t ba??i.`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOk = () => {
    formUpdate.submit();
  };
  //
  const handleCancelCreate = () => {
    formCreate.resetFields();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    formUpdate.resetFields();
    setFile(null);
  };
  //
  const handleClick_EditBtn = (record) => {
    setIsModalOpen(true);
    setSelectedRecord(record);
    setSelectedId(record._id);
    const fieldsValues = { ...record };
    if (record.birthday) {
      fieldsValues.birthday = moment(record.birthday);
    } else {
      fieldsValues.birthday = undefined;
    }
    formUpdate.setFieldsValue(fieldsValues);
  };
  //
  const handleFinishCreate = (values) => {
    //SUBMIT
    setLoadingBtn(true);
    let formData = null;

    if (values.birthday) {
      values.birthday = values["birthday"].format("YYYY-MM-DD");
    } else {
      delete values.birthday;
    }
    let newData = { ...values };
    delete newData.file;

    let URL = URLEmployee + "/insert";
    //If containing an image <=> file !== null
    if (file) {
      URL = URLEmployee + "/insert";
      formData = new FormData();
      for (let key in values) {
        formData.append(key, values[key]);
      }
      formData.append("file", file);
      newData = formData;
    }

    //POST
    axiosClient
      .post(URL, newData)
      .then((response) => {
        if (response.status === 201) {
          setRefresh((e) => !e);
          if (file) {
            setFile(null);
          }
          formCreate.resetFields();
          notification.info({
            message: "Th??ng ba??o",
            description: "Th??m m????i tha??nh c??ng",
          });
        }
      })
      .catch((error) => {
        console.log(error);
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
  //
  const handleFinishUpdate = (values) => {
    //SUBMIT
    const oldData = {
      ...selectedRecord,
      birthday: moment(selectedRecord.birthday).format("YYYY-MM-DD"),
    };
    const newData = {
      ...values,
      birthday: moment(values.birthday).format("YYYY-MM-DD"),
    };
    delete newData.currentBirthday;
    const checkChangedData = objCompare(newData, oldData);
    //Th??ng tin fomUpdate kh??ng thay ??????i thi?? checkChangedData=null ko c????n la??m gi?? ca??
    if (!checkChangedData) {
      setIsModalOpen(false);
      formUpdate.resetFields();
      return;
    }
    setLoadingBtnUpdate(true);
    //N????u email ????????c thay ??????i thi?? ta pha??i truy????n th??m m????t oldEmail ch????a email hi????n ta??i ?????? truy????n qua api nh????m ti??m va?? thay th???? email m????i b??n collection Logins
    if (checkChangedData.email) {
      checkChangedData.oldEmail = selectedRecord.email;
    }
    //N????u thay ??????i nga??y sinh thi?? c????n chuy????n format nga??y sinh tr??????c khi g????i c????p nh????t
    if (checkChangedData.birthday) {
      checkChangedData.birthday = moment(checkChangedData.birthday);
    }
    //
    let URL = URLEmployee + "/updateOne/" + selectedId;
    //POST
    axiosClient
      .patch(URL, checkChangedData)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
          setRefresh((e) => !e);
          setSelectedId(null);
          if (file) {
            setFile(null);
          }
          if (checkChangedData.email) {
            //L????y email t???? hook useAuth ?????? xo??a auth n????u ng??????i c????p nh????t chi??nh ta??i khoa??n login cu??a ho??
            const loginEmail = auth.payload.email;
            if (loginEmail === selectedRecord.email) {
              notification.info({
                message: "Th??ng ba??o",
                description: "C????p nh????t tha??nh c??ng, vui lo??ng ????ng nh????p la??i",
              });
              setTimeout(() => {
                signOut();
                navigate("/login");
              }, 3000);
              return;
            }
          }
          notification.info({
            message: "Th??ng ba??o",
            description: "C????p nh????t tha??nh c??ng",
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
        setLoadingBtnUpdate(false);
      });
  };
  //
  const handleConfirmDelete = (_id) => {
    setLoading(true);
    axiosClient.delete(URLEmployee + "/deleteOne/" + _id).then((response) => {
      if (response.status === 200) {
        setRefresh((e) => !e);
        message.info("Xo??a tha??nh c??ng");
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    axiosClient.get(URLEmployee).then((response) => {
      const employees = response.data.results;
      let newEmployees = [];
      employees.map((e) => {
        // Formatting birthday before showing
        let formattedBirthday = null;
        if (e.birthday) {
          let array1 = e.birthday.split("T");
          let array2 = array1[0].split("-");
          let array3 = array2.reverse();
          formattedBirthday = array3.join("-");
        }
        newEmployees.push({
          ...e,
          formattedBirthday,
          fullName: `${e.firstName} ${e.lastName}`,
        });
      });
      setEmployees(newEmployees);
      setTotalDocs(newEmployees.length);
      setLoading(false);
    });
  }, [refresh]);
  //

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        <CustomFormEmployee
          form={formCreate}
          handleFinish={handleFinishCreate}
          handleCancel={handleCancelCreate}
          loadingBtn={loadingBtn}
        />
        <CustomTable
          handleUploadImage={handleUploadImage}
          handleClick_EditBtn={handleClick_EditBtn}
          handleConfirmDelete={handleConfirmDelete}
          employees={employees}
          totalDocs={totalDocs}
          loading={loading}
        />
        <Modal
          title="Chi??nh s????a th??ng tin danh mu??c"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          width={800}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Hu??y
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loadingBtnUpdate}
              onClick={handleOk}
            >
              S????a
            </Button>,
          ]}
        >
          <CustomFormEmployee
            form={formUpdate}
            handleFinish={handleFinishUpdate}
            loadingBtn={loadingBtnUpdate}
          />
        </Modal>
      </Content>
    </Layout>
  );
}

export default Employees;
