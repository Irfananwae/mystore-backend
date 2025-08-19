const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// IMPORTANT: We need to import the verifyToken middleware from auth.js
// Make sure your auth.js file is exporting it like this: module.exports = { router, verifyToken };
const { verifyToken } = require('./auth');

// -------------------------------------------------------------------
// --- PUBLIC ROUTES (No login required) ---
// -------------------------------------------------------------------

/**
 * @route   GET /products/:barcode
 * @desc    Get a single product by its barcode for scanning
 * @access  Public
 */
router.get('/:barcode', async (req, res) => {
    try {
        const product = await Product.findOne({ barcode: req.params.barcode });
        if (!product) {
            return res.status(404).json({ message: 'Product not found with this barcode' });
        }
        res.status(200).json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// -------------------------------------------------------------------
// --- PROTECTED ROUTES (Login and valid JWT required) ---
// -------------------------------------------------------------------

/**
 * @route   GET /products
 * @desc    Get a list of all products for the management tab
 * @access  Private (requires token)
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        // We can add sorting, e.g., sort by name
        const products = await Product.find().sort({ name: 1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /products
 * @desc    Add a new product
 * @access  Private (requires token)
 */
router.post('/', verifyToken, async (req, res) => {
    const { barcode, name, price, quantity } = req.body;
    try {
        // Check if a product with this barcode already exists
        let product = await Product.findOne({ barcode });
        if (product) {
            return res.status(409).json({ message: 'Product with this barcode already exists' });
        }

        product = new Product({
            barcode,
            name,
            price,
            quantity: quantity || 0 // Set quantity to 0 if not provided
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct); // 201 means "Created"
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT /products/:id
 * @desc    Update a product's details (name, price, quantity) by its MongoDB _id
 * @access  Private (requires token)
 */
router.put('/:id', verifyToken, async (req, res) => {
    const { name, price, quantity } = req.body;
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (price) updatedFields.price = price;
    if (quantity !== undefined) updatedFields.quantity = quantity; // Allow setting quantity to 0

    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true } // This option returns the modified document
        );

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


/**
 * @route   DELETE /products/:id
 * @desc    Delete a product by its MongoDB _id
 * @access  Private (requires token)
 */
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        await product.deleteOne(); // Mongoose 6+ uses deleteOne()

        res.json({ message: 'Product removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
