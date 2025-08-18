const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// API Endpoint to GET a single product by its barcode
// Example URL: GET /products/123456789
router.get('/:barcode', async (req, res) => {
    try {
        const product = await Product.findOne({ barcode: req.params.barcode });
        if (product == null) {
            return res.status(404).json({ message: 'Cannot find product with that barcode' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// API Endpoint to POST (create) a new product
// Example URL: POST /products
router.post('/', async (req, res) => {
    const product = new Product({
        barcode: req.body.barcode,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct); // 201 means "Created"
    } catch (err) {
        // This will catch validation errors or if the barcode already exists
        res.status(400).json({ message: 'Failed to create product: ' + err.message });
    }
});

module.exports = router;
