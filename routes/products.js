const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { verifyToken } = require('../middleware/authMiddleware'); // Correct import

// GET Paginated Products
router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skipIndex = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const products = await Product.find().sort({ name: 1 }).limit(limit).skip(skipIndex);

        res.json({
            products: products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET Product by Barcode
router.get('/:barcode', verifyToken, async (req, res) => {
    try {
        const product = await Product.findOne({ barcode: req.params.barcode });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST New Product
router.post('/', verifyToken, async (req, res) => {
    const product = new Product({
        barcode: req.body.barcode,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Product with this barcode already exists." });
        }
        res.status(400).json({ message: "Failed to add product" });
    }
});

// PUT Update Product
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: "Failed to update product" });
    }
});

// DELETE Product
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
