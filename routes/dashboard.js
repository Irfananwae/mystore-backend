const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const Product = require('../models/product');
const { verifyToken } = require('./auth');

// GET /dashboard/stats - A dedicated endpoint for all dashboard data
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to the beginning of the current day

        // 1. Get bills created today
        const todaysBills = await Bill.find({ createdAt: { $gte: today } });

        let todaysSales = 0;
        todaysBills.forEach(bill => {
            todaysSales += bill.totalAmount;
        });

        // 2. Aggregate Top Selling Products for today
        const topSellingProducts = await Bill.aggregate([
            { $match: { createdAt: { $gte: today } } }, // Filter for today's bills
            { $unwind: "$items" }, // Deconstruct the items array
            { $group: {
                _id: "$items.name", // Group by product name
                totalQuantity: { $sum: "$items.quantity" } // Sum the quantity sold for each name
            }},
            { $sort: { totalQuantity: -1 } }, // Sort by the highest quantity
            { $limit: 5 } // Get the top 5
        ]);

        // 3. Find products with low stock (quantity <= 5)
        const lowStockProducts = await Product.find({ quantity: { $lte: 5 } })
            .sort({ quantity: 1 }) // Show the lowest stock first
            .limit(5);

        // 4. Send all stats in one response
        res.json({
            todaysSales: todaysSales,
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
