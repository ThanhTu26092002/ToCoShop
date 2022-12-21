"use strict";
var express = require("express");
var moment = require("moment");
const upload = require("../middleware/multerUpload");
const multer = require("multer");
const fs = require("fs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
var router = express.Router();

const Employee = require("../models/Employee");
const Login = require("../models/Login");

const { formatterErrorFunc } = require("../utils/formatterError");
const {
  COLLECTION_EMPLOYEES,
  COLLECTION_LOGINS,
  PATH_FOLDER_IMAGES,
  PATH_FOLDER_PUBLIC_UPLOAD,
} = require("../configs/constants");
const { validateId, loadEmployee } = require("../validations/commonValidators");
const { exceptionAllowRoles, allowRoles, checkLogin } = require("../middleware/checkRoles");
//Get all employees
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  async function (req, res, next) {
    try {
      const docs = await Employee.find().sort({ _id: -1 });
      res.json({ ok: true, results: docs });
    } catch (err) {
      const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_EMPLOYEES);
      res.status(400).json({ ok: false, error: errMsgMongoDB });
    }
  }
);

// Find One Document Following ID
router.get(
  "/findById/:id",
  validateId,
  passport.authenticate("jwt", { session: false }),
  exceptionAllowRoles("ADMINISTRATORS"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const doc = await Employee.findById(id);
      res.json({ ok: true, result: doc });
    } catch (err) {
      const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_EMPLOYEES);
      res.status(400).json({ ok: false, error: errMsgMongoDB });
    }
  }
);
router.post(
  "/employeeImage/:id",
  passport.authenticate("jwt", { session: false }),
  exceptionAllowRoles("ADMINISTRATORS"),
  function (req, res) {
    upload.single("file")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: "MulterError", err: err });
      } else if (err) {
        let errMsg = { type: "UnknownError", error: err };
        if (req.fileValidationError) {
          errMsg.type = "fileValidationError";
          errMsg.error = req.fileValidationError;
        } else if (req.directoryError) {
          errMsg.type = "directoryError";
          errMsg.error = req.directoryError;
        }
        res.status(500).json(errMsg);
      } else {
        try {
          // if doesn't exist file in form-data then res... and return
          if (!req.file) {
            res.status(400).json({
              ok: false,
              error: {
                name: "file",
                message: `doesn't have any files in form-data from client`,
              },
            });
            return;
          }

          const employeeId = req.params.id;
          const newImgUrl = req.file.filename
            ? `${PATH_FOLDER_IMAGES}/${COLLECTION_EMPLOYEES}/${employeeId}/${req.file.filename}`
            : null;
          const currentImgUrl = req.body.currentImgUrl
            ? req.body.currentImgUrl
            : null;
          const currentDirPath = PATH_FOLDER_PUBLIC_UPLOAD + currentImgUrl;
          const opts = { runValidators: true, new: true };
          const updatedDoc = await Employee.findByIdAndUpdate(
            employeeId,
            { imageUrl: newImgUrl },
            opts
          );
          //if currentImgUrl =null
          if (!currentImgUrl) {
            res.json({
              ok: true,
              more_detail: "Client have the new image",
              message: "Update imageUrl and other data successfully",
              result: updatedDoc,
            });
            return;
          }

          //else, then...
          try {
            if (fs.existsSync(currentDirPath)) {
              //If existing, removing the former uploaded image from DiskStorage
              try {
                //delete file image Synchronously
                fs.unlinkSync(currentDirPath);
                res.json({
                  ok: true,
                  message: "Update imageUrl and other data successfully",
                  result: updatedDoc,
                });
              } catch (errRmvFile) {
                res.json({
                  ok: true,
                  warning: "The old uploaded file cannot delete",
                  message: "Update imageUrl and other data successfully",
                  result: updatedDoc,
                });
              }
            } else {
              res.json({
                ok: true,
                warning: "Not existing the old uploaded image in DiskStorage",
                message: "Update imageUrl and other data successfully",
                result: updatedDoc,
              });
            }
          } catch (errCheckFile) {
            res.json({
              ok: true,
              warning:
                "Check the former uploaded image existing unsuccessfully, can not delete it",
              message: "Update imageUrl and other data successfully.",
              errCheckFile,
              result: updatedDoc,
            });
          }
        } catch (errMongoDB) {
          console.log("having error");
          res.status(400).json({
            status: false,
            message: "Failed in upload file",
          });
        }
      }
    });
  }
);

router.post(
  "/insertOne",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  async function (req, res, next) {
    try {
      const data = req.body;
      if (data.birthday) {
        //format date: YYYY-MM-Đ => type of Date: string
        data.birthday = moment(data.birthday)
          .utc()
          .local()
          .format("YYYY-MM-DD");
        //converting type of date from String to Date
        data.birthday = new Date(data.birthday);
      }

      const newDoc = new Employee(data);
      //Insert the newDocument in our Mongodb database
      await newDoc.save();
      res.status(201).json({ ok: true, result: newDoc });
    } catch (errMongoDB) {
      const errMsgMongoDB = formatterErrorFunc(
        errMongoDB,
        COLLECTION_EMPLOYEES
      );
      res.status(400).json({ ok: false, error: errMsgMongoDB });
    }
  }
);
router.patch(
  "/updateOne/:id",
  passport.authenticate("jwt", { session: false }),
  exceptionAllowRoles("ADMINISTRATORS"),
  validateId,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      //oldEmail chính là email cũ, lưu lại để truy vấn tìm bên Logins và cập nhật email mới
      if (updateData.oldEmail) {
        delete updateData.oldEmail;
      }
      const opts = { runValidators: true, new: true };
      //--Update in Mongodb
      const updatedDoc = await Employee.findByIdAndUpdate(id, updateData, opts);
      if (!updatedDoc) {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_EMPLOYEES}`,
          },
        });
        return;
      }
      //Check having email in updateData, and update into collection Logins
      if (req.body.oldEmail) {
        const oldEmail = req.body.oldEmail;
        const newEmail = updateData.email;
        //Find the login have the email
        try {
          const findDoc = await Login.findOne({ email: oldEmail });
          if (!findDoc) {
            res.json({
              ok: true,
              message: "Update the Id successfully",
              result: updatedDoc,
              other:
                "Don't have the document having the email in the collection Logins",
            });
            return;
          }
          //Update new email for the login
          try {
            const loginId = findDoc._id;
            const updatedDocLogin = await Login.findByIdAndUpdate(
              loginId,
              { email: newEmail },
              opts
            );
            res.json({
              ok: true,
              message:
                "Update the Id successfully in collection Employees and Logins",
              result: updatedDoc,
              result2: updatedDocLogin,
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
                "having error when update email for the login having the same email",
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
        return;
      }
    } catch (errMongoDB) {
      const errMsgMongoDB = formatterErrorFunc(
        errMongoDB,
        COLLECTION_EMPLOYEES
      );
      res.status(400).json({ ok: true, error: errMsgMongoDB });
    }
  }
);

router.delete(
  "/deleteOne/:id",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  validateId,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const deleteDoc = await Employee.findByIdAndDelete(id);
      //deleteDoc !== false, is mean, finding a document with the id in the collection
      if (!deleteDoc) {
        res.status(200).json({
          ok: true,
          noneExist: `the document doesn't exist in the collection ${COLLECTION_EMPLOYEES}`,
        });
        return;
      }
      //
      //Find following email in collection Logins and delete it
      try {
        const deleteLogin = await Login.findOneAndDelete({ email });
        if (deleteLogin) {
          console.log({
            ok: true,
            message:
              "Delete the relative email in collection Logins completely",
          });
        } else {
          console.log({
            ok: true,
            message:
              "Not existing the relative email in collection Logins completely",
          });
        }
      } catch (err) {
        const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_LOGINS);
        console.log({
          ok: true,
          errorFindOneAndDelete: errMsgMongoDB,
          warning:
            "Delete a login successfully, but having error when finding and deleting of the relative email in the collection Logins",
        });
      }
      //
      //--Delete the folder containing image of the account
      try {
        const pathFolderImages =
          PATH_FOLDER_PUBLIC_UPLOAD +
          PATH_FOLDER_IMAGES +
          "/" +
          COLLECTION_EMPLOYEES +
          "/" +
          id;
        if (fs.existsSync(pathFolderImages)) {
          //--If existing, removing this folder from DiskStorage
          try {
            fs.rmSync(pathFolderImages, { recursive: true, force: true });
            res.json({
              ok: true,
              message:
                "Delete the document in MongoDB and DiskStorage successfully",
            });
          } catch (err) {
            res.json({
              ok: true,
              warning:
                "Could not delete the folder containing image of the document.",
              message: "Delete the document with ID successfully, in MongoDB",
              err,
            });
          }
        } else {
          res.json({
            ok: true,
            warning:
              "Not existing the folder containing image for deleted document in DiskStorage",
            message: "Delete the document with ID successfully, in MongoDB",
          });
        }
      } catch (errCheckFile) {
        res.json({
          ok: false,
          warning:
            "Check the existence of the folder containing image of the document unsuccessfully, can not delete it",
          message: "Delete the document with ID successfully, in MongoDB",
          errCheckFile,
        });
      }
    } catch (errMongoDB) {
      const errMsgMongoDB = formatterErrorFunc(
        errMongoDB,
        COLLECTION_EMPLOYEES
      );
      res.status(400).json({
        ok: false,
        message: "Failed to delete the document with ID",
        error: errMsgMongoDB,
      });
    }
  }
);
// //Get all employees with total Price they have sold
// router.get('/revenue', function(req, res, next) {

//  const aggregate = [
//     {
//       $lookup: {
//         from: "orders",
//         let: {employeeId : "$_id"},
//         pipeline: [
//           {$unwind: "$orderDetails"},
//           {
//             $match:{
//               $expr: {
//                 "$and" : [
//                   {$eq: ['$employeeId', '$$employeeId'] },
//                   {$ne: ['$status', 'CANCELED'] }
//                 ]
//               }
//             }
//           },
// //Solution 01
//           // { $group: {
//           //   _id: "$employeeId", //to show totalPrice or all Orders that this employee sold
//           //  ordersId: {$push: "$_id"},
//           //   totalPrice: {$sum: { $multiply: [
//           //     "$orderDetails.price", "$orderDetails.quantity",
//           //     {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
//           //   ]}},
//           // }
//           // },
// //
// //Solution 02
//           { $group: {
//             _id: "$_id", //to show totalPrice or all Orders that this employee sold
//            productsId: {$push: "$orderDetails.productId"},
//             totalPriceEachOrder: {$sum: { $multiply: [
//               "$orderDetails.price", "$orderDetails.quantity",
//               {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
//             ]}},
//           }
//           },
//         ],
//         as: "orders",
//       }
//     },
//     {
//       $addFields: {
//         totalPriceAll: {$sum: "$orders.totalPriceEachOrder"}
//       }
//     }
// //
//   ]
//   findDocuments({aggregate: aggregate}, COLLECTION_NAME)
//     .then(result => res.status(200).json(result))
//     .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
// })
// //

// //TASK 27
// //Get top 3 employees with total Price they have sold from date1 to date2
// router.get('/revenueTop3', function(req, res, next) {
//   const {dateFrom, dateTo} = req.query
//   //convert date from string to date with the LocalZone of VietNam with format YYYY-MM-DD HH:MM:SS
//   // let start = moment(dateFrom).utc().local().format('YYYY-MM-DD HH:mm:ss')
//   // let end = moment(dateTo).utc().local().format('YYYY-MM-DD HH:mm:ss')

//   let start = new Date(moment(dateFrom).utc().local().format('YYYY-MM-DD'))
//   let end = new Date(moment(dateTo).utc().local().format('YYYY-MM-DD'))

//   const aggregate = [
//     {
//       $lookup: {
//         from: "orders",
//         let: {employeeId : "$_id"},
//         pipeline: [
//           {$unwind: "$orderDetails"},
//           {
//             $match:{
//               $expr: {
//                 "$and" : [
//                   {$eq: ['$employeeId', '$$employeeId'] },
//                   {$ne: ['$status', 'CANCELED'] },
//                   {$gte: ['$createdDate', start]},
//                   {$lte: ['$createdDate', end]}
//                 ]
//               }
//             }
//           },

//           { $group: {
//             _id: "$_id",
//             createdDate: {$first: "$createdDate"},
//            productsId: {$push: "$orderDetails.productId"},
//             totalPriceEachOrder: {$sum: { $multiply: [
//               "$orderDetails.price", "$orderDetails.quantity",
//               {$divide : [{$subtract: [100, "$orderDetails.discount"]}, 100]}
//             ]}},
//           }
//           },
//         ],
//         as: "orders",
//       }
//     },
//     {
//       $match: {
//         orders: {$ne: []}
//       }
//     },
//     {
//       $addFields: {
//         totalPriceAll: {$sum: "$orders.totalPriceEachOrder"}
//       }
//     },
//     {
//       $sort: { "totalPriceAll": -1}
//     },
//     {
//       $limit: 3
//     }
// //
//   ]
//   findDocuments({aggregate: aggregate}, COLLECTION_NAME)
//     .then(result => res.status(200).json(result))
//     .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
// })
// //

// //Get employees 14
// router.get('/search', function(req, res, next) {
//   const {key,value} = req.query
//  const query={}
//   switch(key){
//     case 'address':
//       query = {address : new RegExp(`${value}`, "i")};
//       break;
//     case 'birthday':
//       query = {$and: [
//         {'birthday': {$exists: true}},
//         { "$expr": {
//           "$eq": [ { "$year": "$birthday" }, { "$year": new Date() } ]
//         }}
//       ]}

//       break;
//     case 'birthday-today':
//      query = {
//       "birthday": {"$exists": true} ,
//       "$expr": {
//             "$and": [
//                  { "$eq": [ { "$dayOfMonth": "$birthday" }, { "$dayOfMonth": new Date() } ] },
//                  { "$eq": [ { "$month"     : "$birthday" }, { "$month"     : new Date() } ] }
//             ]
//          }
//      }

//       break;
//     default:
//       res.status(404).json({message: 'Something wrong, please check your formatting request'})
//       return;
//   }
//   findDocuments({query: query}, COLLECTION_NAME)
//       .then(result => res.status(200).json(result))
//       .catch(err => res.status(500).json({findFunction: "failed :v", err: err}))
//   })
//   //

// //------------------------------------------------------------------------------------------------

module.exports = router;
