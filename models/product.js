const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    barcode: {
        type: String,
        required: [true, 'Barcode is required.'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Product name is required.']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required.'],
        min: [0, 'Price cannot be negative.']
    },
    description: {
        type: String,
        required: false
    }, 
    quantity: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('Product', productSchema);
