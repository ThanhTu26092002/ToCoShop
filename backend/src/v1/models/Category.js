const mongoose = require('mongoose');
const {Schema, model } = mongoose;


const categorySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: true,
            maxLength: 50,
            lowercase: true,
            required: true
        },
        description: {
            type: String,
            trim: true,
            maxLength: 500,
        },
        imageUrl: {
            type: String,
            trim: true,
        }
    },
    {"strict": "throw"} // If the field haven't existed in MongooseSchema, throw error
    // {
    //     //QUERY
    //     query: {
    //         byName(name){
    //             return this.where({ name: new RegExp(name, 'i')});
    //         },
    //     },
    //     //VIRTUALS
    //     virtuals: {
    //         total: {
    //             get(){
    //                 return (this.price * (100 - this.discount)) / 100;
    //             },
    //         },
    //     },
    // },
);
//Include virtuals
// productSchema.set('toObject', { virtuals: true});
// productSchema.set('toJSON', {virtuals: true});

//validateBeforeSave
categorySchema.set('validateBeforeSave', true);


const Category = model('Category', categorySchema);

module.exports = Category;