const express = require("express");
const router = express.Router();
const upload = require('../middleware/multerUpload');
const {uploadFile, uploadMultiFile} = require('../controllers/uploadControllers');

const {
  FOLDER_INITIATION,
  COLLECTION_CATEGORIES,
  COLLECTION_PRODUCTS,
  COLLECTION_SUPPLIERS,
  COLLECTION_EMPLOYEES,
} = require("../configs/constants");
router.post("/upload", upload.single("file"), uploadFile);

router.post("/multi", upload.array("multi", 10), uploadMultiFile);

router.post(
  '/productImage/:id',
  upload.single("file"),
  function (req, res) {
    const productId = req.params.id;
    const publicUrl = `${req.protocol}://${req.hostname}:3010/uploads/products/${productId}/${req.file.filename}`;
    res.status(200).json({ ok: true, publicUrl: publicUrl, file: req.file });
  }
);

router.post(
  '/supplierImage/:id',
  upload.single("file"),
  function (req, res) {
    const supplierId = req.params.id;
    const newImgUrl = req.file.filename
    ? `/images/${COLLECTION_PRODUCTS}/${supplierId}/${req.file.filename}`
    : null;
    res.status(200).json({ ok: true, newImgUrl, file: req.file });
  }
);


router.get('/', (req, res, next) => {
  res.status(200).json({
      status: 'Page upload',
      message: 'api ok'
  })
})

module.exports = router;