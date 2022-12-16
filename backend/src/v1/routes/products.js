var express = require("express");
var router = express.Router();
const Product = require("../models/Product");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const upload = require("../middleware/multerUpload");
const fs = require("fs");
const {
  loadProduct,
  validateId,
  loadCategory,
  loadSupplier,
} = require("../validations/commonValidators");
const { findDocuments } = require("../utils/MongodbHelper");
const {
  COLLECTION_PRODUCTS,
  PATH_FOLDER_PUBLIC_UPLOAD,
  PATH_FOLDER_IMAGES,
} = require("../configs/constants");
const { formatterErrorFunc } = require("../utils/formatterError");
const COLLECTION_NAME = "products";

const unWindAttribute = {
  $unwind: "$attributes",
};

const addFieldTotalPriceEachType = {
  $addFields: {
    "attributes.totalPriceEachType": {
      $sum: {
        $multiply: [
          "$attributes.price",
          {
            $divide: [{ $subtract: [100, "$attributes.discount"] }, 100],
          },
        ],
      },
    },
  },
};

const groupBeforeFinish = {
  $group: {
    _id: "$_id",
    productCode: { $first: "$productCode" },
    name: { $first: "$name" },
    categoryId: { $first: "$categoryId" },
    supplierId: { $first: "$supplierId" },
    description: { $first: "$description" },
    promotionPosition: { $first: "$promotionPosition" },
    imageUrls: { $first: "$imageUrls" },
    coverImage: { $first: "$coverImage" },
    attributes: {
      $push: {
        size: "$attributes.size",
        color: "$attributes.color",
        stock: "$attributes.stock",
        discount: "$attributes.discount",
        price: "$attributes.price",
        _id: "$attributes._id",
        totalPriceEachType: "$attributes.totalPriceEachType",
      },
    },
    stockTotal: { $sum: { $sum: "$attributes.stock" } },
  },
};

const lookupCategory = {
  $lookup: {
    from: "categories", // foreign collection name
    localField: "categoryId",
    foreignField: "_id",
    as: "categories", // alias
  },
};

const lookupSupplier = {
  $lookup: {
    from: "suppliers", // foreign collection name
    localField: "supplierId",
    foreignField: "_id",
    as: "suppliers", // alias
  },
};

const stockTotalMoreThanZero = {
  $match: {
    $expr: {
      $lt: [0, "$stockTotal"],
    },
  },
};
//Get all products without unwrap categoryId and supplierId
// Lấy toàn bộ sản phẩm trong một danh mục nổi bật- theo id sản phẩm( hàng mới cập nhật)
router.get("/getAll", async (req, res, next) => {
  try {
    const docs = await Product.find().sort({ _id: -1 });
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//
//Get all products- container category and supplier
router.get("/", async function (req, res, next) {
  const aggregate = [
    lookupCategory,
    lookupSupplier,
    {
      $addFields: {
        categoryName: { $first: "$categories.name" },
        supplierName: { $first: "$suppliers.name" },
      },
    },
    {
      $project: {
        categories: 0,
        suppliers: 0,
      },
    },
  ];
  try {
    const docs = await Product.aggregate(aggregate);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});

//Get the product following Id
router.get("/findById/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const formattedId = new ObjectId(id)
    console.log('get:', id)
    const aggregate = [
      {$match: {_id: formattedId}},
      // Thêm field stockTotal
      unWindAttribute,
      addFieldTotalPriceEachType,
      groupBeforeFinish,
            //Lấy thêm thông tin category và supplier
            lookupCategory,
            lookupSupplier,
            {
              $project: {
                categoryId: 0,
                supplierId: 0,
              },
            },
    ];
    const docs = await Product.aggregate(aggregate);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});

//Delete ONE with ID
router.delete("/deleteOne/:id", validateId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteDoc = await Product.findByIdAndDelete(id);
    //deleteDoc !== false, is mean, finding a document with the id in the collection
    if (!deleteDoc) {
      res.status(200).json({
        ok: true,
        noneExist: `the document doesn't exist in the collection ${COLLECTION_PRODUCTS}`,
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
        COLLECTION_PRODUCTS +
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
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_PRODUCTS);
    res.status(400).json({
      ok: false,
      message: "Failed to delete the document with ID",
      error: errMsgMongoDB,
    });
  }
});
//

router.post("/insertOne", async (req, res, next) => {
  try {
    const data = req.body;
    // Create a new blog post object
    const newDoc = new Product(data);

    // Insert the article in our MongoDB database
    await newDoc.save();
    res.status(201).json({ ok: true, result: newDoc });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
router.patch("/updateOne/:id", validateId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updatedDoc = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });

    res.json({
      ok: true,
      message: "Update the Id successfully",
      result: updatedDoc,
    });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: true, error: errMsgMongoDB });
  }
});

router.post("/productImage/:id", loadProduct, function (req, res) {
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
        const productId = req.params.id;
        const newImgUrl = req.file.filename
          ? `${PATH_FOLDER_IMAGES}/${COLLECTION_PRODUCTS}/${productId}/${req.file.filename}`
          : null;
        const currentImgUrl = req.body.currentImgUrl
          ? req.body.currentImgUrl
          : null;
        console.log(currentImgUrl);
        const currentDirPath = PATH_FOLDER_PUBLIC_UPLOAD + currentImgUrl;
        console.log("test speed update");
        const opts = { runValidators: true };
        const updatedDoc = await Product.findByIdAndUpdate(
          productId,
          { coverImage: newImgUrl },
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

//----01---Get all products- container category and supplier- show stockTotal
router.get("/01getStockTotal", async function (req, res, next) {
  const aggregate = [
    unWindAttribute,
    addFieldTotalPriceEachType,
    groupBeforeFinish,
  ];
  try {
    const docs = await Product.aggregate(aggregate);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});

// ---02--- Get products following categoryId
router.get("/02getByCategoryId/:id", loadCategory, async (req, res, next) => {
  try {
    const categoryId = new ObjectId(req.params.id);
    const aggregate = [
      { $match: { categoryId } },
      unWindAttribute,
      // Loại bỏ chi tiết sản phẩm có stock=0
      {
        $match: {
          $expr: {
            $lt: [0, "$attributes.stock"],
          },
        },
      },
      //Thêm field attributes.totalPriceEachType
      addFieldTotalPriceEachType,
      {
        $group: {
          ...groupBeforeFinish.$group,
          minTotalPrice: { $min: "$attributes.totalPriceEachType" },
        },
      },
      stockTotalMoreThanZero,
      unWindAttribute,
      {
        $match: {
          $expr: {
            $eq: ["$minTotalPrice", "$attributes.totalPriceEachType"],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          productCode: { $first: "$productCode" },
          name: { $first: "$name" },
          categoryId: { $first: "$categoryId" },
          supplierId: { $first: "$supplierId" },
          description: { $first: "$description" },
          promotionPosition: { $first: "$promotionPosition" },
          imageUrls: { $first: "$imageUrls" },
          coverImage: { $first: "$coverImage" },
          size: { $first: "$attributes.size" },
          color: { $first: "$attributes.color" },
          stock: { $first: "$attributes.stock" },
          discount: { $first: "$attributes.discount" },
          price: { $first: "$attributes.price" },
          attributeId: { $first: "$attributes._id" },
          stockTotal: { $first: "$stockTotal" },
          minTotalPrice: { $first: "$minTotalPrice" },
        },
      },

      // { $sort: { minTotalPrice: 1 } },
    ];
    const docs = await Product.aggregate(aggregate);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//
// ---03--- Get products following supplierId
router.get("/03getBySupplierId/:id", loadSupplier, async (req, res, next) => {
  try {
    const supplierId = new ObjectId(req.params.id);
    const aggregate = [
      { $match: { supplierId } },
      unWindAttribute,
      addFieldTotalPriceEachType,
      groupBeforeFinish,
      stockTotalMoreThanZero,
    ];
    const docs = await Product.aggregate(aggregate);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//

// ---04---Sorting products following price from low <-> high
router.get("/04GetWithSortingPrice", async function (req, res, next) {
  const { sort } = req.query;
  if (!sort || (sort !== "low" && sort !== "high")) {
    const error = new Error("Not found!");
    error.status = 404;
    next(error);
    return;
  }
  let sorting = { $sort: { _id: 1 } };
  if (sort === "low") {
    sorting = { $sort: { minTotalPrice: 1 } };
  }
  if (sort === "high") {
    sorting = { $sort: { maxTotalPrice: -1 } };
  }
  const aggregate = [
    unWindAttribute,
    addFieldTotalPriceEachType,
    {
      $group: {
        ...groupBeforeFinish.$group,
        minTotalPrice: { $min: "$attributes.totalPriceEachType" },
        maxTotalPrice: { $max: "$attributes.totalPriceEachType" },
      },
    },
    stockTotalMoreThanZero,
    sorting,
  ];
  try {
    const docs = await Product.aggregate(aggregate);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});

// ---05---Sorting products following discount from low <-> high
router.get("/05GetWithSortingDiscount", async function (req, res, next) {
  const { sort } = req.query;
  if (!sort || (sort !== "low" && sort !== "high")) {
    const error = new Error("Not found!");
    error.status = 404;
    next(error);
    return;
  }
  let sorting = { $sort: { _id: 1 } };
  if (sort === "low") {
    sorting = { $sort: { minDiscount: 1 } };
  }
  if (sort === "high") {
    sorting = { $sort: { maxDiscount: -1 } };
  }
  const aggregate = [
    unWindAttribute,
    addFieldTotalPriceEachType,
    {
      $group: {
        ...groupBeforeFinish.$group,
        minDiscount: { $min: "$attributes.discount" },
        maxDiscount: { $max: "$attributes.discount" },
      },
    },
    stockTotalMoreThanZero,
    sorting,
  ];
  try {
    const docs = await Product.aggregate(aggregate);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});

// ---07--- Get products following a string in an array promotionPosition
router.get("/07getByPromotionPosition", async (req, res, next) => {
  try {
    const { value } = req.query;
    if (!value) {
      const error = new Error("Not found!");
      error.status = 404;
      next(error);
      return;
    }
    const aggregate = [
      {
        $match: {
          promotionPosition: { $in: [value] },
        },
      },
      unWindAttribute,
      addFieldTotalPriceEachType,
      groupBeforeFinish,
      stockTotalMoreThanZero,
    ];

    const docs = await Product.aggregate(aggregate);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//

//----08---GLấy toàn bộ sản phẩm có thêm stockTotal mô tả số lượng sản phẩm tồn kho >0 và totalPrice- giá sản phẩm theo mỗi [size và màu sắc]
router.get("/08getStockTotalMoreThan0", async function (req, res, next) {
  const aggregate = [
    unWindAttribute,
    addFieldTotalPriceEachType,
    groupBeforeFinish,
    stockTotalMoreThanZero,
  ];
  try {
    const docs = await Product.aggregate(aggregate);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
// router.get('/producttype/Assort/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const products = await Product.find({ categoryId:id}).sort({'price':1});
//     res.json(products);
//   } catch (err) {
//     res.status(400).json({ error: { name: err.name, message: err.message } });
//   }
// });
// router.get('/producttype/Dssort/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const products = await Product.find({ categoryId:id}).sort({'price':-1});
//     res.json(products);
//   } catch (err) {
//     res.status(400).json({ error: { name: err.name, message: err.message } });
//   }
// });
// router.get('/producttype/AZsort/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const products = await Product.find({ categoryId:id}).sort({'name':1});
//     res.json(products);
//   } catch (err) {
//     res.status(400).json({ error: { name: err.name, message: err.message } });
//   }
// });

// router.get('/producttype/ZAsort/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const products = await Product.find({ categoryId:id}).sort({'name':-1});
//     res.json(products);
//   } catch (err) {
//     res.status(400).json({ error: { name: err.name, message: err.message } });
//   }
// });
// router.get('/producttype/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const products = await Product.find({ categoryId:id});
//     res.json(products);
//   } catch (err) {
//     res.status(400).json({ error: { name: err.name, message: err.message } });
//   }
// });

router.get("/find/:name", async (req, res, next) => {
  try {
    const { name } = req.params;
    const product = await Product.find().byName(name);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: { name: err.name, message: err.message } });
  }
});

module.exports = router;
