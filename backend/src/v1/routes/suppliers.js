"use strict";
var express = require("express");
var router = express.Router();
const Supplier = require("../models/Supplier");
const multer = require("multer");
const fs = require("fs");
const upload = require("../middleware/multerUpload");
const passport = require("passport");
const {
  PATH_FOLDER_PUBLIC_UPLOAD,
  PATH_FOLDER_IMAGES,
  COLLECTION_SUPPLIERS,
} = require("../configs/constants");
const { formatterErrorFunc } = require("../utils/formatterError");
const { loadSupplier, validateId } = require("../validations/commonValidators");

const { findDocuments } = require("../utils/MongodbHelper");
const { allowRoles } = require("../middleware/checkRoles");
// const passport = require("passport");

//Get all docs
router.get("/", async (req, res, next) => {
  try {
    const docs = await Supplier.find().sort({ _id: -1 });
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_SUPPLIERS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//

// Update supplierImage
router.post(
  "/supplierImage/:id",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  loadSupplier,
  (req, res) => {
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

          const supplierId = req.params.id;
          const newImgUrl = req.file.filename
            ? `${PATH_FOLDER_IMAGES}/${COLLECTION_SUPPLIERS}/${supplierId}/${req.file.filename}`
            : null;
          const currentImgUrl = req.body.currentImgUrl
            ? req.body.currentImgUrl
            : null;
          const currentDirPath = PATH_FOLDER_PUBLIC_UPLOAD + currentImgUrl;

          const opts = { runValidators: true };
          const updatedDoc = await Supplier.findByIdAndUpdate(
            supplierId,
            { imageUrl: newImgUrl },
            opts
          );
          //if currentImgUrl =null
          if (!currentImgUrl) {
            res.json({
              ok: true,
              more_detail: "The Supplier has the new image",
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
//

// Insert One WITHOUT An Image
router.post(
  "/insertOne",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  async (req, res) => {
    try {
      const data = req.body;
      //Create a new blog post object
      const newDoc = new Supplier(data);
      //Insert the newDocument in our Mongodb database
      await newDoc.save();
      res.status(201).json({ ok: true, result: newDoc });
    } catch (errMongoDB) {
      const errMsgMongoDB = formatterErrorFunc(
        errMongoDB,
        COLLECTION_SUPPLIERS
      );
      res.status(400).json({ ok: false, error: errMsgMongoDB });
    }
  }
);
//

//--Update One with _Id WITHOUT image
router.patch(
  "/updateOne/:id",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  validateId,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      const opts = { runValidators: true };
      //--Update in Mongodb
      const updatedDoc = await Supplier.findByIdAndUpdate(id, updateData, opts);
      if (!updatedDoc) {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_SUPPLIERS}`,
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
      const errMsgMongoDB = formatterErrorFunc(
        errMongoDB,
        COLLECTION_SUPPLIERS
      );
      res.status(400).json({ ok: true, error: errMsgMongoDB });
    }
  }
);
//

//Delete ONE with ID
router.delete(
  "/deleteOne/:id",
  validateId,
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleteDoc = await Supplier.findByIdAndDelete(id);
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
          COLLECTION_SUPPLIERS +
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
          // console.log({ok: true, warning: 'Not existing the folder containing image for deleted document in DiskStorage', message: 'Delete the document with ID successfully, in MongoDB'})
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
        COLLECTION_SUPPLIERS
      );
      res.status(400).json({
        ok: false,
        message: "Failed to delete the document with ID",
        error: errMsgMongoDB,
      });
    }
  }
);
//

//----------------------------------------

router.get("/findById/:id",validateId, passport.authenticate("jwt", { session: false }),
allowRoles("ADMINISTRATORS"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    //the same:  const supplier = await Supplier.findOne({ _id: id });
    res.json({ ok: true, result: supplier });
  } catch (err) {
    res.status(400).json({ error: { name: err.name, message: err.message } });
  }
});
//

//TASK 26  --- not finished
//---get suppliers that not sale
router.get("/suppliersNotSale", function (req, res, next) {
  aggregate = [
    {
      $lookup: {
        from: "products",
        let: { supplierId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $ne: ["$productId", "$$productId"] },
                  // {$eq: ['$status', 'COMPLETED'] },
                ],
              },
            },
          },
        ],
        as: "products",
      },
    },
    {
      $match: { products },
    },
    // {
    //   $lookup: {
    //     from: "orders",
    //     let: {productId: "$_id"},
    //     pipeline: [
    //       {$unwind: "$orderDetails"},
    //       {$match: {
    //         $expr: {
    //           $and: [
    //             {$eq: ['$orderDetails.productId', '$$productId'] },
    //             {$eq: ['$status', 'COMPLETED'] },

    //           ]
    //         }
    //       }}
    //     ],
    //     as: "orders"
    //   }},
  ];
  findDocuments(
    query,
    COLLECTION_SUPPLIERS,
    aggregate,
    sort,
    limit,
    skip,
    projection
  )
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).json({ findFunction: "failed :v", err: err })
    );
});
//
//

// Get suppliers --- task 15
router.get("/search", function (req, res, next) {
  let { key, values } = req.query;
  // change "," into "|" and remove spaces in string values for Regular Expression
  values = values.replaceAll(",", "|");
  values = values.replaceAll(" ", "");
  let query = {};
  switch (key) {
    case "name":
      query = { name: new RegExp(`${values}`, "gi") };
      break;
    default:
  }
  findDocuments({ query: query }, COLLECTION_SUPPLIERS)
    .then((result) => {
      if (result.length === 0) {
        res.status(404).json({ message: "Not Found" });
      } else {
        res.status(200).json(result);
      }
    })
    .catch((err) =>
      res.status(500).json({ findFunction: "failed :v", err: err })
    );
});
//

// Get suppliers with all products  --- task 19
router.get("/products", function (req, res) {
  aggregate = [
    {
      $lookup: {
        from: "products",
        let: { supplierId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$supplierId", "$supplierId"] },
            },
          },
        ],
        as: "products",
      },
    },
    {
      $addFields: {
        totalSupply: { $sum: "$products.stock" },
      },
    },
  ];
  findDocuments({ aggregate: aggregate }, COLLECTION_SUPPLIERS)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//Listing suppliers that have product sold
router.get("/suppliersNotSold", function (req, res) {
  const { dateFrom, dateTo } = req.query;

  let start = new Date(moment(dateFrom).utc().local().format("YYYY-MM-DD"));
  let end = new Date(moment(dateTo).utc().local().format("YYYY-MM-DD"));

  const aggregate = [
    {
      $lookup: {
        from: "products",
        let: { supplierId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$supplierId", "$$supplierId"] }],
              },
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
          {
            $unwind: {
              path: "$orderDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$productId", "$orderDetails.productId"] },
                  { $ne: ["$status", "CANCELED"] },
                  // {$gte: ['$createdDate', start]},
                  // {$lte: ['$createdDate', end]}
                ],
              },
            },
          },
        ],
        as: "orders",
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        isProduct: { $push: "$products._id" },
        isOrder: { $push: "$orders._id" },
      },
    },
    {
      $match: {
        $or: [{ isProduct: { $eq: [] } }, { isOrder: { $eq: [] } }],
      },
    },
  ];

  findDocuments({ aggregate: aggregate }, COLLECTION_SUPPLIERS)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//------------------------------------------------------------------------------------------------
module.exports = router;
