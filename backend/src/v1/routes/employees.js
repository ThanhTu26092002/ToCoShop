"use strict";
const { json } = require('express');
var express = require('express');
var moment = require('moment')
const { join } = require('lodash');
const { ObjectId } = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

const COLLECTION_NAME= "employees"

const {
  insertDocument,
  insertDocuments, 
  updateDocument,
  updateDocuments,
  findDocuments,
  deleteOneWithId,
  deleteMany,
  
  } = require("../utils/MongodbHelper");
const { 
  validateSchema,
  search_deleteWithId,
  search_deleteManyEmployeesSchema,
  insertOneEmployeeSchema,
  insertManyEmployeesSchema,
  updateOneEmployeeSchema,
  updateManyEmployeesSchema,

} 

= require('../models/schemas/schemasEmployeesOnlineShop.yup');
const { date } = require('yup');
const Employee = require('../models/Employee');
const { formatterErrorFunc } = require("../utils/formatterError");
const { COLLECTION_EMPLOYEES } = require('../configs/constants');
const { validate } = require('../models/Employee');
const { validateId } = require('../validations/commonValidators');


//Get all categories
router.get('/', function(req, res, next) {
  findDocuments({query: {}}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//
// Find One Document Following ID   
// http://localhost:9000/categoriesOnlineShop/search/ how to response a message error
router.get('/search/:id', validateSchema(search_deleteWithId), function(req, res, next) {
  const {id}= req.params;
  const query={_id: ObjectId(id)}
  findOne({query: query}, COLLECTION_NAME)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({findFunction: "failed", err: err}))
})
//

// router.get('/search-many', validateSchema(search_deleteManyEmployeesSchema), function(req, res, next) {
//   const query= req.query;
//   findDocuments({query: query}, COLLECTION_NAME)
//     .then(result => res.status(200).json(result))
//     .catch(err => res.status(500).json({findFunction: "failed", err: err}))
// })
// //

// Insert One
// router.post('/insert', validateSchema(addSchema), function (req, res, next){
  router.post('/insert',async function (req, res, next){
    try{
    const data = req.body;
    if(data.birthday) {
      //format date: YYYY-MM-Đ => type of Date: string
      data.birthday= moment(data.birthday).utc().local().format('YYYY-MM-DD')
      //converting type of date from String to Date
      data.birthday= new Date(data.birthday)
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


