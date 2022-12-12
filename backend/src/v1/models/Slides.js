const mongoose = require('mongoose');
const {Schema, model } = mongoose;

const slidesSchema = new Schema(

    {
        title:{
            type: String,
            maxLength: 80,
            unique: true,
            required:true
        },
        description: {
            type: String,
            trim: true,
            maxLength: 500,
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        sortOrder:{
            type:Number,
            enum: [0,1,2,3,4,5],
            default: 0,
            required:true
        },
        status:{
            type: String,
            trim: true,
            enum: ["ACTIVE", "INACTIVE"],
        }
    }
)
slidesSchema.set('validateBeforeSave', true);
const Slides=model('Slides',slidesSchema);
module.exports = Slides