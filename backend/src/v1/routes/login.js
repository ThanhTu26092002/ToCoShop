"use strict";
require("dotenv").config();
var express = require("express");
var router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const Login = require("../models/Login");
const Employee = require("../models/Employee");
var { validateSchema, loginSchema } = require("../validations/schemas.yup");
const { formatterErrorFunc } = require("../utils/formatterError");
const { validateId } = require("../validations/commonValidators");
const {
  COLLECTION_LOGINS,
  COLLECTION_EMPLOYEES,
} = require("../configs/constants");
const { exceptionAllowRoles, allowRoles, checkLogin } = require("../middleware/checkRoles");

//Login with email and password
//1. Đăng nhập hệ thống- email vs password , condition: ACTIVE
router.post("/", validateSchema(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const login = await Login.findOne({ email, password });
    if (!login || login.status === "INACTIVE") {
      res.status(401).json({ message: "UnAuthorized" });
      return;
    }
    // Get info of the employee who has just login
    const employeeInfo = await Employee.findOne({ email });
    if (!employeeInfo) {
      res.status(400).json({ message: "Not found!" });
      return;
    }
    const payload = {
      uid: login._id,
      email: login.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SETTING_SECRET, {
      expiresIn: 86400, //expires in 24 hours
      issuer: process.env.JWT_SETTING_ISSUER,
      audience: process.env.JWT_SETTING_AUDIENCE,
      algorithm: "HS512",
    });

    res.json({
      ok: true,
      login: true,
      payload,
      employeeInfo,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});
//

//2. Lấy danh sách tài khoản đăng nhập
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  async (req, res, next) => {
    try {
      const docs = await Login.find();
      res.json({ ok: true, results: docs });
    } catch (err) {
      const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_LOGINS);
      res.status(400).json({ ok: false, error: errMsgMongoDB });
    }
  }
);
//
// 3.1 Find One Document Following ID
router.get(
  "/findById/:id",
  validateId,
  passport.authenticate("jwt", { session: false }),
  checkLogin("ADMINISTRATORS"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const doc = await Login.findById(id);
      res.json({ ok: true, result: doc });
    } catch (err) {
      const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_LOGINS);
      res.status(400).json({ ok: false, error: errMsgMongoDB });
    }
  }
);

//3.2 Find folowing email
router.get(
  "/findByEmail/:email",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  async (req, res, next) => {
    try {
      const { email } = req.params;
      const doc = await Login.findOne({ email });
      res.json({ ok: true, result: doc });
    } catch (err) {
      const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_LOGINS);
      res.status(400).json({ ok: false, error: errMsgMongoDB });
    }
  }
);
// 4. Insert One
router.post(
  "/insertOne",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  async (req, res, next) => {
    try {
      let data = req.body;
      const { email } = req.body;
      const newLogin = new Login(data);
      await newLogin.save();
      // If existing the email in collection Employees ,then do not thing
      try {
        const employeeDoc = await Employee.findOne({ email });
        if (employeeDoc) {
          res.status(201).json({
            ok: true,
            result: newLogin,
            other:
              "Existing an employee having the email, then, do not need to create a new Employee",
          });
          return;
        }
        // Create a new employee with the email
        try {
          const newEmployee = new Employee({ email });
          //Insert the newDocument in our Mongodb database
          await newEmployee.save();
          res
            .status(201)
            .json({ ok: true, result: newLogin, result2: newEmployee });
        } catch (errMongoDB) {
          const errMsgMongoDB = formatterErrorFunc(
            errMongoDB,
            COLLECTION_EMPLOYEES
          );
          res.status(201).json({
            ok: true,
            result: newLogin,
            errorNewEmployee: errMsgMongoDB,
            warning:
              "Add new login successfully, but having error when add new employee with the relative email",
          });
        }
      } catch (err) {
        const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_EMPLOYEES);
        res.status(201).json({
          ok: true,
          result: newLogin,
          errorFindOne: errMsgMongoDB,
          warning:
            "Create a new login successfully, but having error when check existing of the new email in the collection Employees",
        });
        return;
      }
    } catch (err) {
      const errMsg = formatterErrorFunc(err, COLLECTION_LOGINS);
      res.status(400).json({ error: errMsg });
    }
  }
);
//5. Chỉnh sửa thông tin, chú ý hoặc administrator hoặc là chính chủ cập nhật- uid===id
router.patch(
  "/updateOne/:id",
  passport.authenticate("jwt", { session: false }),
  validateId,
  async (req, res) => {
    try {
      const { id } = req.params;
      // console.log("id",typeof(id))
      const updateData = { ...req.body };
      const { uid } = updateData;
      //Tìm và lấy tài khoản đăng nhập dựa vào id
      //Nếu employee cập nhật cho chính mình thì ok, nếu không cần kiểm tra quyền administrators
      if (uid !== id) {
        const docFound = await Login.findById(uid);
        if (docFound?.roles?.includes("ADMINISTRATORS")) {
        } else {
          res.status(403).json({ message: "Forbidden" });
          return;
        }
      }
      //Xóa uid khỏi updateDate trước khi cập nhật
      delete updateData.uid;

      //oldEmail chính là email cũ, lưu lại để truy vấn tìm bên Employees và cập nhật email mới
      if (updateData.oldEmail) {
        delete updateData.oldEmail;
      }
      const opts = { runValidators: true };
      //--Update in Mongodb
      const updatedDoc = await Login.findByIdAndUpdate(id, updateData, opts);
      if (!updatedDoc) {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_LOGINS}`,
          },
        });
        return;
      }

      //Check having email in updateData, and update into collection Employees
      if (req.body.oldEmail) {
        const oldEmail = req.body.oldEmail;
        const newEmail = updateData.email;
        //Find the employee have the email
        try {
          const findDoc = await Employee.findOne({ email: oldEmail });
          if (!findDoc) {
            res.json({
              ok: true,
              message: "Update the Id successfully",
              result: updatedDoc,
              other:
                "Don't have the document having the email in the collection Employees",
            });
            console.log({
              ok: true,
              message: "Update the Id successfully",
              result: updatedDoc,
              other:
                "Don't have the document having the email in the collection Employees",
            });
            return;
          }
          //Update new email for the login
          try {
            const employeeId = findDoc._id;
            const updatedDocEmployee = await Employee.findByIdAndUpdate(
              employeeId,
              { email: newEmail },
              opts
            );
            res.json({
              ok: true,
              message:
                "Update the Id successfully in collection Employees and Logins",
              result: updatedDoc,
              result2: updatedDocEmployee,
            });
            return;
          } catch (err) {
            const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_LOGINS);
            res.json({
              ok: true,
              message: "Update the Id successfully in collection Employees",
              result: updatedDoc,
              errFindByIdAndUpdate: errMsgMongoDB,
              warning:
                "having error when update email for the Employee having the same email",
            });
            return;
          }
        } catch (err) {
          const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_LOGINS);
          res.json({
            ok: true,
            message: "Update the Id successfully",
            result: updatedDoc,
            errorFindOne: errMsgMongoDB,
            other:
              "Update the Id successfully, but, having error when check existing of the relative email of the employee in collection Logins",
          });
          return;
        }
      } else {
        res.json({
          ok: true,
          message: `Update the Id successfully in collection ${COLLECTION_EMPLOYEES}`,
          result: updatedDoc,
        });
      }
    } catch (errMongoDB) {
      const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_LOGINS);
      res.status(400).json({ ok: true, error: errMsgMongoDB });
    }
  }
);
//

//6.Delete ONE with ID
router.delete(
  "/deleteOne/:id",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  validateId,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const deleteDoc = await Login.findByIdAndDelete(id);
      //deleteDoc !== false, is mean, finding a document with the id in the collection
      if (!deleteDoc) {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_LOGINS}`,
          },
        });
        return;
      }
      //Find and delete the relative email in collection Employees
      try {
        const deleteEmployee = await Employee.findOneAndDelete({ email });
        if (deleteEmployee) {
          res.json({
            ok: true,
            message: "Delete the document in collection Logins successfully",
            other:
              "Delete the relative email in collection Employees completely",
          });
          return;
        } else {
          res.json({
            ok: true,
            message: "Delete the document in collection Logins successfully",
            other:
              "Not existing the relative email in collection Employees completely",
          });
          return;
        }
      } catch (err) {
        const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_LOGINS);
        res.json({
          ok: true,
          message: "Delete the document in collection Logins successfully",
          error: errMsgMongoDB,
          warning:
            "Delete the id in collection Logins successfully, but having error when delete the relative email in collection Employees",
        });
        return;
      }
    } catch (errMongoDB) {
      const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_LOGINS);
      res.status(400).json({
        ok: false,
        message: "Failed to delete the document with ID in collection Logins",
        error: errMsgMongoDB,
      });
    }
  }
);
//

//------------------------------------------------------------------------------------------------

module.exports = router;
