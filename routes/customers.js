const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const Bill = require('../models/bill');
const { verifyToken } = require('../middleware/authMiddleware');

// GET: Get all customers (paginated)
router.get('/', verifyToken, async (req, res) => { /* ... (Pagination logic here) ... */ });

// POST: Create a new customer
router.post('/', verifyToken, async (req, res) => { /* ... (Create logic here) ... */ });

// GET: Get a single customer's details and their bill history
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        const bills = await Bill.find({ customer: req.params.id }).sort({ createdAt: -1 });
        
        res.json({ customer, bills });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
