const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const { verifyToken } = require('./auth'); // Import the JWT verification middleware

// POST: Save a new bill (Protected)
router.post('/', verifyToken, async (req, res) => {
    const bill = new Bill({
        items: req.body.items,
        totalAmount: req.body.totalAmount
    });
    try {
        const newBill = await bill.save();
        res.status(201).json(newBill);
    } catch (err) {
        console.error("Error saving bill:", err);
        res.status(400).json({ message: "Error saving bill" });
    }
});

// GET: Get all saved bills (Protected)
router.get('/', verifyToken, async (req, res) => {
    try {
        const bills = await Bill.find().sort({ createdAt: -1 }); // Sort by newest first
        res.json(bills);
    } catch (err) {
        console.error("Error fetching all bills:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
