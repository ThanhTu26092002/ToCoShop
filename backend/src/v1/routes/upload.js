const express = require("express");
const router = express.Router();
const upload = require('../middlewares/multerUpload');
const {uploadFile, uploadMultiFile} = require('../controllers/uploadControllers');

router.post("/upload", upload.single("file"), uploadFile);

router.post("/multi", upload.array("multi", 10), uploadMultiFile);

router.post(
  '/image',
  upload.single("file"),
  function (req, res) {
    const productId = req.params.id;
    const publicUrl = `${req.protocol}://${req.hostname}:3010/upload/product/${productId}/${req.file.filename}`;
    res.status(200).json({ ok: true, publicUrl: publicUrl, file: req.file });
  }
);


router.get('/', (req, res, next) => {
  res.status(200).json({
      status: 'Page upload',
      message: 'api ok'
  })
})

module.exports = router;