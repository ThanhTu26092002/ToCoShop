"use strict";
var express = require("express");
var router = express.Router();
const Transportation = require("../models/Transportation");
const { formatterErrorFunc } = require("../utils/formatterError");
const { validateId } = require("../validations/commonValidators");
const { COLLECTION_TRANSPORTATIONS } = require("../configs/constants");
const passport = require("passport");
const { allowRoles } = require("../middleware/checkRoles");

//Get all orders
router.get("/", async (req, res, next) => {
  try {
    const docs = await Transportation.find();
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_CATEGORIES);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});
//

// Insert One
// router.post('/insert', validateSchema(addSchema), function (req, res, next){
router.post(
  "/insertOne",
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  async (req, res, next) => {
    try {
      let data = req.body;
      //format date: YYYY-MM-DD => type of Date: string
      //Create a new blog post object
      const doc = new Transportation(data);
      //Insert the new document in our MongoDB database
      await doc.save();
      res.status(201).json(doc);
    } catch (err) {
      const errMsg = formatterErrorFunc(err);
      res.status(400).json({ error: errMsg });
    }
  }
);
//
//--Update One with _Id WITHOUT image
router.patch(
  "/updateOne/:id",
  validateId,
  passport.authenticate("jwt", { session: false }),
  allowRoles("ADMINISTRATORS"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      const opts = { runValidators: true };
      //--Update in Mongodb
      const updatedDoc = await Transportation.findByIdAndUpdate(
        id,
        updateData,
        opts
      );
      if (!updatedDoc) {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_TRANSPORTATIONS}`,
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
        COLLECTION_TRANSPORTATIONS
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
      const deleteDoc = await Transportation.findByIdAndDelete(id);
      console.log("result delete: ", deleteDoc);
      //deleteDoc !== false, is mean, finding a document with the id in the collection
      if (!deleteDoc) {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_TRANSPORTATIONS}`,
          },
        });
        return;
      }
      res.json({
        ok: true,
        message: "Delete the document in MongoDB successfully",
      });
    } catch (errMongoDB) {
      const errMsgMongoDB = formatterErrorFunc(
        errMongoDB,
        COLLECTION_TRANSPORTATIONS
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

//------------------------------------------------------------------------------------------------

module.exports = router;
