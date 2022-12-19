"use strict";
var express = require("express");
var router = express.Router();
const multer = require("multer");
// const passport = require("passport");
// const jwt = require("jsonwebtoken");
const upload = require("../middleware/multerUpload");
const Category = require("../models/Category");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const {
  COLLECTION_CATEGORIES,
  PATH_FOLDER_PUBLIC_UPLOAD,
  PATH_FOLDER_IMAGES,
  COLLECTION_LOGINS,
} = require("../configs/constants");

const { formatterErrorFunc } = require("../utils/formatterError");
const { loadCategory, validateId } = require("../validations/commonValidators");

const { findDocuments, findDocument } = require("../utils/MongodbHelper");

// CHECK ROLES
const allowRoles = (...roles) => {
  //return a middleware
  return (req, res, next) => {
    //GET BEARER TOKEN FROM HEADER
    const bearerToken = req.get("Authorization").replace("Bearer ", "");
    //DECODE TOKEN
    const payload = jwt.decode(bearerToken, { json: true });
    //AFTER DECODE: GET UID FROM PAYLOAD
    const { uid } = payload;
    // FINDING BY ID
    findDocument(uid, COLLECTION_LOGINS).then((document) => {
      console.log(document);
      if (document && document.roles) {
        let ok = false;
        document.roles.forEach((role) => {
          if (roles.includes(role)) {
            ok = true;
            return;
          }
        });
        if (ok) {
          next();
        } else {
          res.status(403).json({ message: "Forbidden" });
        }
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    });
  };
};

//Get all docs
router.get("/", async (req, res, next) => {
// router.get("/", async (req, res, next) => {
  try {
    const docs = await Category.find().sort({ _id: -1 });
    // const docs = await Category.find();
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_CATEGORIES);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//

// 2. Update categoryImage
router.post("/categoryImage/:id", passport.authenticate("jwt", { session: false }),allowRoles("ADMINISTRATORS"), loadCategory, function (req, res) {
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

        const categoryId = req.params.id;
        const newImgUrl = req.file.filename
          ? `${PATH_FOLDER_IMAGES}/${COLLECTION_CATEGORIES}/${categoryId}/${req.file.filename}`
          : null;
        const currentImgUrl = req.body.currentImgUrl
          ? req.body.currentImgUrl
          : null;
        const currentDirPath = PATH_FOLDER_PUBLIC_UPLOAD + currentImgUrl;
        console.log("test speed update");
        const opts = { runValidators: true };
        const updatedDoc = await Category.findByIdAndUpdate(
          categoryId,
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

//3. Insert One WITHOUT An Image
router.post("/insertOne",passport.authenticate("jwt", { session: false }),allowRoles("ADMINISTRATORS"), async (req, res) => {
  try {
    const data = req.body;
    //Create a new blog post object
    const newDoc = new Category(data);
    //Insert the newDocument in our Mongodb database
    await newDoc.save();
    res.status(201).json({ ok: true, result: newDoc });
  } catch (errMongoDB) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_CATEGORIES);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//

//4. --Update One with _Id WITHOUT image
router.patch("/updateOne/:id",passport.authenticate("jwt", { session: false }),allowRoles("ADMINISTRATORS"), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const opts = { runValidators: true };
    //--Update in Mongodb
    const updatedDoc = await Category.findByIdAndUpdate(id, updateData, opts);
    if (!updatedDoc) {
      res.status(404).json({
        ok: true,
        error: {
          name: "id",
          message: `the document with following id doesn't exist in the collection ${COLLECTION_CATEGORIES}`,
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
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_CATEGORIES);
    res.status(400).json({ ok: true, error: errMsgMongoDB });
  }
});
//

//5. Delete ONE with ID
router.delete("/deleteOne/:id",passport.authenticate("jwt", { session: false }),allowRoles("ADMINISTRATORS"), validateId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteDoc = await Category.findByIdAndDelete(id);
    //deleteDoc !== false, is mean, finding a document with the id in the collection
    if (!deleteDoc) {
      res.status(200).json({
        ok: true,
        noneExist: `the document doesn't exist in the collection ${COLLECTION_CATEGORIES}`,
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
        COLLECTION_CATEGORIES +
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
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_CATEGORIES);
    res.status(400).json({
      ok: false,
      message: "Failed to delete the document with ID",
      error: errMsgMongoDB,
    });
  }
});
//


//HAVEN'T USED YET------------------------------------------------------------------------------------

// Get categories with all products  --- task 18
router.get("/products",passport.authenticate("jwt", { session: false }),allowRoles("ADMINISTRATORS"), function (req, res) {
  const aggregate = [
    {
      $lookup: {
        from: "products",
        let: { categoryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$categoryId", "$categoryId"] },
            },
          },
          { $project: { name: 1, price: 1, discount: 1, stock: 1 } },
        ],
        as: "products",
      },
    },
    {
      $match: { products: { $ne: [] } }, // Solution 1
      // $match: {products: { $exists: true,$ne: []}} // Solution 2
      // $match : {$exists: true, $not: {$size: 0}} // Solution 3
    },
    {
      $addFields: {
        totalStock: { $sum: "$products.stock" },
      },
    },
  ];
  findDocuments({ aggregate: aggregate }, COLLECTION_CATEGORIES)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});
//

// TASK 30
//Show categories with totalPrice from products have sold in each Category
router.get("/totalPrice",passport.authenticate("jwt", { session: false }),allowRoles("ADMINISTRATORS"), function (req, res) {
  const aggregate = [
    {
      $lookup: {
        from: "products",
        let: { categoryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$categoryId", "$categoryId"] },
            },
          },
          {
            $project: {
              categoryId: 0,
              description: 0,
              supplierId: 0,
              stock: 0,
            },
          },
        ],
        as: "products",
      },
    },

    {
      $unwind: {
        path: "$products",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "orders",
        let: { productId: "$products._id" },
        pipeline: [
          { $unwind: "$orderDetails" },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$productId", "$orderDetails.productId"] },
                  { $ne: ["$status", "CANCELED"] },
                ],
              },
            },
          },
          {
            $addFields: {
              totalPriceOfOneOrder: {
                $sum: {
                  $multiply: [
                    "$orderDetails.price",
                    "$orderDetails.quantity",
                    {
                      $divide: [
                        { $subtract: [100, "$orderDetails.discount"] },
                        100,
                      ],
                    },
                  ],
                },
              },
            },
          },
          {
            $project: {
              shippingAddress: 0,
              description: 0,
              "orderDetails.productId": 0,
              customerId: 0,
              employeeId: 0,
            },
          },
        ],
        as: "listOrders",
      },
    },
    {
      $addFields: {
        totalPriceOneProduct: { $sum: "$listOrders.totalPriceOfOneOrder" },
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        totalPriceProducts: { $sum: "$totalPriceOneProduct" },
      },
    },
  ];
  findDocuments({ aggregate: aggregate }, COLLECTION_CATEGORIES)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//------------------------------------------------------------------------------------------------

module.exports = router;
