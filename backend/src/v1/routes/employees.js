"use strict";
const { json } = require("express");
var express = require("express");
var moment = require("moment");
const { join } = require("lodash");
const upload = require("../middleware/multerUpload");
const multer = require("multer");
const fs = require("fs");

const { ObjectId } = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var router = express.Router();

const COLLECTION_NAME = "employees";

const {
  insertDocument,
  insertDocuments,
  updateDocument,
  updateDocuments,
  findDocuments,
  deleteOneWithId,
  deleteMany,
} = require("../utils/MongodbHelper");
// const {
//   validateSchema,
//   search_deleteWithId,
//   search_deleteManyEmployeesSchema,
//   insertOneEmployeeSchema,
//   insertManyEmployeesSchema,
//   updateOneEmployeeSchema,
//   updateManyEmployeesSchema,
// } = require("../models/schemas/schemasEmployeesOnlineShop.yup");
const Employee = require("../models/Employee");
const Login = require("../models/Login");

const { formatterErrorFunc } = require("../utils/formatterError");
const {
  COLLECTION_EMPLOYEES,
  PATH_FOLDER_IMAGES,
  PATH_FOLDER_PUBLIC_UPLOAD,
} = require("../configs/constants");
const { validate } = require("../models/Employee");
const { validateId, loadEmployee } = require("../validations/commonValidators");

//Get all employees
router.get("/", async function (req, res, next) {
  try {
    const docs = await Employee.find().sort({ _id: -1 });
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_EMPLOYEES);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});

// Find One Document Following ID
// http://localhost:9000/categoriesOnlineShop/search/ how to response a message error
router.get("/findById/:id", validateId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Employee.findById(id);
    res.json({ ok: true, result: doc });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_EMPLOYEES);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});

router.post("/employeeImage/:id", loadEmployee, function (req, res) {
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
        console.log("img", currentImgUrl);
        const currentDirPath = PATH_FOLDER_PUBLIC_UPLOAD + currentImgUrl;
        console.log("test speed update:", currentDirPath);
        const opts = { runValidators: true };
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
});

router.post("/insertOne", async function (req, res, next) {
  try {
    const data = req.body;
    if (data.birthday) {
      //format date: YYYY-MM-Đ => type of Date: string
      data.birthday = moment(data.birthday).utc().local().format("YYYY-MM-DD");
      //converting type of date from String to Date
      data.birthday = new Date(data.birthday);
    }

    const newDoc = new Employee(data);
    //Insert the newDocument in our Mongodb database
    await newDoc.save();
    res.status(201).json({ ok: true, result: newDoc });
  } catch (errMongoDB) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_EMPLOYEES);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
router.patch("/updateOne/:id", validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const opts = { runValidators: true };
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

    res.json({
      ok: true,
      message: "Update the Id successfully",
      result: updatedDoc,
    });
  } catch (errMongoDB) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_EMPLOYEES);
    res.status(400).json({ ok: true, error: errMsgMongoDB });
  }
});

router.delete("/deleteOne/:id", validateId, async (req, res, next) => {
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
    //Delete the Id with email in Collection Logins
    Login.findOneAndDelete({ email: email }, function (err, doc) {
      if (err) {
        const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_CATEGORIES);
        res.status(400).json({ ok: true, error: errMsgMongoDB });
        return;
      } else {
        if (doc) {
          console.log("Delete the Id in collection Logins completely");
        } else {
          console.log("Not existing the Id in collection Logins completely");
        }
      }
    });
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
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_EMPLOYEES);
    res.status(400).json({
      ok: false,
      message: "Failed to delete the document with ID",
      error: errMsgMongoDB,
    });
  }
});
//  //Insert Many  -- haven't validation yet
//  router.post('/insert-many', validateSchema(insertManyEmployeesSchema), function (req, res, next){
//   const listBirthdays = req.body;
//  //convert type of birthday from STRING to DATE with formatting 'YYYY-MM-DD
//  listBirthdays.map(customer => {
//   if(customer.birthday) {
//     customer.birthday = new Date(moment(customer.birthday).utc().local().format('YYYY-MM-DD'))
//   }
// })
//   insertDocuments(listBirthdays, COLLECTION_NAME)
//   .then(result => {
//     res.status(200).json({ok: true, result: result})
//   })
//   .catch(err =>{
//     res.json(500).json({ok:false})
//   })
//  })
// //
// //dsfhsdfsdsdfsdiufhsdif
//  //Update One with _Id
//  router.patch('/update-one/:id',validateSchema(updateOneEmployeeSchema), function(req, res, next){
//   const {id} = req.params;
//   const paramId = {_id : ObjectId(id)}
//   const data = req.body

//   if(data.birthday)
//    {
//      //format date: YYYY-MM-Đ => type of Date: string
//     data.birthday= moment(data.birthday).utc().local().format('YYYY-MM-DD')
//     //converting type of date from String to Date
//     data.birthday= new Date(data.birthday)
//   }

//   updateDocument(paramId, data, COLLECTION_NAME)
//     .then(result => {
//       res.status(201).json({update: true, result: result})
//     })
//     .catch(err => res.json({update: false}))
//  })
// //

//  //Update MANY
//  router.patch('/update-many',validateSchema(updateManyEmployeesSchema), function(req, res, next){
//   const query = req.query;
//   const newValues = req.body;

//   if(newValues.birthday)
//    {
//      //format date: YYYY-MM-Đ => type of Date: string
//     newValues.birthday= moment(newValues.birthday).utc().local().format('YYYY-MM-DD')
//     //converting type of date from String to Date
//     newValues.birthday= new Date(newValues.birthday)
//   }

//   updateDocuments(query, newValues, COLLECTION_NAME)
//     .then(result => {
//       res.status(201).json({update: true, result: result})
//     })
//     .catch(err => res.json({update: false}))
//  })
// //

// //Delete ONE with ID
// router.delete('/delete-id/:_id',validateSchema(search_deleteWithId), function(req, res, next) {
//   const {_id}= req.params;

//   deleteOneWithId({_id: ObjectId(_id)}, COLLECTION_NAME)
//     .then(result => res.status(200).json(result))
//     .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
// })
// //

// //Delete MANY
// router.delete('/delete-many',validateSchema(search_deleteManyEmployeesSchema), function(req, res, next) {
//   const query= req.query;

//   deleteMany(query, COLLECTION_NAME)
//     .then(result => res.status(200).json(result))
//     .catch(err => res.status(500).json({deleteFunction: "failed", err: err}))
// })

// //TASK 24
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
