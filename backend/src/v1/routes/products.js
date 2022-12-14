var express = require("express");
var router = express.Router();
const Product = require("../models/Product");
const multer = require('multer');
const upload = require("../middleware/multerUpload");
const fs = require('fs');
const { loadProduct, validateId } = require("../validations/commonValidators");
const {
  findDocuments,
} = require("../utils/MongodbHelper");
const {
  COLLECTION_PRODUCTS,
  PATH_FOLDER_PUBLIC_UPLOAD,
  PATH_FOLDER_IMAGES,
} = require("../configs/constants");
const { formatterErrorFunc } = require("../utils/formatterError");
const COLLECTION_NAME = 'products';
const lookupCategory = {
  $lookup: {
    from: 'categories', // foreign collection name
    localField: 'categoryId',
    foreignField: '_id',
    as: 'categories', // alias
  },
};

const lookupSupplier = {
  $lookup: {
    from: 'suppliers', // foreign collection name
    localField: 'supplierId',
    foreignField: '_id',
    as: 'suppliers', // alias
  },
};
//Get all products without unwrap categoryId and supplierId
router.get("/getAll", async (req, res, next) => {
  try {
    const docs = await Product.find().sort({ _id: -1 });
    // const docs = await Category.find();
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//
//Get all products
router.get('/', function (req, res, next) {

  const aggregate = [
    lookupCategory,
    lookupSupplier,
    {
      $addFields: { categoryId: { $first: '$categories' }, supplierId: { $first: '$suppliers' } },
    },
  ];

  findDocuments({ aggregate: aggregate }, COLLECTION_NAME)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});
// router.post('/productImage/:id',function (req, res, next){
//   upload.single("file")(req, res, async function (err) {
    
//   })
// })

//Get the product following Id
router.get('/findById/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    // const product = await Product.findOne({ _id: id });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: { name: err.name, message: err.message } });
  }
});  

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    // const product = await Product.findOne({ _id: id });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: { name: err.name, message: err.message } });
  }
});
router.post('/insertOne', async (req, res, next) => {
  try {
    const data = req.body;
    // Create a new blog post object
    const product = new Product(data);

    // Insert the article in our MongoDB database
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_PRODUCTS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: { name: err.name, message: err.message } });
  }
});

router.post("/productImage/:id",loadProduct, function (req, res) {
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
          console.log(currentImgUrl)
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
  
  router.get('/find/:name', async (req, res, next) => {
    try {
      const { name } = req.params;
      const product = await Product.find().byName(name);
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, message: err.message } });
    }
  });
  
 
  module.exports = router; 