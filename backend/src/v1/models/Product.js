const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const attributeSchema = new Schema(
  {
    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    color: {
      type: String,
      enum: ["Xanh Navy", "Vàng", "Xám", "Đen", "Hồng", "Trắng"],
      required: true,
    },
    price: {
      type: Number,
      min: [0, "phai lon hon hoac bang 0"],
      required: true,
    },
    stock: {
      type: Number,
      min: [0, "phai lon hon hoac bang 0 "],
      required: true,
    },
    discount: {
      type: Number,
      min: [0, "phai lon hon hoac bang 0 "],
      max: [100, "phai nho hon hoac bang 100"],
      required: true,
      default: 0,
    },
  },
);

const productSchema = new Schema(
  {
    productCode: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      maxLength: 10,
    },
    name: {
      type: String,
      trim: true,
      maxLength: 50,
      //   unique: true,
      required: true,
    },
    attributes: {
      type: [attributeSchema],
      required: [true, 'Vui lòng nhập chi tiết sản phẩm'],
      default: undefined,
    },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    promotionPosition: [String],
    coverImage: String,
    imageUrls: [
      Object,
      {
        imgUrl: {
          type: String,
        },
        sortOrder: {
          type: Number,
          enum: [0, 1, 2, 3, 4, 5],
          default: 0,
          required: true,
        },
      },
    ],
  },

  // {
  //   // QUERY
  //   query: {
  //     byName(name) {
  //       return this.where({ name: new RegExp(name, "i") });
  //     },
  //   },
  //   // VIRTUALS
  //   virtuals: {
  //     total: {
  //       get() {
  //         return (this.price * (100 - this.discount)) / 100;
  //       },
  //     },
  //   },
  // },
  { strict: "throw" } // If the field haven't existed in MongooseSchema, throw error

);
// Include virtuals
// productSchema.set("toObject", { virtuals: true });
// productSchema.set("toJSON", { virtuals: true });

// validateBeforeSave
productSchema.set("validateBeforeSave", true);

const Product = model("Product", productSchema);

module.exports = Product;
