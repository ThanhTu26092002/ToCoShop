const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const addressSchema = new Schema(
  {
    country: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    state: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    city: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    detailAddress: {
      type: String,
      trim: true,
      default: "unknown",
      maxLength: 500,
      required: true,
    },
  },
  { _id: false }
);

const contactInfoSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      maxLength: 50,
      required: true,
      default: "unknown",
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: 50,
      required: true,
      default: "unknown",
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [
        /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
        "Please input the correct formatting of telephone number",
      ],
      require: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxLength: 50,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng nhập đúng định dạng email",
      ],
    },
    address: {
      type: addressSchema,
      // required: true,
    },
  },
  { _id: false }
);

const shippingInfoSchema = new Schema(
  {
    transportationId: {
      type: Schema.Types.ObjectId,
      ref: "Transportation",
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
      maxLength: 50,
      required: true,
      default: "unknown",
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: 50,
      required: true,
      default: "unknown",
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [
        /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
        "Please input the correct formatting of telephone number",
      ],
    },
    address: {
      type: addressSchema,
      // required: true,
    },
    note: {
      type: String,
      trim: true,
      maxLength: 200,
    },
  },
  { _id: false }
);

const moreInfoSchema = new Schema(
  {
    cardNumber: {
      type: String,
      trim: true,
      match: [
        /^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
        "Please input the correct formatting of card number",
      ],
      required: true,
    },
    cardHolder: {
      type: String,
      trim: true,
      maxLength: 50,
      required: true,
    },

    expDate: {
      type: String,
      trim: true,
      match: [
        /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/,
        "Please input the correct formatting of Exp Date",
      ],
      required: true,
    },
    cvv: {
      type: String,
      trim: true,
      match: [
        /^[0-9]{3,4}$/,
        "Please input the correct formatting of Card Verification Value",
      ],
      required: true,
    },
  },
  { _id: false }
);

const paymentInfoSchema = new Schema(
  {
    paymentMethod: {
      type: String,
      trim: true,
      enum: ["COD", "CREDIT CARD"],
      required: true,
    },
    moreInfo: {
      type: moreInfoSchema,
      default: undefined,
    },
  },
  { _id: false }
);

const orderDetailSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    size: {
      type: String,
      required: true,
      enum: ["S", "M", "L", "XL", "XXL"],
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const handlerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      maxLength: 50,
    },
    action: {
      type: String,
      trim: true,
      maxLength: 500,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    sendingDate: {
      type: Date,
    },
    receivedDate: {
      type: Date,
    },
    status: {
      type: String,
      trim: true,
      enum: ["WAITING", "SHIPPING", "COMPLETED", "CANCELED"],
      default: "WAITING",
      required: true,
    },
    contactInfo: {
      type: contactInfoSchema,
      required: true,
    },
    shippingInfo: {
      type: shippingInfoSchema,
      // required: true,
    },
    paymentInfo: {
      type: paymentInfoSchema,
      // required: true,
    },
    orderDetails: {
      type: [orderDetailSchema],
      default: undefined,
    },
    handlers: {
      type: [handlerSchema],
      default: undefined,
    },
  },
  { strict: "throw" } // If the field haven't existed in MongooseSchema, throw error
);

//validateBeforeSave
orderSchema.set("validateBeforeSave", true);

const Order = model("Order", orderSchema);

module.exports = Order;
