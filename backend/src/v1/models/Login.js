const mongoose = require('mongoose');
const {Schema, model } = mongoose;

const roleSchema = new Schema(

)
const userSchema = new Schema(
    {
        email: {
            type: String,
            trim: true,
            index: { unique: true },
            lowercase : true,
            maxLength:[ 50, 'Email không vượt quá 50 kí tự'],
            required: [true, 'Email không được để trống'],
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập đúng định dạng email']

        },
        password: {
            type: String,
            trim: true,
            maxLength:[ 50, 'Mat khau không vượt quá 50 kí tự'],
            required: [true, 'Mat khau không được để trống']
        },
        roles:{ 
            type: [String],
                enum: { values: ['administrators', 'managers',], message: 'Quyền người dùng phải là administrators hay managers'},
                // default: 'managers',
                validate: [v => Array.isArray(v) && v.length > 0, 'Bạn chưa nhập quyền cho người dùng'],

        },
        status: {
            type: String,
            trim: true,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE",
            required: true,
          },
    },
    {"strict": "throw"} // If the field haven't existed in MongooseSchema, throw error

);

//validateBeforeSave
userSchema.set('validateBeforeSave', true);


const User = model('user', userSchema);

module.exports = User;