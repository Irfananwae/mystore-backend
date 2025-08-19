const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    barcode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('Product', productSchema);
