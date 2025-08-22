const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // <-- NEW: Import JWT library
const Bill = require('../models/bill');
const Product = require('../models/product');

// --- THIS IS THE CRITICAL FIX ---
// The verifyToken function is now self-contained within this file.
// It no longer depends on the auth.js file, which resolves the crash.
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.sendStatus(403); // Forbidden
            } else {
                req.authData = authData;
                next();
            }
        });
    } else {
        res.sendStatus(403); // Forbidden
    }
}

// GET /dashboard/stats - A dedicated endpoint for all dashboard data
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to the beginning of the current day

        // 1. Get bills created today
        const todaysBills = await Bill.find({ createdAt: { $gte: today } });

        let todaysCashSales = 0;
        let todaysOnlineSales = 0;
        todaysBills.forEach(bill => {
            if (bill.paymentMethod === 'Online') {
                todaysOnlineSales += bill.totalAmount;
            } else {
                todaysCashSales += bill.totalAmount;
            }
        });

        // 2. Aggregate Top Selling Products for today
        const topSellingProducts = await Bill.aggregate([
            { $match: { createdAt: { $gte: today } } },
            { $unwind: "$items" },
            { $group: {
                _id: "$items.name",
                totalQuantity: { $sum: "$items.quantity" }
            }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        // 3. Find products with low stock (quantity <= 5)
        const lowStockProducts = await Product.find({ quantity: { $lte: 5 } })
            .sort({ quantity: 1 })
            .limit(5);

        // 4. Send all stats in one response
        res.json({
            todaysCashSales: todaysCashSales,
            todaysOnlineSales: todaysOnlineSales,
            todaysBillsCount: todaysBills.length,
            topSellingProducts: topSellingProducts,
            lowStockProducts: lowStockProducts
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server error fetching dashboard stats" });
    }
});

module.exports = router;
