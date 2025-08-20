const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const { verifyToken } = require('./auth');


// POST: Save a new bill
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
            paymentMethod: req.body.paymentMethod // <-- ADD THIS LINE
        });

        const newBill = await bill.save();
        res.status(201).json(newBill);
    } catch (err) {
        console.error("Error saving bill:", err);
        res.status(400).json({ message: "Error saving bill" });
    }
});

// The GET and DELETE routes are correct and do not need to be changed.


// GET: Get all saved bills (no changes needed, but included for completeness)
router.get('/', verifyToken, async (req, res) => {
    try {
        const bills = await Bill.find().sort({ createdAt: -1 });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// --- NEW FEATURE: DELETE a bill by its ID ---
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const bill = await Bill.findByIdAndDelete(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }
        res.json({ message: "Bill deleted successfully" });
    } catch (err) {
        console.error("Error deleting bill:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
