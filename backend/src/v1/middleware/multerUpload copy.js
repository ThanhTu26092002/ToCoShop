const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  FOLDER_INITIATION,
  COLLECTION_CATEGORIES,
  COLLECTION_PRODUCTS,
  COLLECTION_SUPPLIERS,
  COLLECTION_EMPLOYEES,
} = require("../configs/constants");

const imageFilter = function (req, file, cb) {
  let tmp = null
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    // req.fileValidationError = "Only image files are allowed!";
    // return cb(new Error("Only image files are allowed!"));
    tmp=new Error("Only image files are allowed!");
  }
  cb(tmp, tmp===null? true: false);
};

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
  destination: function (req, file, cb) {
    let nameCollection = "";
    if (req.url.indexOf("/productImage/") === 0) {
      nameCollection = COLLECTION_PRODUCTS;
    } else if (req.url.indexOf("/categoryImage/") === 0) {
      nameCollection = COLLECTION_CATEGORIES;
    } else if (req.url.indexOf("/supplierImage/") === 0) {
      nameCollection = COLLECTION_SUPPLIERS;
    } else if (req.url.indexOf("/employeeImage/") === 0) {
      nameCollection = COLLECTION_EMPLOYEES;
    } else {
      return cb(new Error("Can not find the name Collection in the Url"), false);
    }
    let lastLocation = FOLDER_INITIATION;
    if (req.params.id) {
      lastLocation = req.params.id;
    }
    let storageUrl = `./public/uploads/images/${nameCollection}/${lastLocation}`;
    if (!fs.existsSync(storageUrl)) {
      fs.mkdirSync(storageUrl);
    }
    cb(null, storageUrl);
  },
  
});

const uploadFile = multer({
  storage: storage,
  fileFilter: imageFilter,
});

module.exports = uploadFile;
