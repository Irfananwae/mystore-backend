const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { verifyToken } = require('./auth'); // Make sure the path to auth.js is correct

// GET: Get a single product by its barcode.
// This route is NOT protected because the billing screen needs it without a full login.
router.get('/:barcode', async (req, res) => {
    try {
        const product = await Product.findOne({ barcode: req.params.barcode });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error("Error finding product by barcode:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET: Get a list of ALL products.
// This route IS protected. Only a logged-in user can access it.
router.get('/', verifyToken, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error("Error fetching all products:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST: Add a new product to the database.
// This route IS protected.
router.post('/', verifyToken, async (req, res) => {
    const product = new Product({
        barcode: req.body.barcode,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity || 0 // Use provided quantity or default to 0
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        if (err.code === 11000) { // Duplicate barcode error
            return res.status(409).json({ message: "Product with this barcode already exists." });
        }
        console.error("Error adding product:", err);
        res.status(400).json({ message: "Error saving product" });
    }
});

// PUT (Update): Update a product by its unique MongoDB ID.
// This route IS protected.
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(updatedProduct);
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(400).json({ message: "Error updating product" });
    }
});

module.exports = router;
