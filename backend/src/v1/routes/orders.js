var express = require("express");
const Order = require("../models/Order");
var moment = require("moment");
var router = express.Router();
const { ObjectId } = require("mongodb");
const { formatterErrorFunc } = require("../utils/formatterError");
const { validateId } = require("../validations/commonValidators");
const passport = require("passport");
const { allowRoles } = require("../middleware/checkRoles");
const { findDocuments } = require("../utils/MongodbHelper");
const Supplier = require("../models/Supplier");
const { COLLECTION_ORDERS } = require("../configs/constants");
const Product = require("../models/Product");
const aggregateLookup = [
  {
    $unwind: "$orderDetails",
  },
  {
    $lookup: {
      from: "products", // foreign collection name
      localField: "orderDetails.productId",
      foreignField: "_id",
      as: "product", // alias
    },
  },
  {
    $addFields: {
      "orderDetails.productName": { $first: "$product.name" },
      "orderDetails.finalPrice": {
        $divide: [
          {
            $multiply: [
              "$orderDetails.price",
              "$orderDetails.quantity",
              { $subtract: [100, "$orderDetails.discount"] },
            ],
          },
          100,
        ],
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      orderCode: { $first: "$orderCode" },
      createdDate: { $first: "$createdDate" },
      sendingDate: { $first: "$sendingDate" },
      receivedDate: { $first: "$receivedDate" },
      status: { $first: "$status" },
      contactInfo: { $first: "$contactInfo" },
      shippingInfo: { $first: "$shippingInfo" },
      paymentInfo: { $first: "$paymentInfo" },
      orderDetails: { $push: "$orderDetails" },
      totalPrice: { $sum: "$orderDetails.finalPrice" },
      handlers: { $first: "$handlers" },
    },
  },
  {
    $lookup: {
      from: "transportations", // foreign collection name
      localField: "shippingInfo.transportationId",
      foreignField: "_id",
      as: "transportation", // alias
    },
  },
  {
    $addFields: {
      "shippingInfo.transportationName": { $first: "$transportation.name" },
    },
  },
  {
    $project: {
      transportation: 0,
      "orderDetails.finalPrice": 0,
    },
  },
  {$sort: {"_id": -1}}
];

//Get all orders
router.get("/", async (req, res, next) => {
  try {
    const docs = await Order.aggregate(aggregateLookup);
    res.json({ ok: true, results: docs });
  } catch (err) {
    const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_ORDERS);
    res.status(400).json({ ok: false, error: errMsgMongoDB });
  }
});

router.get("/orderDetail/:id", validateId, async (req, res, next) => {
  try {
    const aggregateDetail = [
      {
        $unwind: "$orderDetails",
      },
      {
        $lookup: {
          from: "products",
          let: { attributeId: "$orderDetails.productAttributeId" },
          pipeline: [
            { $unwind: "$attributes" },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$attributes._id", "$$attributeId"] },
                    // { $ne: ["$status", "CANCELED"] },
                  ],
                },
              },
            },
          ],
          as: "products",
        },
      },
      {
        $addFields: {
          "orderDetails.productInfo": { $first: "$products" },
          "orderDetails.finalPrice": {
            $divide: [
              {
                $multiply: [
                  "$orderDetails.price",
                  "$orderDetails.quantity",
                  { $subtract: [100, "$orderDetails.discount"] },
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          orderCode: { $first: "$orderCode" },
          createdDate: { $first: "$createdDate" },
          sendingDate: { $first: "$sendingDate" },
          receivedDate: { $first: "$receivedDate" },
          status: { $first: "$status" },
          contactInfo: { $first: "$contactInfo" },
          shippingInfo: { $first: "$shippingInfo" },
          paymentInfo: { $first: "$paymentInfo" },
          orderDetails: { $push: "$orderDetails" },
          totalPrice: { $sum: "$orderDetails.finalPrice" },
          handlers: { $first: "$handlers" },
        },
      },
      {
        $lookup: {
          from: "transportations", // foreign collection name
          localField: "shippingInfo.transportationId",
          foreignField: "_id",
          as: "transportation", // alias
        },
      },
      {
        $addFields: {
          "shippingInfo.transportationName": { $first: "$transportation.name" },
        },
      },
      {
        $project: {
          transportation: 0,
          "orderDetails.finalPrice": 0,
        },
      },
    ];
    const id = new ObjectId(req.params.id);
    const docs = await Order.aggregate([
      { $match: { _id: id } },
      ...aggregateDetail,
    ]);
    if (docs.length == 0) {
      res.status(404).json({
        ok: true,
        error: {
          name: "id",
          message: `the document with following id doesn't exist in the collection ${COLLECTION_ORDERS}`,
        },
      });
      return;
    }
    res.json({ ok: true, results: docs });
  } catch (errMongoDB) {
    const errMsgMongoDB = formatterErrorFunc(errMongoDB, COLLECTION_ORDERS);
    res.status(400).json({ ok: true, error: errMsgMongoDB });
  }
});
//

// Insert One
// router.post('/insert', validateSchema(addSchema), function (req, res, next){
router.post("/insertOne", async (req, res, next) => {
  try {
    let data = req.body;
    const { orderDetails } = req.body;
    //Ki????m tra xem sa??n ph????m co??n trong kho tr??????c khi c????p nh????t
    for (let i = 0; i < orderDetails.length; i++) {
      const attributeQuantity = orderDetails[i].quantity;
      const attributeName = orderDetails[i].productName;
      const attributeColor = orderDetails[i].color;
      const attributeSize = orderDetails[i].size;
      //N????u d???? li????u ??????u va??o ma?? s???? l??????ng <=0 thi?? ba??o l????i
      //N????u kh??ng co?? ??u?? ca??c field trong orderDetail thi?? ba??o l????i d???? li????u
      if (
        !attributeQuantity ||
        !attributeName ||
        !attributeColor ||
        !attributeSize
      ) {
        const errMsg = formatterErrorFunc(
          {
            name: "L????i d???? li????u",
            message: `Vui lo??ng nh????p ??u?? tr??????ng d???? li????u trong orderDetails`,
          },
          COLLECTION_ORDERS
        );
        res.status(400).json({ error: errMsg });
        return;
      }
      if (attributeQuantity <= 0) {
        const errMsg = formatterErrorFunc(
          {
            name: "L????i d???? li????u",
            message: `S???? l??????ng sa??n ph????m  ??????t mua pha??i l????n h??n 0`,
          },
          COLLECTION_ORDERS
        );
        res.status(400).json({ error: errMsg });
        return;
      }
      const attributeId = new ObjectId(orderDetails[i].productAttributeId);
      //1. L????y danh sa??ch sa??n ph????m ??a?? unwind attributes.
      const aggregateProduct = [
        {
          $unwind: "$attributes",
        },
        {
          $match: {
            $expr: {
              $and: [
                { $lt: [0, "$attributes.stock"] },
                { $lte: [attributeQuantity, "$attributes.stock"] },
                { $eq: [attributeId, "$attributes._id"] },
              ],
            },
          },
        },
      ];
      const products = await Product.aggregate(aggregateProduct);
      if (products.length < 1) {
        const errMsg = formatterErrorFunc(
          {
            name: "H????t ha??ng",
            message: `Sa??n ph????m ${attributeName} size ${attributeSize}-ma??u ${attributeColor} kh??ng co??n ha??ng trong kho `,
          },
          COLLECTION_ORDERS
        );
        res.status(400).json({ error: errMsg });
        return;
      }
      //N????u co?? sa??n ph????m ??a??p ????ng thi?? ti????p tu??c vo??ng l????p ?????? ki????m tra sa??n ph????m ti????p theo
    }
    //format date: YYYY-MM-DD => type of Date: string
    if (data.shippedDate) {
      data.shippedDate = moment(data.shippedDate)
        .utc()
        .local()
        .format("YYYY-MM-DD");
      data.shippedDate = new Date(data.shippedDate);
    }
    let createdDate = moment(new Date()).utc().local().format("YYYY-MM-DD");
    if (data.createdDate) {
      createdDate = moment(data.createdDate).utc().local().format("YYYY-MM-DD");
    }
    createdDate = new Date(createdDate);

    //Generating orderCode
    //"TCS" // TSC: the name of shop - ToCoShop
    var now = new Date();
    let orderCode = "TCS" + now.getFullYear().toString();
    orderCode +=
      (now.getMonth < 9 ? "0" : "") + (now.getMonth() + 1).toString(); // JS months are 0-based, so +1 and pad with 0's
    orderCode += (now.getDate < 10 ? "0" : "") + now.getDate().toString();
    orderCode += (now.getHours < 10 ? "0" : "") + now.getHours().toString();
    orderCode += (now.getMinutes < 10 ? "0" : "") + now.getMinutes().toString();
    orderCode += (now.getSeconds < 10 ? "0" : "") + now.getSeconds().toString();
    console.log("data:dfasdf", data);

    let newData = { createdDate, ...data, orderCode };
    delete newData.size;
    delete newData.color;
    delete newData.productName;
    //Create a new blog post object
    const order = new Order(newData);
    //Insert the product in our MongoDB database
    await order.save();
    //Sau khi ??a?? c????p nh????t thi?? t????ng ????ng tr???? ??i s???? sa??n ph????m ??a?? mua trong collection Products
    for (let i = 0; i < orderDetails.length; i++) {
      const attributeQuantity = parseInt(orderDetails[i].quantity);
      const attributeId = new ObjectId(orderDetails[i].productAttributeId);
      //1. Unwin danh sa??ch sa??n ph????m theo attributes
      const aggregateProduct = [
        {
          $unwind: "$attributes",
        },
        {
          $match: {
            $expr: {
              $and: [{ $eq: [attributeId, "$attributes._id"] }],
            },
          },
        },
      ];
      //Ti??m th????y r????i ti????n ha??nh c????p nh????t
      const unWindProducts = await Product.aggregate(aggregateProduct);
      const newStock = unWindProducts[0].attributes.stock - attributeQuantity;
      for (let j = 0; j < unWindProducts.length; j++) {
        const filter = { "attributes._id": attributeId };
        const update = { $set: { "attributes.$.stock": newStock } };
        const updateProductAttributeQuantity = await Product.findOneAndUpdate(
          filter,
          update,
          { new: true, safe: true, upsert: true }
        );
        break;
        //N????u co?? sa??n ph????m ??a??p ????ng thi?? ti????p tu??c vo??ng l????p ?????? ki????m tra sa??n ph????m ti????p theo
      }
    }
    res.status(201).json({
      ok: true,
      result: order,
      other: "Update stock in collection products successfully!",
    });
  } catch (err) {
    const errMsg = formatterErrorFunc(err, COLLECTION_ORDERS);
    res.status(400).json({ error: errMsg });
  }
});

//Update One with _Id - ok
router.patch(
  "/updateOne/:id",
  validateId,
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      //N????u new status === CANCELED , thi?? ti????n ha??nh hoa??n tra?? ca??c sa??n ph????m ??a?? co?? tr??????c ??o??.
      if (updateData.status && updateData.status === "CANCELED") {
        //1. L????y ma??ng ca??c m????t ha??ng c????n hoa??n tra??
        const order = await Order.findById(id);
        const orderDetails = [...order.orderDetails];
        for (let i = 0; i < orderDetails.length; i++) {
          const attributeQuantity = parseInt(orderDetails[i].quantity);
          const attributeId = new ObjectId(orderDetails[i].productAttributeId);
          //1. Unwin danh sa??ch sa??n ph????m theo attributes
          const aggregateProduct = [
            {
              $unwind: "$attributes",
            },
            {
              $match: {
                $expr: {
                  $and: [{ $eq: [attributeId, "$attributes._id"] }],
                },
              },
            },
          ];
          //Ti??m th????y r????i ti????n ha??nh c????p nh????t
          const unWindProducts = await Product.aggregate(aggregateProduct);
          const newStock =
            unWindProducts[0].attributes.stock + attributeQuantity;
          for (let j = 0; j < unWindProducts.length; j++) {
            const filter = { "attributes._id": attributeId };
            const update = { $set: { "attributes.$.stock": newStock } };
            const updateProductAttributeQuantity =
              await Product.findOneAndUpdate(filter, update, {
                new: true,
                safe: true,
                upsert: true,
              });
            break;
            //N????u co?? sa??n ph????m ??a??p ????ng thi?? ti????p tu??c vo??ng l????p ?????? ki????m tra sa??n ph????m ti????p theo
          }
        }
      }
      // Ti????p tu??c c????p nh????t Order
      //if updating [createdDate, shippedDate]
      //convert type of [createdDate, shippedDate] from STRING to DATE with formatting 'YYYY-MM-DD
      if (updateData.shippedDate) {
        updateData.shippedDate = new Date(
          moment(updateData.shippedDate).utc().local().format("YYYY-MM-DD")
        );
      }
      if (updateData.createdDate) {
        updateData.createdDate = new Date(
          moment(updateData.createdDate).utc().local().format("YYYY-MM-DD")
        );
      }
      // Chu?? y?? n????u co?? ng??????i c???? y?? c????p nh????t orderDetails thi?? se?? loa??i no?? tr??????c khi c????p nh????t
      if (updateData.orderDetails) {
        delete updateData.orderDetails;
      }

      const opts = { runValidators: true };

      const updatedDoc = await Order.findByIdAndUpdate(id, updateData, opts);
      if (!updatedDoc) {
        res.status(404).json({
          ok: true,
          error: {
            name: "id",
            message: `the document with following id doesn't exist in the collection ${COLLECTION_ORDERS}`,
          },
        });
        return;
      }

      res.json({
        ok: true,
        message: "Update the Id successfully",
        result: updatedDoc,
      });
    } catch (err) {
      const errMsg = formatterErrorFunc(err, COLLECTION_ORDERS);
      res.status(400).json({ error: errMsg });
    }
  }
);

//Delete ONE with ID- OK
router.delete(
  "/deleteOne/:id",
  validateId,
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const aggregateProduct = [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [id, "$_id"] },
                {
                  $or: [
                    { $eq: ["$status", "CANCELED"] },
                    { $eq: ["$status", "COMPLETED"] },
                  ],
                },
              ],
            },
          },
        },
      ];
      // const deleteDoc = await Order.findByIdAndDelete(id);
      const filter = {
        _id: new ObjectId(id),
        status: { $in: ["CANCELED", "COMPLETED"] },
      };
      const deleteDoc = await Order.findOneAndDelete(filter);
      // const deleteDoc = await Order.findOneAndDelete(a);
      if (!deleteDoc) {
        res.status(200).json({
          ok: true,
          noneExist: `Kh??ng t????n ta??i ????n ha??ng v????i tra??ng tha??i CANCELED ho????c COMPLETED trong c?? s???? d???? li????u ${COLLECTION_ORDERS}`,
        });
        return;
      }
      res.json({
        ok: true,
        message: "Delete the document in MongoDB successfully",
      });
    } catch (err) {
      const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_ORDERS);
      res.status(400).json({
        ok: false,
        message: "Failed to delete the document with ID",
        error: errMsgMongoDB,
      });
    }
  }
);
// //

// TASK 23----Get all products with totalPrice
// TASK 31----with totalPrice,Get all products that have shipped successfully- status:completed ; from date1 to date2
router.get("/totalPrice", function (req, res, next) {
  const { status, dateFrom, dateTo } = req.query;
  //convert date from string to date with the LocalZone of VietNam with format YYYY-MM-DD HH:MM:SS
  // let start = moment(dateFrom).utc().local().format('YYYY-MM-DD HH:mm:ss')
  // let end = moment(dateTo).utc().local().format('YYYY-MM-DD HH:mm:ss')

  let tmp_query = {
    $expr: {
      $and: [{ $eq: ["$status", "COMPLETED"] }],
    },
  };
  //task 31:  shipping order completely
  if (status === "COMPLETED" && dateFrom && dateTo) {
    let start = new Date(moment(dateFrom).utc().local().format("YYYY-MM-DD"));
    let end = new Date(moment(dateTo).utc().local().format("YYYY-MM-DD"));
    tmp_query = {
      $expr: {
        $and: [
          { $eq: ["$status", "COMPLETED"] },
          { $lte: [start, "$createdDate"] },
          { $gte: [end, "$createdDate"] },
        ],
      },
    };
  }
  //

  const aggregate = [
    { $unwind: "$orderDetails" },
    {
      $match: tmp_query,
    },
    {
      $addFields: {
        "orderDetails.totalPrice": {
          $sum: {
            $multiply: [
              "$orderDetails.price",
              "$orderDetails.quantity",
              {
                $divide: [{ $subtract: [100, "$orderDetails.discount"] }, 100],
              },
            ],
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        createdDate: { $first: "$createdDate" },
        shippedDate: { $first: "$shippedDate" },
        status: { $first: "$status" },
        customerId: { $first: "$customerId" },
        employeeId: { $first: "$employeeId" },
        orderDetails: {
          $push: {
            productId: "$orderDetails.productId",
            quantity: "$orderDetails.quantity",
            discount: "$orderDetails.discount",
            totalPrice: "$orderDetails.totalPrice",
          },
        },
        totalPriceOrder: { $sum: { $sum: "$orderDetails.totalPrice" } },
      },
    },
  ];
  findDocuments({ aggregate: aggregate }, COLLECTION_ORDERS)
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).json({ findFunction: "failed :v", err: err })
    );
});
//

//TASK 32-- the order that have the largest price from date to date
router.get("/bestTotalPrice", function (req, res, next) {
  const { dateFrom, dateTo } = req.query;
  //convert date from string to date with the LocalZone of VietNam with format YYYY-MM-DD HH:MM:SS
  // let start = moment(dateFrom).utc().local().format('YYYY-MM-DD HH:mm:ss')
  // let end = moment(dateTo).utc().local().format('YYYY-MM-DD HH:mm:ss')
  let tmpQuery = {
    $expr: {
      $and: [{ $ne: ["$status", "CANCELED"] }],
    },
  };

  if (dateFrom && dateTo) {
    let start = new Date(moment(dateFrom).utc().local().format("YYYY-MM-DD"));
    let end = new Date(moment(dateTo).utc().local().format("YYYY-MM-DD"));

    tmpQuery = {
      $expr: {
        $and: [
          { $ne: ["$status", "CANCELED"] },
          { $lte: [start, "$createdDate"] },
          { $gte: [end, "$createdDate"] },
        ],
      },
    };
  }

  const aggregate = [
    { $unwind: "$orderDetails" },
    {
      $match: tmpQuery,
    },
    {
      $addFields: {
        "orderDetails.totalPrice": {
          $sum: {
            $multiply: [
              "$orderDetails.price",
              "$orderDetails.quantity",
              {
                $divide: [{ $subtract: [100, "$orderDetails.discount"] }, 100],
              },
            ],
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        createdDate: { $first: "$createdDate" },
        shippedDate: { $first: "$shippedDate" },
        status: { $first: "$status" },
        customerId: { $first: "$customerId" },
        employeeId: { $first: "$employeeId" },
        orderDetails: {
          $push: {
            productId: "$orderDetails.productId",
            quantity: "$orderDetails.quantity",
            discount: "$orderDetails.discount",
            totalPrice: "$orderDetails.totalPrice",
          },
        },
        totalPriceOrder: { $sum: { $sum: "$orderDetails.totalPrice" } },
      },
    },
    {
      $sort: { totalPriceOrder: -1 },
    },
  ];
  findDocuments({ aggregate: aggregate }, COLLECTION_ORDERS)
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).json({ findFunction: "failed :v", err: err })
    );
});
//

//Showing orders with conditions
//----------------7;8;9;10;11;12;16
router.get("/search", function (req, res, next) {
  const { key, value, today } = req.query;
  let query = null;
  // Creates a regex of: /^value$/i
  let regexValue = new RegExp(["^", value, "$"].join(""), "i");
  //or new RegExp(`${value}`, "i")]
  let projection = null;
  let aggregate = [];
  switch (key) {
    case "status":
      query = { status: regexValue };
      if (today === "true") {
        const today = moment();
        query = {
          $expr: {
            $and: [
              { $status: regexValue },
              //Solution 01
              {
                createdDate: new Date(today.format("YYYY-MM-DD")),
              },
              //Solution 02
              // { "$eq": [ { "$year"      : "$createdDate" }, { "$year"      : new Date() } ] },
              // { "$eq": [ { "$month"     : "$createdDate" }, { "$month"     : new Date() } ] },
              // { "$eq": [ { "$dayOfMonth": "$createdDate" }, { "$dayOfMonth": new Date() } ] }
            ],
          },
        };
      }
      break;
    case "payment-type":
      query = { paymentType: regexValue };
      break;
    case "shipping-address":
      query = { shippingAddress: regexValue };
      break;
    case "customer-details":
      projection = { customerId: 0 };
      aggregate = [
        {
          $lookup: {
            from: "customers", // foreign collection name
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetail", // alias
          },
        },
      ];
      break;
    default:
      res.status(500).json({
        findFunction: "failed :v",
        err: "Sorry! Something wrong! Please recheck your query",
      });
      return;
  }
  findDocuments(
    { query: query, projection: projection, aggregate: aggregate },
    COLLECTION_ORDERS
  )
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).json({ findFunction: "failed :v", err: err })
    );
});
//

//Get products sold from date1 to date2-----------  task 20---21--- 28
router.get("/11sold",async function (req, res, next) {
  try{
  const {dateFrom, dateTo} = req.query;
  let start = new Date(moment(dateFrom).utc().local().format("YYYY-MM-DD"));
  let end = new Date(moment(dateTo).utc().local().format("YYYY-MM-DD"));

  const aggregate =[
    { $unwind: "$orderDetails" },
    {
      $match: {
        $expr: {
          $and: [
            { $gte: ["$createdDate", start] },
            { $lte: ["$createdDate", end] },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        status: {$first: "$status"},
        orderCode: {$first: "$orderCode"},
        createdDate: {$first: "$createdDate"},
        sendingDate: {$first: "$sendingDate"},
        receivedDate: {$first: "$receivedDate"},
        contactInfo: {$first: "$contactInfo"},
        paymentInfo: {$first: "$paymentInfo"},
        shippingInfo: {$first: "$shippingInfo"},
        totalPrice: {
          $sum: {
            $multiply: [
              "$orderDetails.price",
              "$orderDetails.quantity",
              {
                $divide: [
                  { $subtract: [100, "$orderDetails.discount"] },
                  100,
                ],
              },
            ],
          },
        },
      },
    },
    {$sort: { totalPrice: -1 }}
  ];
  const docs = await Order.aggregate(aggregate);
  res.json({ ok: true, results: docs });
} catch (err) {
  const errMsgMongoDB = formatterErrorFunc(err, COLLECTION_ORDERS);
  res.status(400).json({ ok: false, error: errMsgMongoDB });
}
}
);
//

//------------------------------------------------------------------------------------------------

module.exports = router;
