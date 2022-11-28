"use strict";
require("dotenv").config();
var express = require("express");
var router = express.Router();
var jwt = require('jsonwebtoken');
const Login = require("../models/Login");
const Employee = require("../models/Employee");
var { validateSchema, loginSchema } = require("../validations/schemas.yup");
const { formatterErrorFunc } = require("../utils/formatterError");
const { validateId } = require("../validations/commonValidators");
const { COLLECTION_LOGINS } = require("../configs/constants");

router.post("/", validateSchema(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log({ ...req.body });
    const login = await Login.findOne({ email, password });
    if (!login) {
      res.status(401).json({ message: "UnAuthorized" });
      return;
    }
  // Get info of the employee who has just login 
    const employeeInfo = await Employee.findOne({email});
    if(!employeeInfo){
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
    res.status(500).json({message: err});
  }
});
//

//Get all orders
router.get("/all", async (req, res, next) => {
  try {
    const docs = await Login.find();
    res.json(docs);
  } catch (err) {
    res.status(400).json({ error: { name: err.name, message: err.message } });
  }
});
//

// Insert One
// router.post('/insert', validateSchema(addSchema), function (req, res, next){
router.post("/insertOne", async (req, res, next) => {
  try {
    let data = req.body;
    const doc = new Login(data);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    const errMsg = formatterErrorFunc(err, COLLECTION_LOGINS);
    res.status(400).json({ error: errMsg });
  }
});
//
router.patch("/updateOne/:id", validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
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

    res.json({
      ok: true,
      message: "Update the Id successfully",
      result: updatedDoc,
    });
  } catch (errMongoDB) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_LOGINS);
    res.status(400).json({ ok: true, error: errMsgMongoDB });
  }
});
//

//Delete ONE with ID
router.delete("/deleteOne/:id", validateId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteDoc = await Login.findByIdAndDelete(id);
    console.log("result delete: ", deleteDoc);
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
    res.json({
      ok: true,
      message: "Delete the document in MongoDB successfully",
    });
  } catch (errMongoDB) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_LOGINS);
    res.status(400).json({
      ok: false,
      message: "Failed to delete the document with ID",
      error: errMsgMongoDB,
    });
  }
});
//

//------------------------------------------------------------------------------------------------

module.exports = router;
