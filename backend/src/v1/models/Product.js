
const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const productSchema = new Schema(
    {
        productCode:{
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
            unique: true,
            required: true
        },
        sizes:[
            Object,{
                size:{
                    type: String,
                    enum: ['S', 'M', 'L', 'XL', 'XXL']
                },
                price:Number,
                stock:Number,
                discount:{
                    type: Number,
                    min: [0,"phai lon hon hoac bang 0 va nho hon hoac bang 100"],
                    max: [100,"phai lon hon hoac bang 0 va nho hon hoac bang 100"]
                }
                
            }
        ],
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
        supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
        description: {
            type: String,
            trim: true,
            required: true
        },
        promotionPosition: [
            String
        ],
        coverImage: String,
        imageUrls: [
            Object,
            {
                imgUrl: {
                    type: String,
                },
                sortOrder: Number,
                
            }
        ]
    },
    
    {
        // QUERY
        query: {
            byName(name) {
                return this.where({ name: new RegExp(name, 'i') });
            },
        },
        // VIRTUALS
        virtuals: {
            total: {
                get() {
                    return (this.price * (100 - this.discount)) / 100;
                },
            },
            
        },
    },
);
// Include virtuals
productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

// validateBeforeSave
productSchema.set('validateBeforeSave', true);

const Product = model('Product', productSchema);

module.exports = Product;