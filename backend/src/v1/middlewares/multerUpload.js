const multer = require("multer");
const path = require('path');

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../public/images/products'));
  },
});

const uploadFile = multer({
  storage: storage,
  fileFilter: imageFilter,
});

module.exports = uploadFile;