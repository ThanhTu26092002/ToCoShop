var express = require("express");
const Order = require("../models/Order");
var moment = require("moment");
var router = express.Router();
const { ObjectId } = require("mongodb");
const { formatterErrorFunc } = require("../utils/formatterError");
const { validateId } = require("../validations/commonValidators");
const {
  insertDocument,
  insertDocuments,
  updateDocument,
  updateDocuments,
  findDocument,
  findDocuments,
  deleteMany,
  deleteOneWithId,
} = require("../utils/MongodbHelper");
const Supplier = require("../models/Supplier");
const { COLLECTION_ORDERS } = require("../configs/constants");
const { LookupTransportation } = require("../configs/lookups");
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
    const id = new ObjectId(req.params.id);
    const docs = await Order.aggregate([
      { $match: { _id: id } },
      ...aggregateLookup,
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
    const { orderDetails } = data;
    //Kiểm tra xem sản phẩm còn trong kho trước khi cập nhật
    for (let i = 0; i < orderDetails.length; i++) {
      const attributeQuantity = orderDetails[i].quantity;
      const attributeName = orderDetails[i].productName;
      const attributeColor = orderDetails[i].color;
      const attributeSize = orderDetails[i].size;
      //Nếu dữ liệu đầu vào mà số lượng <=0 thì báo lỗi
      if (attributeQuantity <= 0) {
        const errMsg = formatterErrorFunc(
          {
            name: "Lỗi dữ liệu",
            message: `Số lượng sản phẩm  đặt mua phải lớn hơn 0`,
          },
          COLLECTION_ORDERS
        );
        res.status(400).json({ error: errMsg });
        return;
      }
      const attributeId = new ObjectId(orderDetails[i].productAttributeId);
      //1. Lấy danh sách sản phẩm đã unwind attributes.
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
      if(products.length < 1){
        const errMsg = formatterErrorFunc(
          {
            name: "Hết hàng",
            message: `Sản phẩm ${attributeName} size ${attributeSize}-màu ${attributeColor} không còn hàng trong kho `,
          },
          COLLECTION_ORDERS
        );
        res.status(400).json({ error: errMsg });
        return;
      }
      //Nếu có sản phẩm đáp ứng thì tiếp tục vòng lặp để kiểm tra sản phẩm tiếp theo
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
    console.log("show string time:", orderCode);

    data = { createdDate, ...data, orderCode };
    //Create a new blog post object
    const order = new Order(data);
    //Insert the product in our MongoDB database
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    const errMsg = formatterErrorFunc(err, COLLECTION_ORDERS);
    res.status(400).json({ error: errMsg });
  }
});

//
// router.get(
//   "/search-many",
//   validateSchema(search_deleteManyOrdersSchema),
//   function (req, res, next) {
//     const query = req.query;
//     findDocuments({ query: query }, COLLECTION_ORDERS)
//       .then((result) => res.status(200).json(result))
//       .catch((err) =>
//         res.status(500).json({ findFunction: "failed", err: err })
//       );
//   }
// );
// //

// //Insert Many  -- haven't validation yet
// router.post(
//   "/insert-many",
//   validateSchema(insertManyOrdersSchema),
//   function (req, res, next) {
//     const listData = req.body;

//     //convert type of [createdDate, shippedDate] from STRING to DATE with formatting 'YYYY-MM-DD
//     listData.map((order) => {
//       order.shippedDate = new Date(
//         moment(order.shippedDate).utc().local().format("YYYY-MM-DD")
//       );
//       order.createdDate = new Date(moment().utc().local().format("YYYY-MM-DD"));
//     });

//     insertDocuments(listData, COLLECTION_ORDERS)
//       .then((result) => {
//         res.status(200).json({ ok: true, result: result });
//       })
//       .catch((err) => {
//         res.json(500).json({ ok: false });
//       });
//   }
// );
// //

//Update One with _Id
router.patch("/updateOne/:id", validateId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
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
});
//

//
// router.get(
//   "/search-many",
//   validateSchema(search_deleteManyOrdersSchema),
//   function (req, res, next) {
//     const query = req.query;
//     findDocuments({ query: query }, COLLECTION_ORDERS)
//       .then((result) => res.status(200).json(result))
//       .catch((err) =>
//         res.status(500).json({ findFunction: "failed", err: err })
//       );
//   }
// );
// //

// //Insert Many  -- haven't validation yet
// router.post(
//   "/insert-many",
//   validateSchema(insertManyOrdersSchema),
//   function (req, res, next) {
//     const listData = req.body;

//     //convert type of [createdDate, shippedDate] from STRING to DATE with formatting 'YYYY-MM-DD
//     listData.map((order) => {
//       order.shippedDate = new Date(
//         moment(order.shippedDate).utc().local().format("YYYY-MM-DD")
//       );
//       order.createdDate = new Date(moment().utc().local().format("YYYY-MM-DD"));
//     });

//     insertDocuments(listData, COLLECTION_ORDERS)
//       .then((result) => {
//         res.status(200).json({ ok: true, result: result });
//       })
//       .catch((err) => {
//         res.json(500).json({ ok: false });
//       });
//   }
// );
// //

//Just update array products
router.patch("/updateOne_Products/:id", validateId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
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

    const opts = { runValidators: true };

    const updatedDoc = await Order.findByIdAndUpdate(id, updateData, opts);
    if (!updatedDoc) {
      res.status(404).json({
        ok: true,
        error: {
          name: "id",
          message: `the document with following id doesn't exist in the collection ${COLLECTION_CATEGORIES}`,
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
});
//

// //Update MANY
// router.patch(
//   "/update-many",
//   validateSchema(updateManyOrderSchema),
//   function (req, res, next) {
//     const query = req.query;
//     const newValues = req.body;
//     //if updating [createdDate, shippedDate]
//     //convert type of [createdDate, shippedDate] from STRING to DATE with formatting 'YYYY-MM-DD
//     if (newValues.shippedDate) {
//       newValues.shippedDate = new Date(
//         moment(newValues.shippedDate).utc().local().format("YYYY-MM-DD")
//       );
//     }
//     if (newValues.createdDate) {
//       newValues.createdDate = new Date(
//         moment(newValues.createdDate).utc().local().format("YYYY-MM-DD")
//       );
//     }
//     updateDocuments(query, newValues, COLLECTION_ORDERS)
//       .then((result) => {
//         res.status(201).json({ update: true, result: result });
//       })
//       .catch((err) => res.json({ update: false }));
//   }
// );
// //

//Delete ONE with ID
router.delete("/deleteOne/:id", validateId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteDoc = await Order.findByIdAndDelete(id);
    if (!deleteDoc) {
      res.status(200).json({
        ok: true,
        noneExist: `the document doesn't exist in the collection ${COLLECTION_ORDERS}`,
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
});
// //
// //Delete MANY
// router.delete(
//   "/delete-many",
//   validateSchema(search_deleteManyOrdersSchema),
//   function (req, res, next) {
//     const query = req.query;

//     deleteMany(query, COLLECTION_ORDERS)
//       .then((result) => res.status(200).json(result))
//       .catch((err) =>
//         res.status(500).json({ deleteFunction: "failed", err: err })
//       );
//   }
// );

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
router.get("/sold", function (req, res, next) {
  const { type, dateFrom, dateTo, top } = req.query;
  let start = new Date(moment(dateFrom).utc().local().format("YYYY-MM-DD"));
  let end = new Date(moment(dateTo).utc().local().format("YYYY-MM-DD"));

  let aggregate = [];
  switch (type) {
    case "products":
      aggregate = [
        {
          $match: {
            $expr: {
              $and: [
                { $ne: ["$status", "CANCELED"] },
                { $gte: ["$createdDate", start] },
                { $lte: ["$createdDate", end] },
              ],
            },
          },
        },
        {
          $unwind: "$orderDetails",
        },
        {
          $lookup: {
            from: "products", // foreign collection name
            localField: "orderDetails.productId",
            foreignField: "_id",
            pipeline: [{ $project: { categoryId: 0, supplierId: 0 } }],
            as: "productDetail", // alias
          },
        },
        {
          $group: {
            _id: "$orderDetails.productId",
            productDetail: { $first: "$productDetail" },
            listOrders: {
              $push: {
                orderId: "$_id",
                createdDate: "$createdDate",
                orderDetails: "$orderDetails",
              },
            },
          },
        },
      ];
      break;
    case "customers":
      aggregate = [
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
          $lookup: {
            from: "customers", // foreign collection name
            localField: "customerId",
            foreignField: "_id",
            // pipeline: [{$project: { : 0, supplierId: 0  }}],
            as: "customerDetail", // alias
          },
        },
        {
          $group: {
            _id: "$customerId",
            customerDetail: { $first: "$customerDetail" },
            totalAmount: {
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
      ];
      break;

    default:
      break;
  }
  let sort = { totalAmount: -1 };
  let limit = 50;
  if (top) limit = parseInt(top);
  let projection = { customerId: 0, employeeId: 0 };

  findDocuments(
    { aggregate: aggregate, sort: sort, limit: limit, projection: projection },
    COLLECTION_ORDERS
  )
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).json({ findFunction: "failed :v", err: err })
    );
});
//

//------------------------------------------------------------------------------------------------

module.exports = router;
