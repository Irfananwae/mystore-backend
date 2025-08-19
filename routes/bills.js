const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');

// POST: Save a new bill
router.post('/', async (req, res) => {
    const bill = new Bill({
        items: req.body.items,
        totalAmount: req.body.totalAmount
    });
    try {
        const newBill = await bill.save();
        res.status(201).json(newBill);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET: Get all saved bills
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find();
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
