const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    items: [{
        // Storing denormalized data to keep a record of the sale at that time
        _id: false, // Don't save the _id for subdocuments
        name: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bill', billSchema);
