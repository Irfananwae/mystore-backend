const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const Product = require('../models/product');
const { verifyToken } = require('../middleware/authMiddleware'); // Correct import

router.get('/stats', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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

        const topSellingProducts = await Bill.aggregate([
            { $match: { createdAt: { $gte: today } } },
            { $unwind: "$items" },
            { $group: { _id: "$items.name", totalQuantity: { $sum: "$items.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        const lowStockProducts = await Product.find({ quantity: { $lte: 5 } }).sort({ quantity: 1 }).limit(5);

        res.json({
            todaysCashSales,
            todaysOnlineSales,
            todaysBillsCount: todaysBills.length,
            topSellingProducts,
            lowStockProducts
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
