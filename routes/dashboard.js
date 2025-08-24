const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const Product = require('../models/product');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        // 1. Get today's bills
        const todaysBills = await Bill.find({ createdAt: { $gte: todayStart, $lt: todayEnd } });
        let todaysCashSales = 0;
        let todaysOnlineSales = 0;
        todaysBills.forEach(bill => {
            if (bill.paymentMethod === 'Online') {
                todaysOnlineSales += bill.totalAmount;
            } else {
                todaysCashSales += bill.totalAmount;
            }
        });

        // --- NEW: Calculate Yesterday's Sales ---
        const yesterdaysBills = await Bill.find({ createdAt: { $gte: yesterdayStart, $lt: todayStart } });
        let yesterdaysTotalSales = 0;
        yesterdaysBills.forEach(bill => {
            yesterdaysTotalSales += bill.totalAmount;
        });

        // 2. Aggregate Top Selling Products for today
        const topSellingProducts = await Bill.aggregate([
            { $match: { createdAt: { $gte: todayStart } } },
            { $unwind: "$items" },
            { $group: { _id: "$items.name", totalQuantity: { $sum: "$items.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        // 3. Find products with low stock (quantity <= 5)
        const lowStockProducts = await Product.find({ quantity: { $lte: 5 } })
            .sort({ quantity: 1 })
            .limit(5);

        res.json({
            todaysCashSales,
            todaysOnlineSales,
            yesterdaysTotalSales, // New field
            todaysBillsCount: todaysBills.length,
            topSellingProducts,
            lowStockProducts
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
