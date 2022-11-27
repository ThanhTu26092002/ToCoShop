const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const roleSchema = new Schema();
const loginSchema = new Schema(
  {
    categoryId: { type: String, ref: 'Employee'},
    password: {
      type: String,
      trim: true,
      maxLength: [50, "Mat khau không vượt quá 50 kí tự"],
      required: [true, "Mat khau không được để trống"],
    },
    roles: {
      type: [String],
      enum: {
        values: ["administrators", "managers"],
        message: "Quyền người dùng phải là administrators hay managers",
      },
      // default: 'managers',
      validate: [
        (v) => Array.isArray(v) && v.length > 0,
        "Bạn chưa nhập quyền cho người dùng",
      ],
    },
    status: {
      type: String,
      trim: true,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      required: true,
    },
  },
  { strict: "throw" } // If the field haven't existed in MongooseSchema, throw error
);

//validateBeforeSave
loginSchema.set("validateBeforeSave", true);

const Login = model("Login", loginSchema);

module.exports = Login;
