const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const { verifyToken } = require('../middleware/authMiddleware'); // Correct import

// GET Paginated Bills
router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skipIndex = (page - 1) * limit;

        const totalBills = await Bill.countDocuments();
        const bills = await Bill.find().sort({ createdAt: -1 }).limit(limit).skip(skipIndex);

        res.json({
            bills: bills,
            totalPages: Math.ceil(totalBills / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST New Bill
router.post('/', verifyToken, async (req, res) => {
    try {
        const formattedItems = req.body.items.map(item => ({
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
        }));
        const bill = new Bill({
            items: formattedItems,
            totalAmount: req.body.totalAmount,
            paymentMethod: req.body.paymentMethod
        });
        const newBill = await bill.save();
        res.status(201).json(newBill);
    } catch (err) {
        res.status(400).json({ message: "Error saving bill" });
    }
});

// DELETE Bill
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const bill = await Bill.findByIdAndDelete(req.params.id);
        if (!bill) return res.status(404).json({ message: "Bill not found" });
        res.json({ message: "Bill deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
