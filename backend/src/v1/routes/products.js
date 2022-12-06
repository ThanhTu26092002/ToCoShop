var express = require("express");
var router = express.Router();
const Product = require("../models/Product");
const multer = require('multer');
const upload = require("../middleware/multerUpload");
const fs = require('fs');
const {
  findDocuments,
} = require("../utils/MongodbHelper");
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
  router.get('/producttype/Assort/:id', async (req, res, next) => {kkkkkkkk
    try {
      const { id } = req.params;
      const products = await Product.find({ categoryId:id}).sort({'price':1});
      res.json(products);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  router.get('/producttype/Dssort/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const products = await Product.find({ categoryId:id}).sort({'price':-1});
      res.json(products);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  router.get('/producttype/AZsort/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const products = await Product.find({ categoryId:id}).sort({'name':1});
      res.json(products);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  
  router.get('/producttype/ZAsort/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const products = await Product.find({ categoryId:id}).sort({'name':-1});
      res.json(products);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  router.get('/producttype/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const products = await Product.find({ categoryId:id});
      res.json(products);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      // const product = await Product.findOne({ _id: id });
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });  
  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);
      // const product = await Product.findOne({ _id: id });
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  router.post('/', async (req, res, next) => {
    try {
      const data = req.body;
      // Create a new blog post object
      const product = new Product(data);
 
      // Insert the article in our MongoDB database
      await product.save();
      res.status(200).json(product);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
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
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
  router.get('/find/:name', async (req, res, next) => {
    try {
      const { name } = req.params;
      const product = await Product.find().byName(name);
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: { name: err.name, messgae: err.message } });
    }
  });
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
  router.post('/productImage/:id',function (req, res, next){
    upload.single("file")(req, res, async function (err) {
      
    })
  })
  module.exports = router; 