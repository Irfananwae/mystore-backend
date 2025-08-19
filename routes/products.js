const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET: All products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Find a single product by its barcode
router.get('/:barcode', async (req, res) => {
    try {
        const product = await Product.findOne({ barcode: req.params.barcode });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Add a new product to the database
router.post('/', async (req, res) => {
    const product = new Product({
        barcode: req.body.barcode,
        name: req.body.name,
        price: req.body.price
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (Update): Update a product by its ID
router.put('/:id', async (req, res) => {
    try {
        // We find the product by its unique MongoDB _id
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
