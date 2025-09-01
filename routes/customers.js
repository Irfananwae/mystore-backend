const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const Bill = require('../models/bill');
const { verifyToken } = require('../middleware/authMiddleware');

// GET: Get all customers (for the list view and selection dialog)
router.get('/', verifyToken, async (req, res) => {
    try {
        const customers = await Customer.find().sort({ name: 1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: "Server error fetching customers" });
    }
});

// POST: Create a new customer
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const newCustomer = new Customer({ name, phone });
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "A customer with this phone number already exists." });
        }
        res.status(500).json({ message: 'Error creating customer' });
    }
});

// GET: Get a single customer's details AND their bill history
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        // Find all bills that are linked to this customer's ID
        const bills = await Bill.find({ customer: req.params.id }).sort({ createdAt: -1 });
        
        res.json({ customer, bills });
    } catch (error) {
        res.status(500).json({ message: "Server error fetching customer details" });
    }
});

module.exports = router;
