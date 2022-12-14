const { ObjectID } = require("bson");
const {
  COLLECTION_CATEGORIES,
  COLLECTION_SUPPLIERS,
  COLLECTION_PRODUCTS,
  COLLECTION_EMPLOYEES,
  COLLECTION_SLIDES
} = require("../configs/constants");
const { findDocument } = require("../utils/MongodbHelper");

function validateId(req, res, next) {
  const id = req.params.id;
  if (!(id && ObjectID.isValid(id))) {
    res.status(400).json({
      ok: false,
      error: {
        name: "id",
        message: "The parameter id is not a true formatted ObjectId",
      },
    });
    return;
  }
  next();
}
//


function loadCategory(req, res, next) {
  const id = req.params.id;
  if (!(id && ObjectID.isValid(id))) {
    res.status(400).json({
      ok: false,
      error: {
        name: "id",
        message: "The parameter id is not a true formatting ObjectId",
      },
    });
    return;
  }

  findDocument(id, COLLECTION_CATEGORIES)
    .then((result) => {
      //result !== false, is mean, finding a document with the id in the collection
      if (result) {
        req.document = result;
        next();
      } else {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_CATEGORIES}`,
          },
        });
        return;
      }
    })
    .catch((error) => {
      res.status(500).json({ ok: false, error });
      return;
    });
}
//
function loadSupplier(req, res, next) {
  const id = req.params.id;
  if (!(id && ObjectID.isValid(id))) {
    res.status(400).json({
      ok: false,
      error: {
        name: "id",
        message: "The parameter id is not a true formatting ObjectId",
      },
    });
    return;
  }

  findDocument(id, COLLECTION_SUPPLIERS)
    .then((result) => {
      //result !== false, is mean, finding a document with the id in the collection
      if (result) {
        req.document = result;
        next();
      } else {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_SUPPLIERS}`,
          },
        });
        return;
      }
    })
    .catch((error) => {
      res.status(500).json({ ok: false, error });
      return;
    });
}
//
function loadProduct(req, res, next) {
  const id = req.params.id;
  if (!(id && ObjectID.isValid(id))) {
    res.status(400).json({
      ok: false,
      error: {
        name: "id",
        message: "The parameter id is not a true formatting ObjectId",
      },
    });
    return;
  }

  findDocument(id, COLLECTION_PRODUCTS)
    .then((result) => {
      //result !== false, is mean, finding a document with the id in the collection
      if (result) {
        req.document = result;
        next();
      } else {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_PRODUCTS}`,
          },
        });
        return;
      }
    })
    .catch((error) => {
      res.status(500).json({ ok: false, error });
      return;
    });
}
//
function loadEmployee(req, res, next) {
  const id = req.params.id;
  if (!(id && ObjectID.isValid(id))) {
    res.status(400).json({
      ok: false,
      error: {
        name: "id",
        message: "The parameter id is not a true formatting ObjectId",
      },
    });
    return;
  }

  findDocument(id, COLLECTION_EMPLOYEES)
    .then((result) => {
      //result !== false, is mean, finding a document with the id in the collection
      if (result) {
        req.document = result;
        next();
      } else {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_EMPLOYEES}`,
          },
        });
        return;
      }
    })
    .catch((error) => {
      res.status(500).json({ ok: false, error });
      return;
    });
}
//
function loadSlides(req, res, next) {
  const id = req.params.id;
  if (!(id && ObjectID.isValid(id))) {
    res.status(400).json({
      ok: false,
      error: {
        name: "id",
        message: "The parameter id is not a true formatting ObjectId",
      },
    });
    return;
  }

  findDocument(id, COLLECTION_SLIDES)
    .then((result) => {
      //result !== false, is mean, finding a document with the id in the collection
      if (result) {
        req.document = result;
        next();
      } else {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_SLIDES}`,
          },
        });
        return;
      }
    })
    .catch((error) => {
      res.status(500).json({ ok: false, error });
      return;
    });
}
module.exports = {
  validateId,
  loadCategory,
  loadSupplier,
  loadProduct,
  loadEmployee,
  loadSlides
};
