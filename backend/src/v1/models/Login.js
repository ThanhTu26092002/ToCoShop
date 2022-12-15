const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const roleSchema = new Schema();
const loginSchema = new Schema(
  {
    email: {
      type: String,
      trim: true, 
      unique: true,
      lowercase : true,
      maxLength: 50,
      required: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập đúng định dạng email'],
      // immutable: true, // not allow to update
  },
    password: {
      type: String,
      trim: true,
      maxLength: [50, "Mat khau không vượt quá 50 kí tự"],
      required: [true, "Mat khau không được để trống"],
    },
    roles: {
      type: [String],
      enum: {
        values: ["ADMINISTRATORS", "MANAGERS"],
        message: "Quyền người dùng phải là ADMINISTRATORS hay MANAGERS",
      },
      default: 'MANAGERS',
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
