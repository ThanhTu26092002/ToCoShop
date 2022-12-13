var express = require("express");
var router = express.Router();
const multer = require('multer');
const Slides = require("../models/Slides");
const upload = require("../middleware/multerUpload");
const fs = require('fs');
const { loadSlides } = require("../validations/commonValidators");
const {
  findDocuments,
} = require("../utils/MongodbHelper");
const {
  COLLECTION_SLIDES,
  PATH_FOLDER_PUBLIC_UPLOAD,
  PATH_FOLDER_IMAGES,
} = require("../configs/constants");
router.get('/', async (req, res, next) => {
    try {
      const slides = await Slides.find();
      res.json(slides);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  router.get('/status', async (req, res, next) => {
    try {
      const slides = await Slides.find({status:"ACTIVE"});
      res.json(slides);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  router.post('/', async (req, res, next) => {
    try {
      const data = req.body;
      console.log(data)
      // Create a new blog post object
      const slides = new Slides(data);
 
      // Insert the article in our MongoDB database
      await slides.save();
      res.status(200).json(slides);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  }); 
  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const slides = await Slides.findByIdAndDelete(id);
      res.json(slides);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  router.patch('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const update = req.body;
      const slides = await Slides.findByIdAndUpdate(id, update, {
        new: true,
      });
      res.json(slides);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  }); 
  router.post("/slidesImage/:id",loadSlides, function (req, res) {
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
          const slidesId = req.params.id;
          const newImgUrl = req.file.filename
            ? `${PATH_FOLDER_IMAGES}/${COLLECTION_SLIDES}/${slidesId}/${req.file.filename}`
            : null;
          const currentImgUrl = req.body.currentImgUrl
            ? req.body.currentImgUrl
            : null;
            console.log(currentImgUrl)
          const currentDirPath = PATH_FOLDER_PUBLIC_UPLOAD + currentImgUrl;
          console.log("test speed update");
          const opts = { runValidators: true };
          const updatedDoc = await Slides.findByIdAndUpdate(
            slidesId,
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
  module.exports = router; 