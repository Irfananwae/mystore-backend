const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { verifyToken } = require('./auth'); // Import the JWT verification middleware

// GET: Get a single product by its barcode. (Unprotected)
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

router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Default to 20 items per page
        const skipIndex = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const products = await Product.find()
            .sort({ name: 1 }) // Sort alphabetically
            .limit(limit)
            .skip(skipIndex);

        res.json({
            products: products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page
        });
    } catch (err) {
        console.error("Error fetching paginated products:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST: Add a new product to the database. (Protected)
router.post('/', verifyToken, async (req, res) => {
    const product = new Product({
        barcode: req.body.barcode,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity || 0
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Product with this barcode already exists." });
        }
        console.error("Error adding product:", err);
        res.status(400).json({ message: "Error saving product" });
    }
});
// PUT (Update): Update a product by its unique MongoDB ID. (Protected)
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
    // Inside routes/products.js

// ... (Your GET, POST, and PUT routes are all correct and do not need to change)

// --- NEW FEATURE: DELETE a product by its unique ID ---
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
