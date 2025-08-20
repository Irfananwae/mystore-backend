const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    items: [{
        _id: false,
        name: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    // --- NEW FEATURE ---
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash', 'Online'] // Ensures only these two values are possible
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bill', billSchema);
